'use client';

import React from 'react';
import { DbStatusPill } from './DbStatusPill';

interface DashboardHeaderProps {
  onDbStatusChange?: (status: 'connected' | 'partial' | 'disconnected' | 'checking') => void;
}

export function DashboardHeader({ onDbStatusChange }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border transition-colors duration-150">
      {/* Editorial Dashboard Title */}
      <div>
        <h1 className="font-editorial italic text-2xl sm:text-3xl font-normal text-text tracking-tight">
          Overview
        </h1>
      </div>

      {/* Clickable, timed Database Status Pill */}
      <div className="shrink-0 flex items-center">
        <DbStatusPill onStatusChange={onDbStatusChange} />
      </div>
    </div>
  );
}
