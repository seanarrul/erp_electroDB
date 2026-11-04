'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { RecentTransactionItem } from '@/lib/data/home';

interface RecentTransactionsCardProps {
  transactions: RecentTransactionItem[];
}

export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  return (
    <div className="rounded-[4px] border border-border bg-surface-1 p-5 sm:p-6 shadow-2xs space-y-4 font-sans transition-colors duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="font-editorial text-lg sm:text-xl font-normal text-text tracking-tight">
            Recent Sales Transactions
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Operational ledger entries recorded across sales counters.
          </p>
        </div>
        <Link
          href="/sales"
          className="inline-flex items-center gap-1 font-mono text-xs text-text hover:text-accent transition-colors"
        >
          <span>View Archive</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-2/70 text-text-muted font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-5 sm:px-6">Transaction No.</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Employee</th>
              <th className="py-2.5 px-4">Amount</th>
              <th className="py-2.5 px-5 sm:px-6">Status</th>
            </tr>
          </thead>
          <tbody className="group/tbody divide-y divide-border/60">
            {transactions.map((tx) => (
              <tr
                key={tx.transNo}
                className="group/row cursor-pointer transition-[opacity,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tbody:opacity-[0.62] hover:!opacity-100 hover:bg-[#F3F2EE] dark:hover:bg-surface-2"
              >
                <td className="relative py-3 px-5 sm:px-6 font-mono font-semibold text-text whitespace-nowrap overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-[#0F172A] dark:bg-white origin-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none scale-y-0 group-hover/row:scale-y-100" />
                  <Link href={`/sales/${tx.transNo}`} className="inline-block hover:underline transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1.5">
                    {tx.transNo}
                  </Link>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-text-muted whitespace-nowrap">
                  {tx.date}
                </td>
                <td className="py-3 px-4 font-medium text-text whitespace-nowrap">
                  <span className="inline-block transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1">
                    {tx.customer}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-muted whitespace-nowrap">
                  {tx.employee}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-text tabular-nums whitespace-nowrap">
                  {tx.amountFormatted}
                </td>
                <td className="py-3 px-5 sm:px-6 whitespace-nowrap">
                  {tx.status === 'Completed' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-medium bg-[#041a24] dark:bg-surface-2 text-white dark:text-text border border-transparent dark:border-border">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-medium bg-[#FEF08A]/80 dark:bg-amber-950/50 text-[#713F12] dark:text-amber-400 border border-yellow-400/50 dark:border-amber-500/30">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
