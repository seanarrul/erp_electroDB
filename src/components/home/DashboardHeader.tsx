'use client';

import React from 'react';

interface DashboardHeaderProps {
  fullName?: string;
  checkedAt?: string;
  totalTables?: number;
  isConnected?: boolean;
}

export function DashboardHeader({
  fullName = 'Admin',
  checkedAt = 'Oct 28, 2026 12:45 PM',
  totalTables = 10,
  isConnected = true,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/10">
      {/* Editorial Dashboard Title */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-[#041a24] tracking-tight">
          Overview 3NF Data Managed
        </h1>
        <p className="font-sans text-xs text-[#41555f] mt-0.5">
          Live monitoring ledger for PC parts inventory, customer receivables, and employee records.
        </p>
      </div>

      {/* Database Connection Status Pill (Editorial Box) */}
      <div className="rounded-[4px] border border-black/10 bg-white px-3.5 py-2 shadow-2xs flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-[#041a24]' : 'bg-red-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-[#041a24]' : 'bg-red-500'
              }`}
            />
          </span>
          <div>
            <div className="text-xs font-semibold text-[#041a24] leading-tight">
              {isConnected ? 'Database Connected' : 'Database Offline'}
            </div>
            <div className="font-mono text-[10px] text-[#41555f] leading-tight mt-0.5">
              SQLite / PostgreSQL &bull; {totalTables} tables
            </div>
          </div>
        </div>

        <div className="pl-4 border-l border-black/10 text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider text-[#41555f]">
            Last checked
          </div>
          <div className="font-mono text-[10px] font-medium text-[#041a24] mt-0.5 whitespace-nowrap">
            {checkedAt}
          </div>
        </div>
      </div>
    </div>
  );
}
