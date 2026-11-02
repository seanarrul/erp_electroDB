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
    <div className="rounded-[4px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/10">
        <div>
          <h2 className="font-editorial text-lg sm:text-xl font-normal text-[#041a24] tracking-tight">
            Recent Sales Transactions
          </h2>
          <p className="text-xs text-[#41555f] mt-0.5">
            Operational ledger entries recorded across sales counters.
          </p>
        </div>
        <Link
          href="/sales"
          className="inline-flex items-center gap-1 font-mono text-xs text-[#041a24] hover:opacity-80 transition-opacity"
        >
          <span>View Archive</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/10 bg-[#F4F4F0]/70 text-[#41555f] font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-5 sm:px-6">Transaction No.</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Employee</th>
              <th className="py-2.5 px-4">Amount</th>
              <th className="py-2.5 px-5 sm:px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {transactions.map((tx) => (
              <tr
                key={tx.transNo}
                className="hover:bg-[#F4F4F0]/60 transition-colors group cursor-pointer"
              >
                <td className="py-3 px-5 sm:px-6 font-mono font-semibold text-[#041a24] whitespace-nowrap">
                  <Link href={`/sales/${tx.transNo}`} className="hover:underline">
                    {tx.transNo}
                  </Link>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-[#41555f] whitespace-nowrap">
                  {tx.date}
                </td>
                <td className="py-3 px-4 font-medium text-[#041a24] whitespace-nowrap">
                  {tx.customer}
                </td>
                <td className="py-3 px-4 text-[#41555f] whitespace-nowrap">
                  {tx.employee}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[#041a24] tabular-nums whitespace-nowrap">
                  {tx.amountFormatted}
                </td>
                <td className="py-3 px-5 sm:px-6 whitespace-nowrap">
                  {tx.status === 'Completed' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-medium bg-[#041a24] text-white">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-medium bg-[#FEF08A]/80 text-[#713F12] border border-yellow-400/50">
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
