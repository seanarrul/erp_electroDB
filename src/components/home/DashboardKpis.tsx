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
      renderIcon: () => <FileText className="w-5 h-5 text-white stroke-[2]" />,
    },
    {
      title: 'Total Payments',
      value: kpis.totalPaymentsFormatted,
      trend: kpis.paymentsGrowth,
      subtext: 'vs. last 30 days',
      renderIcon: () => <CreditCard className="w-5 h-5 text-white stroke-[2]" />,
    },
    {
      title: 'Active Employees',
      value: kpis.activeEmployees.toString(),
      trend: kpis.employeesGrowth,
      subtext: 'vs. last 30 days',
      renderIcon: () => <Users className="w-5 h-5 text-white stroke-[2]" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 font-sans">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group relative bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 p-5 sm:p-6 flex items-start gap-4 overflow-hidden select-none"
        >
          {/* Distinct solid dark charcoal vertical accent bar matching ExploreGrid */}
          <div className="absolute left-0 inset-y-0 w-1.5 bg-[#0C1418] rounded-l-2xl pointer-events-none" />

          {/* Elevated Icon Badge */}
          <div className="w-11 h-11 rounded-xl bg-[#0C1418] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
            {card.renderIcon()}
          </div>

          {/* Metric Details */}
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#52525B] truncate">
              {card.title}
            </div>
            <div className="font-sans text-xl sm:text-2xl font-bold text-[#0C1418] tracking-tight mt-1 tabular-nums leading-tight truncate">
              {card.value}
            </div>
            <div className="flex items-center gap-1.5 mt-2 font-sans text-xs">
              <span className="text-[#0C1418] font-semibold flex items-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                {card.trend.replace('+', '')}
              </span>
              <span className="text-neutral-400 truncate">{card.subtext}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
