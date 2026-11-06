'use client';

import React from 'react';
import { Database } from 'lucide-react';

interface DatabaseStatusWidgetProps {
  checkedAt?: string;
  totalTables?: number;
  isConnected?: boolean;
}

export function DatabaseStatusWidget({
  checkedAt = 'Nov 6, 2026, 5:27 PM',
  totalTables = 10,
  isConnected = true,
}: DatabaseStatusWidgetProps) {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface-1/90 dark:bg-surface-1 backdrop-blur-md px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_-8px_rgba(0,0,0,0.35)] flex items-center justify-between gap-3 shrink-0 select-none font-sans transition-colors duration-150">
      {/* Left: Engine & Connection Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-text" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
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
            <span className="text-xs sm:text-[13px] font-semibold text-text leading-tight truncate">
              {isConnected ? 'Database Connected' : 'Database Offline'}
            </span>
          </div>
          <div className="font-mono text-[10px] sm:text-[11px] text-text-muted leading-tight mt-0.5 truncate">
            <span>SQLite / PostgreSQL &bull; {totalTables} tables</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-7 w-px bg-border shrink-0" />

      {/* Right: Last Checked Timestamp */}
      <div className="text-right shrink-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-faint leading-none">
          LAST CHECKED
        </div>
        <div className="font-mono text-[11px] sm:text-xs font-semibold tabular-nums text-text mt-1 whitespace-nowrap">
          {checkedAt}
        </div>
      </div>
    </div>
  );
}
