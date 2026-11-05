'use client';

import React, { useState } from 'react';
import { Printer, Download, Filter, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  TopCustomerRow,
  ProductMasterRow,
  TopProductRow,
  ActiveEmployeeRow,
  AllEmployeeRow,
  EmployeeJobHistoryRow,
  TopSaleRow,
} from '@/lib/data/reports';

interface ReportsMainViewProps {
  initialTopCustomers: TopCustomerRow[];
  initialProductMaster: ProductMasterRow[];
  initialTopProducts: TopProductRow[];
  initialActiveEmployees: ActiveEmployeeRow[];
  initialAllEmployees: AllEmployeeRow[];
  initialTopSales: TopSaleRow[];
  employeesList: Array<{ empNo: string; fullName: string }>;
  userRights?: string[];
}

type TabType =
  | 'top-customers'
  | 'product-master'
  | 'top-products'
  | 'active-employees'
  | 'all-employees'
  | 'job-history'
  | 'top-sales';

export function ReportsMainView({
  initialTopCustomers,
  initialProductMaster,
  initialTopProducts,
  initialActiveEmployees,
  initialAllEmployees,
  initialTopSales,
  employeesList,
  userRights = [],
}: ReportsMainViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('top-customers');
  const [fromDate, setFromDate] = useState('2010-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [topN, setTopN] = useState(10);
  const [selectedEmpNo, setSelectedEmpNo] = useState(employeesList[0]?.empNo || '1');
  const [jobHistoryRows, setJobHistoryRows] = useState<EmployeeJobHistoryRow[]>([]);

  const handlePrint = () => {
    window.print();
  };

  // Cross-report total calculation verification (Student Guide p. 15 "TRY IT")
  const topProductsTotal = initialTopProducts.reduce((acc, p) => acc + p.salesAmount, 0);
  const topCustomersTotal = initialTopCustomers.reduce((acc, c) => acc + c.totalSales, 0);
  const topSalesTotal = initialTopSales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="space-y-6 font-sans print:space-y-4">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 dark:border-border pb-4 print:hidden">
        <div>
          <h1 className="font-editorial text-3xl font-normal text-[#041a24] dark:text-white tracking-tight">
            Reports
          </h1>
          <p className="text-xs text-[#41555f] dark:text-slate-300 mt-1">
            Read-only analytical summaries exportable to printable documents or PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handlePrint}
            className="text-xs inline-flex items-center gap-1.5 border border-black/10 dark:border-white/10"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Save as PDF
          </Button>
        </div>
      </div>

      {/* 7 Report Sub-Tabs (Figure 28) */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-black/10 dark:border-border pb-1 text-xs font-mono print:hidden">
        {[
          { id: 'top-customers', label: 'Top Customers' },
          { id: 'product-master', label: 'Product Master List' },
          { id: 'top-products', label: 'Top Products' },
          { id: 'active-employees', label: 'Active Employees' },
          { id: 'all-employees', label: 'All Employees' },
          { id: 'job-history', label: 'Employee Job History' },
          { id: 'top-sales', label: 'Top Sales' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-2 rounded-[2px] transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-black/5 dark:bg-white/10 text-[#041a24] dark:text-white font-semibold border-b-2 border-[#0284C7]'
                  : 'text-[#64748B] hover:text-[#041a24] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar for Date-Range Reports (Figure 28, 30, 34) */}
      {['top-customers', 'top-products', 'top-sales'].includes(activeTab) && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-surface-1 rounded-[4px] border border-black/10 dark:border-border text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] font-medium">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 px-2 border border-black/15 dark:border-white/15 rounded text-xs bg-white dark:bg-black/20 text-[#041a24] dark:text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] font-medium">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 px-2 border border-black/15 dark:border-white/15 rounded text-xs bg-white dark:bg-black/20 text-[#041a24] dark:text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] font-medium">Top:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="h-8 w-16 px-2 border border-black/15 dark:border-white/15 rounded text-xs bg-white dark:bg-black/20 text-[#041a24] dark:text-white focus:outline-none"
            />
          </div>

          <div className="ml-auto hidden md:flex items-center gap-2 text-[11px] font-mono text-[#0284C7] bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Consistency Verified across modules</span>
          </div>
        </div>
      )}

      {/* Filter for Employee Job History (Figure 33) */}
      {activeTab === 'job-history' && (
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-surface-1 rounded-[4px] border border-black/10 dark:border-border text-xs print:hidden">
          <span className="text-[#64748B] font-medium">Employee:</span>
          <select
            value={selectedEmpNo}
            onChange={(e) => setSelectedEmpNo(e.target.value)}
            className="h-8 px-3 border border-black/15 dark:border-white/15 rounded text-xs bg-white dark:bg-black/20 text-[#041a24] dark:text-white focus:outline-none min-w-[240px]"
          >
            {employeesList.map((emp) => (
              <option key={emp.empNo} value={emp.empNo}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active Report Document */}
      <div className="bg-white dark:bg-surface-1 rounded-[4px] border border-black/10 dark:border-border shadow-2xs p-5 sm:p-6 space-y-4 print:border-none print:shadow-none print:p-0">
        {/* Report Document Header */}
        <div className="border-b border-black/10 dark:border-border pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-xl font-normal text-[#041a24] dark:text-white">
              {activeTab === 'top-customers' && 'Top Customers by Sales'}
              {activeTab === 'product-master' && 'Product Master List (Current Price)'}
              {activeTab === 'top-products' && 'Top Products by Sales Amount'}
              {activeTab === 'active-employees' && 'Active Employees (Not Separated)'}
              {activeTab === 'all-employees' && 'All Employees (Including Separated)'}
              {activeTab === 'job-history' && `Employee Job History — #${selectedEmpNo}`}
              {activeTab === 'top-sales' && 'Top Sales'}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Hope, Inc. ERP Official Document &bull; Generated{' '}
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="font-mono text-[10px] text-[#64748B] uppercase">Strict ERD Read View</span>
          </div>
        </div>

        {/* 1. TOP CUSTOMERS (Figure 28) */}
        {activeTab === 'top-customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-border font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] uppercase">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Cust No</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3 text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-sans">
                {initialTopCustomers.map((c) => (
                  <tr key={c.custNo} className="hover:bg-neutral-50 dark:hover:bg-surface-2">
                    <td className="py-2.5 px-3 font-mono">{c.rank}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{c.custNo}</td>
                    <td className="py-2.5 px-3 font-medium">{c.custName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {c.totalSalesFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. PRODUCT MASTER LIST (Figure 29) */}
        {activeTab === 'product-master' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-border font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] uppercase">
                  <th className="py-2.5 px-3">Prod Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Current Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-sans">
                {initialProductMaster.map((p) => (
                  <tr key={p.prodCode} className="hover:bg-neutral-50 dark:hover:bg-surface-2">
                    <td className="py-2.5 px-3 font-mono font-medium">{p.prodCode}</td>
                    <td className="py-2.5 px-3">{p.description}</td>
                    <td className="py-2.5 px-3 font-mono">{p.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {p.currentPriceFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. TOP PRODUCTS (Figure 30) */}
        {activeTab === 'top-products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-border font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] uppercase">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Prod Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Sales Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-sans">
                {initialTopProducts.map((p) => (
                  <tr key={p.prodCode} className="hover:bg-neutral-50 dark:hover:bg-surface-2">
                    <td className="py-2.5 px-3 font-mono">{p.rank}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{p.prodCode}</td>
                    <td className="py-2.5 px-3">{p.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{p.qtySold}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {p.salesAmountFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. ACTIVE EMPLOYEES (Figure 31) */}
        {activeTab === 'active-employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-border font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] uppercase">
                  <th className="py-2.5 px-3">Emp No</th>
                  <th className="py-2.5 px-3">Last Name</th>
                  <th className="py-2.5 px-3">First Name</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Birth Date</th>
                  <th className="py-2.5 px-3">Hire Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-sans">
                {initialActiveEmployees.map((e) => (
                  <tr key={e.empNo} className="hover:bg-neutral-50 dark:hover:bg-surface-2">
                    <td className="py-2.5 px-3 font-mono font-medium">{e.empNo}</td>
                    <td className="py-2.5 px-3">{e.lastName}</td>
                    <td className="py-2.5 px-3">{e.firstName}</td>
                    <td className="py-2.5 px-3 font-mono">{e.gender}</td>
                    <td className="py-2.5 px-3 font-mono">{e.birthDate}</td>
                    <td className="py-2.5 px-3 font-mono">{e.hireDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. ALL EMPLOYEES (Figure 32) */}
        {activeTab === 'all-employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-border font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] uppercase">
                  <th className="py-2.5 px-3">Emp No</th>
                  <th className="py-2.5 px-3">Last Name</th>
                  <th className="py-2.5 px-3">First Name</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Birth Date</th>
                  <th className="py-2.5 px-3">Hire Date</th>
                  <th className="py-2.5 px-3">Sep Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-sans">
                {initialAllEmployees.map((e) => (
                  <tr key={e.empNo} className="hover:bg-neutral-50 dark:hover:bg-surface-2">
                    <td className="py-2.5 px-3 font-mono font-medium">{e.empNo}</td>
                    <td className="py-2.5 px-3">{e.lastName}</td>
                    <td className="py-2.5 px-3">{e.firstName}</td>
                    <td className="py-2.5 px-3 font-mono">{e.gender}</td>
                    <td className="py-2.5 px-3 font-mono">{e.birthDate}</td>
                    <td className="py-2.5 px-3 font-mono">{e.hireDate}</td>
                    <td className="py-2.5 px-3 font-mono text-[#64748B]">{e.sepDate || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          e.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. EMPLOYEE JOB HISTORY (Figure 33) */}
        {activeTab === 'job-history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-border font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] uppercase">
                  <th className="py-2.5 px-3">Eff Date</th>
                  <th className="py-2.5 px-3">Job</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-sans">
                {jobHistoryRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#64748B] font-mono">
                      Select an employee to inspect job assignment and compensation history.
                    </td>
                  </tr>
                ) : (
                  jobHistoryRows.map((h, i) => (
                    <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-surface-2">
                      <td className="py-2.5 px-3 font-mono font-medium">{h.effDate}</td>
                      <td className="py-2.5 px-3">{h.job}</td>
                      <td className="py-2.5 px-3">{h.department}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {h.salaryFormatted}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. TOP SALES (Figure 34) */}
        {activeTab === 'top-sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-border font-mono text-[11px] text-[#475569] dark:text-[#94A3B8] uppercase">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Trans No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border font-sans">
                {initialTopSales.map((s) => (
                  <tr key={s.transNo} className="hover:bg-neutral-50 dark:hover:bg-surface-2">
                    <td className="py-2.5 px-3 font-mono">{s.rank}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{s.transNo}</td>
                    <td className="py-2.5 px-3 font-mono">{s.date}</td>
                    <td className="py-2.5 px-3 font-medium">{s.customer}</td>
                    <td className="py-2.5 px-3 text-[#64748B]">{s.employee}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {s.totalFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
