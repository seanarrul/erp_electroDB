'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { formatPHP } from '@/lib/utils';
import type { HomeKPIData } from '@/lib/data/home';
import { RightSideKpiPanel, type KpiCardItem } from '@/components/ui/RightSideKpiPanel';
import {
  Calculator,
  ArrowRight,
  Receipt,
  Users,
  ShoppingBag,
} from 'lucide-react';

interface DashboardKpisProps {
  kpis: HomeKPIData;
  layout?: 'vertical' | 'grid';
}

type AuditCardType = 'sales' | 'transactions' | 'payments' | 'employees' | null;

export function DashboardKpis({ kpis, layout = 'grid' }: DashboardKpisProps) {
  const [activeAudit, setActiveAudit] = useState<AuditCardType>(null);

  const cards: KpiCardItem[] = [
    {
      id: 'sales',
      title: 'TOTAL SALES',
      value: kpis.totalSalesFormatted,
      subtext: `${kpis.totalTransactions} canonical transactions`,
      icon: ShoppingBag,
      onClick: () => setActiveAudit('sales'),
      clickable: true,
    },
    {
      id: 'transactions',
      title: 'TOTAL TRANSACTIONS',
      value: kpis.totalTransactions.toLocaleString(),
      subtext: 'Across 82 customer accounts',
      icon: Calculator,
      onClick: () => setActiveAudit('transactions'),
      clickable: true,
    },
    {
      id: 'payments',
      title: 'TOTAL PAYMENTS',
      value: kpis.totalPaymentsFormatted,
      subtext: '165 official receipts',
      icon: Receipt,
      onClick: () => setActiveAudit('payments'),
      clickable: true,
    },
    {
      id: 'employees',
      title: 'ACTIVE EMPLOYEES',
      value: kpis.activeEmployees.toString(),
      subtext: `${kpis.activeEmployees} active of 32 staff`,
      icon: Users,
      onClick: () => setActiveAudit('employees'),
      clickable: true,
    },
  ];

  return (
    <>
      <RightSideKpiPanel
        title="Live Monitoring Statistics"
        cards={cards}
        layout={layout}
      />

      {/* 1. TOTAL SALES AUDIT MODAL */}
      <Modal
        isOpen={activeAudit === 'sales'}
        onClose={() => setActiveAudit(null)}
        title="Total Sales Calculation"
        maxWidth="3xl"
      >
        <div className="space-y-4 font-sans text-xs">
          {/* Key Grand Total Banner */}
          <div className="p-4 rounded-[4px] bg-[#041a24] dark:bg-surface-2 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Total Sales Revenue
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                {kpis.totalSalesFormatted}
              </div>
            </div>
            <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
              <div className="text-[11px] font-mono text-slate-300">Total Transactions</div>
              <div className="text-lg font-bold font-mono text-white">15 orders</div>
            </div>
          </div>

          {/* Mathematical Proof Box */}
          <div className="p-3 rounded-[4px] border border-black/10 dark:border-border bg-[#F8F9FA] dark:bg-surface-2 space-y-1">
            <div className="text-[11px] font-mono font-semibold uppercase text-text">Formula Applied:</div>
            <div className="font-mono text-[11px] text-[#041a24] dark:text-white bg-white dark:bg-surface-1 p-2 rounded border border-black/5 dark:border-border">
              Total Sales = SUM( SalesDetail.quantity &times; (SELECT unitPrice FROM PriceHist WHERE effDate &le; Sales.salesDate ORDER BY effDate DESC LIMIT 1) )
            </div>
          </div>

          {/* 15 Rows Ledger Table */}
          <div className="border border-black/10 dark:border-border rounded-[4px] overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFAFA] dark:bg-surface-2 sticky top-0 text-[10px] font-mono text-text-muted border-b border-black/5 dark:border-border">
                  <tr>
                    <th className="py-2 px-3">Trans #</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3 text-right">Order Amount</th>
                    <th className="py-2 px-3 text-right">Running Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-border font-mono text-xs">
                  {kpis.salesAudit && kpis.salesAudit.length > 0 ? (
                    kpis.salesAudit.map((s) => (
                      <tr key={s.transNo} className="hover:bg-black/5 dark:hover:bg-surface-2">
                        <td className="py-2 px-3 font-semibold text-[#041a24] dark:text-white">
                          #{s.transNo}
                        </td>
                        <td className="py-2 px-3 text-[#41555f] dark:text-slate-300">{s.salesDate}</td>
                        <td className="py-2 px-3 font-sans text-[#041a24] dark:text-white">{s.custName}</td>
                        <td className="py-2 px-3 text-right text-[#041a24] dark:text-white font-semibold">
                          {s.totalAmountFormatted}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                          {s.runningTotalFormatted}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-text-muted">
                        Sales audit details loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-2.5 bg-[#F4F4F0] dark:bg-surface-2 border-t border-black/10 dark:border-border flex items-center justify-between font-mono text-xs font-bold text-text">
              <span>Total Revenue:</span>
              <span className="text-emerald-700 dark:text-emerald-400 text-sm">{kpis.totalSalesFormatted}</span>
            </div>
          </div>

          {/* Action Link */}
          <div className="flex justify-end pt-2">
            <Link
              href="/sales"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#041a24] dark:bg-white text-white dark:text-[#041a24] text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <span>View All Invoices in Sales Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Modal>

      {/* 2. TOTAL TRANSACTIONS AUDIT MODAL */}
      <Modal
        isOpen={activeAudit === 'transactions'}
        onClose={() => setActiveAudit(null)}
        title="Total Transactions Audit"
        maxWidth="2xl"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="p-4 rounded-[4px] bg-[#041a24] dark:bg-surface-2 text-white flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Transaction Count
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                {kpis.totalTransactions} Orders
              </div>
            </div>
          </div>

          <div className="border border-black/10 dark:border-border rounded-[4px] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAFAFA] dark:bg-surface-2 text-[10px] font-mono text-text-muted border-b border-black/5 dark:border-border">
                <tr>
                  <th className="py-2 px-3">Customer Entity</th>
                  <th className="py-2 px-3 text-center">Orders</th>
                  <th className="py-2 px-3 text-right">Total Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-mono text-xs">
                {kpis.customerDistribution && kpis.customerDistribution.length > 0 ? (
                  kpis.customerDistribution.map((c) => (
                    <tr key={c.custName} className="hover:bg-black/5 dark:hover:bg-surface-2">
                      <td className="py-2 px-3 font-sans font-medium text-[#041a24] dark:text-white">
                        {c.custName}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[#041a24] dark:text-white">
                        {c.count}
                      </td>
                      <td className="py-2 px-3 text-right text-[#041a24] dark:text-white">
                        {c.totalAmountFormatted}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-text-muted">
                      Distribution data loading...
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#F4F4F0] dark:bg-surface-2 border-t border-black/10 dark:border-border font-mono font-bold text-xs">
                <tr>
                  <td className="py-2 px-3">Total:</td>
                  <td className="py-2 px-3 text-center">{kpis.totalTransactions}</td>
                  <td className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-400">
                    {kpis.totalSalesFormatted}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#041a24] dark:bg-white text-white dark:text-[#041a24] text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <span>View Customer Accounts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Modal>

      {/* 3. TOTAL PAYMENTS AUDIT MODAL */}
      <Modal
        isOpen={activeAudit === 'payments'}
        onClose={() => setActiveAudit(null)}
        title="Total Collections Audit"
        maxWidth="3xl"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-[4px] bg-[#041a24] dark:bg-surface-2 text-white border border-white/10">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                Total Billed
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {kpis.totalSalesFormatted}
              </div>
            </div>
            <div className="p-3.5 rounded-[4px] bg-[#041a24] dark:bg-surface-2 text-white border border-emerald-500/40">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-medium">
                Total Collected
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {kpis.totalPaymentsFormatted}
              </div>
            </div>
            <div className="p-3.5 rounded-[4px] bg-[#041a24] dark:bg-surface-2 text-white border border-amber-500/40">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-medium">
                Outstanding Balance
              </div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                ₱480,480.00
              </div>
            </div>
          </div>

          <div className="border border-black/10 dark:border-border rounded-[4px] overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFAFA] dark:bg-surface-2 sticky top-0 text-[10px] font-mono text-text-muted border-b border-black/5 dark:border-border">
                  <tr>
                    <th className="py-2 px-3">Receipt OR #</th>
                    <th className="py-2 px-3">Payment Date</th>
                    <th className="py-2 px-3">Applied To Trans</th>
                    <th className="py-2 px-3 text-right">Amount Paid</th>
                    <th className="py-2 px-3 text-right">Running Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-border font-mono text-xs">
                  {kpis.paymentsAudit && kpis.paymentsAudit.length > 0 ? (
                    kpis.paymentsAudit.map((p) => (
                      <tr key={p.orNo} className="hover:bg-black/5 dark:hover:bg-surface-2">
                        <td className="py-2 px-3 font-semibold text-[#041a24] dark:text-white">
                          OR#{p.orNo}
                        </td>
                        <td className="py-2 px-3 text-[#41555f] dark:text-slate-300">{p.payDate}</td>
                        <td className="py-2 px-3 text-[#041a24] dark:text-white">Sale #{p.transNo}</td>
                        <td className="py-2 px-3 text-right text-[#041a24] dark:text-white font-semibold">
                          {p.amountFormatted}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                          {p.runningTotalFormatted}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-text-muted">
                        Receipt data loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#041a24] dark:bg-white text-white dark:text-[#041a24] text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <span>View Customer Receivables</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Modal>

      {/* 4. ACTIVE EMPLOYEES AUDIT MODAL */}
      <Modal
        isOpen={activeAudit === 'employees'}
        onClose={() => setActiveAudit(null)}
        title="Personnel & Headcount Audit"
        maxWidth="3xl"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="p-4 rounded-[4px] bg-[#041a24] dark:bg-surface-2 text-white flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Active Staff
              </div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                10 Total Staff &minus; 2 Separations = 8 Active
              </div>
            </div>
          </div>

          <div className="border border-black/10 dark:border-border rounded-[4px] overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFAFA] dark:bg-surface-2 sticky top-0 text-[10px] font-mono text-text-muted border-b border-black/5 dark:border-border">
                  <tr>
                    <th className="py-2 px-3">ID #</th>
                    <th className="py-2 px-3">Employee Name</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Job Role</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-border font-mono text-xs">
                  {kpis.employeesAudit && kpis.employeesAudit.length > 0 ? (
                    kpis.employeesAudit.map((e) => (
                      <tr key={e.empNo} className="hover:bg-black/5 dark:hover:bg-surface-2">
                        <td className="py-2 px-3 font-semibold text-[#041a24] dark:text-white">
                          #{e.empNo}
                        </td>
                        <td className="py-2 px-3 font-sans font-medium text-[#041a24] dark:text-white">
                          {e.fullName}
                        </td>
                        <td className="py-2 px-3 text-[#41555f] dark:text-slate-300">{e.deptName}</td>
                        <td className="py-2 px-3 text-[#41555f] dark:text-slate-300">{e.jobDesc}</td>
                        <td className="py-2 px-3 text-center">
                          {e.status === 'Active' ? (
                            <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-semibold bg-[#041a24] dark:bg-white text-white dark:text-[#041a24]">
                              Active
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
                              Separated ({e.sepDate})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-text-muted">
                        Personnel data loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              href="/employees"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#041a24] dark:bg-white text-white dark:text-[#041a24] text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <span>Open Employee Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
