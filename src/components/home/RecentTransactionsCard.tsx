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
          <tbody className="divide-y divide-border/60">
            {transactions.map((tx) => (
              <tr
                key={tx.transNo}
                className="hover:bg-surface-2/60 transition-colors group cursor-pointer"
              >
                <td className="py-3 px-5 sm:px-6 font-mono font-semibold text-text whitespace-nowrap">
                  <Link href={`/sales/${tx.transNo}`} className="hover:underline">
                    {tx.transNo}
                  </Link>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-text-muted whitespace-nowrap">
                  {tx.date}
                </td>
                <td className="py-3 px-4 font-medium text-text whitespace-nowrap">
                  {tx.customer}
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
