'use client';

import React from 'react';
import { Database } from 'lucide-react';

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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border transition-colors duration-150">
      {/* Editorial Dashboard Title */}
      <div>
        <h1 className="font-editorial italic text-2xl sm:text-3xl font-normal text-text tracking-tight">
          Overview 3NF Data Managed
        </h1>
        <p className="font-sans text-xs text-text-muted mt-1">
          Live monitoring ledger for PC parts inventory, customer receivables, and employee records.
        </p>
      </div>

      {/* Database Connection Status Widget (Editorial Box) */}
      <div className="rounded-2xl border border-border hover:border-border-control bg-surface-1 px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 sm:gap-6 shrink-0 select-none">
        {/* Left: Engine & Connection Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
            <Database className="w-4 h-4 text-text" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-text leading-tight">
                {isConnected ? 'Database Connected' : 'Database Offline'}
              </span>
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-text-muted leading-tight mt-1 flex items-center gap-1.5">
              <span>SQLite / PostgreSQL</span>
              <span className="opacity-30">&bull;</span>
              <span className="text-text font-medium">{totalTables} tables</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-border shrink-0" />

        {/* Right: Last Checked Timestamp */}
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
            Last checked
          </div>
          <div className="font-mono text-xs sm:text-[13px] font-semibold tabular-nums text-text mt-1 whitespace-nowrap">
            {checkedAt}
          </div>
        </div>
      </div>
    </div>
  );
}
