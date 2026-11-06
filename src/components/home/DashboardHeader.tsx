'use client';

import React from 'react';
import { DatabaseStatusWidget } from './DatabaseStatusWidget';

interface DashboardHeaderProps {
  fullName?: string;
  checkedAt?: string;
  totalTables?: number;
  isConnected?: boolean;
  showStatusWidget?: boolean;
}

export function DashboardHeader({
  fullName = 'Admin',
  checkedAt = 'Nov 6, 2026, 5:27 PM',
  totalTables = 10,
  isConnected = true,
  showStatusWidget = false,
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

      {showStatusWidget && (
        <DatabaseStatusWidget
          checkedAt={checkedAt}
          totalTables={totalTables}
          isConnected={isConnected}
        />
      )}
    </div>
  );
}
