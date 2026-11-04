'use client';

import React from 'react';
import type { HomeKPIData } from '@/lib/data/home';

interface DashboardKpisProps {
  kpis: HomeKPIData;
}

export function DashboardKpis({ kpis }: DashboardKpisProps) {
  const cards = [
    {
      title: 'TOTAL SALES',
      value: kpis.totalSalesFormatted,
      subtext: `${kpis.salesGrowth} vs. last 30 days`,
    },
    {
      title: 'TOTAL TRANSACTIONS',
      value: kpis.totalTransactions.toLocaleString(),
      subtext: `${kpis.transactionsGrowth} vs. last 30 days`,
    },
    {
      title: 'TOTAL PAYMENTS',
      value: kpis.totalPaymentsFormatted,
      subtext: `${kpis.paymentsGrowth} vs. last 30 days`,
    },
    {
      title: 'ACTIVE EMPLOYEES',
      value: kpis.activeEmployees.toString(),
      subtext: `${kpis.employeesGrowth} vs. last 30 days`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-[4px] border border-border hover:border-border-control bg-surface-1 p-3.5 sm:p-4 shadow-xs hover:shadow-sm transition-all"
        >
          <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-text-faint">
            {card.title}
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-text">
            {card.value}
          </div>
          <div className="mt-0.5 text-xs text-text-muted">
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
