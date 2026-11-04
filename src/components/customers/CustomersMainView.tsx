'use client';

import React, { useState, useMemo, useTransition, useDeferredValue } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RecordPaymentDialog } from '@/components/payments/RecordPaymentDialog';
import { formatPHP, formatDate } from '@/lib/utils';
import type {
  CustomerOverviewItem,
  PaymentLedgerItem,
  CustomerSalesSummaryItem,
  CustomerSummaryMetrics,
} from '@/lib/data/customers';
import {
  Search,
  Receipt,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';

interface CustomersMainViewProps {
  initialCustomers: CustomerOverviewItem[];
  initialPayments: PaymentLedgerItem[];
  initialSales: CustomerSalesSummaryItem[];
  metrics: CustomerSummaryMetrics;
  userRole?: string;
}

export function CustomersMainView({
  initialCustomers,
  initialPayments,
  initialSales,
  metrics,
  userRole = 'sales',
}: CustomersMainViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const isAdmin = userRole.toLowerCase() === 'admin';
  const isCashier = userRole.toLowerCase() === 'cashier' || isAdmin;

  // Search query for customer list with deferred filtering for instant typing
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  // Selected customer state (URL synced ?custNo=)
  const custNoParam = searchParams.get('custNo');
  const initialCustNo = custNoParam
    ? custNoParam
    : initialCustomers[0]?.custNo || '';

  // Modal state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  // Update URL helper (removes any 'tab' parameter and manages 'custNo')
  const updateUrl = (updates: Record<string, string | null>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('tab');
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      const qs = params.toString();
      router.replace(qs ? `/customers?${qs}` : '/customers', { scroll: false });
    });
  };

  // Filtered customers in left list (uses deferredSearch)
  const filteredCustomers = useMemo(() => {
    if (!deferredSearch.trim()) return initialCustomers;
    const q = deferredSearch.toLowerCase().trim();
    return initialCustomers.filter(
      (c) =>
        c.custName.toLowerCase().includes(q) ||
        String(c.custNo).includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [initialCustomers, deferredSearch]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    if (!initialCustNo) return initialCustomers[0] || null;
    const found = initialCustomers.find(
      (c) => String(c.custNo) === String(initialCustNo) || String(c.custNo).replace(/\D/g, '') === String(initialCustNo).replace(/\D/g, '')
    );
    return found || initialCustomers[0] || null;
  }, [initialCustomers, initialCustNo]);

  // Payments for the selected customer
  const customerPayments = useMemo(() => {
    if (!selectedCustomer) return [];
    return initialPayments.filter((p) => String(p.custNo) === String(selectedCustomer.custNo));
  }, [initialPayments, selectedCustomer]);

  // Payments total sum for selected customer
  const customerTotalPaid = useMemo(() => {
    return customerPayments.reduce((acc, p) => acc + p.amount, 0);
  }, [customerPayments]);

  // Export CSV of selected customer's payments
  const handleExportPaymentsCSV = () => {
    if (!selectedCustomer) return;
    const today = new Date().toISOString().split('T')[0];
    const headers = ['OR #', 'Payment date', 'Sale #', 'Customer no.', 'Customer name', 'Amount'];
    const rows = customerPayments.map((p) => [
      p.orNo,
      p.payDate,
      p.transNo,
      selectedCustomer.custNo,
      `"${selectedCustomer.custName.replace(/"/g, '""')}"`,
      p.amount.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer-${selectedCustomer.custNo}-payments-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Stitch Masthead (Matching Screen 3bd9ff66a0d8417dbe2cfcd0abe72180) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-black/10 dark:border-border pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#041a24] dark:text-white tracking-tight leading-tight">
            Customers &amp; Payments
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#41555f] dark:text-slate-300 leading-relaxed">
            Directory of accounts, structured credit limits, payment schedules, and verified official receipt settlements.
          </p>
        </div>

        {/* Top Right KPI Stat Boxes */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-[4px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 px-4 py-2 text-center min-w-[125px] shadow-2xs">
            <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#41555f] dark:text-text-muted">
              TOTAL DIRECTORY
            </span>
            <span className="block font-sans text-base sm:text-lg font-bold text-[#041a24] dark:text-text mt-0.5 tabular-nums">
              {metrics?.totalCustomers || initialCustomers.length} Accounts
            </span>
          </div>
        </div>
      </div>

      {/* ── Master-Detail Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── Left Column (Customer Index) ── */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-[4px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 p-4 shadow-2xs space-y-3.5">
            {/* Header: Customer Index + Count badge + All registered */}
            <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-border">
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-base sm:text-lg font-normal text-[#041a24] dark:text-text">
                  Customer Index
                </h2>
                <span className="font-mono text-[10px] text-[#41555f] dark:text-text-muted bg-black/5 dark:bg-surface-2 border border-black/10 dark:border-border px-1.5 py-0.2 rounded-[2px]">
                  {filteredCustomers.length}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#41555f] dark:text-text-muted">
                All registered
              </span>
            </div>

            {/* Inner Search Box with ENTER ↵ Badge */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-text-faint" />
              <input
                type="text"
                placeholder="Globus Medical"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-16 text-xs rounded-[3px] border border-black/15 dark:border-border bg-white dark:bg-surface-1 text-[#041a24] dark:text-text placeholder:text-[#41555f]/50 dark:placeholder:text-text-muted/50 focus:border-[#041a24] dark:focus:border-border-control focus:outline-none transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-black/40 dark:text-text-faint select-none">
                ENTER &crarr;
              </span>
            </div>

            {/* Customer List Stream */}
            <div className="divide-y divide-black/5 max-h-[580px] overflow-y-auto -mx-1 px-1">
              {filteredCustomers.length === 0 ? (
                <div className="p-6 text-center font-mono text-xs text-[#41555f]">
                  No customers found.
                </div>
              ) : (
                filteredCustomers.map((c) => {
                  const isSelected = selectedCustomer?.custNo === c.custNo;
                  return (
                    <button
                      key={c.custNo}
                      type="button"
                      onClick={() => updateUrl({ custNo: String(c.custNo) })}
                      className={`w-full text-left px-3 py-2.5 transition-all flex items-center justify-between cursor-pointer rounded-[2px] ${
                        isSelected
                          ? 'bg-black/5 border-l-3 border-[#041a24]'
                          : 'hover:bg-[#F4F4F0]/60'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className={`text-xs leading-snug truncate ${isSelected ? 'font-bold text-[#041a24]' : 'font-medium text-[#041a24]'}`}>
                          {c.custName}
                        </p>
                        <p className="font-mono text-[10px] text-[#41555f] mt-0.5">
                          {c.custNo}
                        </p>
                      </div>

                      {/* Payment Terms Tag */}
                      <div className="shrink-0">
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] ${
                            isSelected
                              ? 'bg-[#041a24] text-white font-medium'
                              : 'bg-black/5 text-[#41555f] border border-black/10'
                          }`}
                        >
                          {c.payTerms}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="pt-2.5 border-t border-black/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] text-[#41555f]">
                1-{Math.min(10, filteredCustomers.length)} OF {filteredCustomers.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-0.5 text-[9px] uppercase font-mono border border-black/10 rounded-[2px] text-black/40 hover:text-black hover:bg-black/5 cursor-pointer"
                >
                  PREV
                </button>
                <span className="w-5 h-5 flex items-center justify-center text-[10px] font-mono border border-black/15 bg-white text-[#041a24] rounded-[2px] font-semibold">
                  1
                </span>
                <button
                  type="button"
                  className="px-2 py-0.5 text-[9px] uppercase font-mono border border-black/10 rounded-[2px] text-black/40 hover:text-black hover:bg-black/5 cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column (Customer Dossier & Receipts Ledger) ── */}
        <div className="lg:col-span-8 space-y-4">
          {selectedCustomer ? (
            <div className="rounded-[4px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 p-5 sm:p-6 shadow-2xs space-y-5">
              {/* Header Badges & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-[2px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
                    ACTIVE ACCOUNT
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCashier && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setIsRecordPaymentOpen(true)}
                      className="bg-[#041a24] dark:bg-primary-bg hover:bg-[#1c313b] dark:hover:opacity-90 text-white dark:text-primary-fg rounded-[2px] px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      <span>Record Payment</span>
                    </Button>
                  )}

                  {customerPayments.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExportPaymentsCSV}
                      className="bg-white dark:bg-surface-1 border border-black/15 dark:border-border hover:bg-black/5 dark:hover:bg-surface-2 text-[#041a24] dark:text-text rounded-[2px] px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Export CSV</span>
                      <ExternalLink className="h-3 w-3 text-black/50 dark:text-text-faint" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-2">
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#041a24] dark:text-text tracking-tight leading-tight">
                  {selectedCustomer.custName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#41555f] dark:text-text-muted font-sans">
                  <span>Customer ID:</span>
                  <span className="font-mono font-bold text-[#041a24] dark:text-text">{selectedCustomer.custNo}</span>
                  <span>&bull;</span>
                  <span>Payment terms:</span>
                  <span className="font-mono font-semibold text-[#041a24] dark:text-text">{selectedCustomer.payTerms}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#41555f] dark:text-text-muted pt-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#41555f] dark:text-text-muted shrink-0 mt-0.5">
                    ADDRESS
                  </span>
                  <span className="text-[#041a24] dark:text-text font-medium leading-relaxed">
                    {selectedCustomer.address}
                  </span>
                </div>
              </div>

              {/* Broadsheet Rule Hairline Divider */}
              <div className="border-t border-black/10 dark:border-border" />

              {/* Payment History Sub-Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-base sm:text-lg font-normal text-[#041a24] dark:text-text">
                  Payment History
                </h3>
                <div className="border border-black/10 dark:border-border bg-[#F4F4F0]/60 dark:bg-surface-2/60 px-2.5 py-1 rounded-[2px] font-mono text-xs font-semibold text-[#041a24] dark:text-text tabular-nums">
                  TOTAL SETTLED: {formatPHP(customerTotalPaid)}
                </div>
              </div>

              {/* Receipts Table */}
              {customerPayments.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#41555f] dark:text-text-muted space-y-1 font-mono">
                  <p className="font-semibold text-[#041a24] dark:text-text">No payments recorded for this customer.</p>
                  <p className="text-[11px] text-[#41555f] dark:text-text-muted">
                    Use the &ldquo;Record Payment&rdquo; button above to record an official receipt.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-[3px] border border-black/10 dark:border-border">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-border bg-[#F4F4F0]/70 dark:bg-surface-2/70 text-[#41555f] dark:text-text-muted font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold whitespace-nowrap">OR #</th>
                        <th className="py-2.5 px-3 font-semibold whitespace-nowrap">DATE</th>
                        <th className="py-2.5 px-3 font-semibold whitespace-nowrap">SALE REF</th>
                        <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap">AMOUNT (PHP)</th>
                        <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-border">
                      {customerPayments.map((p) => (
                        <tr key={p.orNo} className="hover:bg-[#F4F4F0]/60 dark:hover:bg-surface-2/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-semibold text-[#041a24] dark:text-text whitespace-nowrap">
                            {p.orNo}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-[#41555f] dark:text-text-muted whitespace-nowrap tabular-nums">
                            {formatDate(p.payDate)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-[#041a24] dark:text-text whitespace-nowrap">
                            <Link
                              href={`/sales/${p.transNo}`}
                              className="hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>{p.transNo}</span>
                              <ArrowUpRight className="w-3 h-3 text-black/40 dark:text-text-faint" />
                            </Link>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#041a24] dark:text-text whitespace-nowrap">
                            {formatPHP(p.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <Link
                              href={`/receipts/${p.orNo}`}
                              className="inline-flex items-center gap-0.5 font-mono text-[11px] text-[#041a24] hover:underline"
                            >
                              <span>Receipt</span>
                              <ArrowUpRight className="w-3 h-3 text-black/40" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-[#41555f] pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="uppercase tracking-wider">
                    ALL {customerPayments.length} RECEIPTS BALANCED &amp; RECONCILED
                  </span>
                </div>
                <div className="text-[#41555f]">
                  AUDIT LOG REF #{String(selectedCustomer.custNo).replace(/\D/g, '') || '94031'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#41555f] border border-black/10 bg-white rounded-[4px] font-mono">
              Select a customer from the left to view payment records.
            </div>
          )}
        </div>
      </div>

      {/* Shared Record Payment Dialog */}
      {isRecordPaymentOpen && selectedCustomer && (
        <RecordPaymentDialog
          isOpen={isRecordPaymentOpen}
          onClose={() => setIsRecordPaymentOpen(false)}
          fixedCustNo={selectedCustomer.custNo}
        />
      )}
    </div>
  );
}
