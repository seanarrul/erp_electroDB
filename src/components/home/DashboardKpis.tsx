'use client';

import React from 'react';
import { FileText, CreditCard, Users, ArrowUpRight } from 'lucide-react';
import type { HomeKPIData } from '@/lib/data/home';

interface DashboardKpisProps {
  kpis: HomeKPIData;
}

export function DashboardKpis({ kpis }: DashboardKpisProps) {
  const cards = [
    {
      title: 'Total Sales',
      value: kpis.totalSalesFormatted,
      trend: kpis.salesGrowth,
      subtext: 'vs. last 30 days',
      renderIcon: () => (
        <span className="text-white font-mono font-bold text-base leading-none select-none">₱</span>
      ),
    },
    {
      title: 'Total Transactions',
      value: kpis.totalTransactions.toString(),
      trend: kpis.transactionsGrowth,
      subtext: 'vs. last 30 days',
      renderIcon: () => <FileText className="w-4 h-4 text-white" />,
    },
    {
      title: 'Total Payments',
      value: kpis.totalPaymentsFormatted,
      trend: kpis.paymentsGrowth,
      subtext: 'vs. last 30 days',
      renderIcon: () => <CreditCard className="w-4 h-4 text-white" />,
    },
    {
      title: 'Active Employees',
      value: kpis.activeEmployees.toString(),
      trend: kpis.employeesGrowth,
      subtext: 'vs. last 30 days',
      renderIcon: () => <Users className="w-4 h-4 text-white" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-[4px] border border-black/10 hover:border-[#041a24] bg-white p-4 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3.5"
        >
          {/* JeptahzRepo Midnight Cyan Icon Frame */}
          <div className="w-9 h-9 rounded-[2px] bg-[#041a24] flex items-center justify-center shrink-0 shadow-2xs">
            {card.renderIcon()}
          </div>

          {/* Metric Details */}
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#41555f] truncate">
              {card.title}
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-[#041a24] tracking-tight mt-0.5 tabular-nums">
              {card.value}
            </div>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
              <span className="text-[#041a24] font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {card.trend.replace('+', '')}
              </span>
              <span className="text-[#41555f]/80">{card.subtext}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
