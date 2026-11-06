'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { DbHealthResult } from '@/lib/db-health';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DbStatusPillProps {
  onStatusChange?: (status: 'connected' | 'partial' | 'disconnected' | 'checking') => void;
}

export function DbStatusPill({ onStatusChange }: DbStatusPillProps) {
  const [health, setHealth] = useState<DbHealthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch health data client-side after initial render
  const fetchHealth = async (forceFresh = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/health/db${forceFresh ? '?fresh=1' : ''}`);
      if (!res.ok) {
        throw new Error('Health check response error');
      }
      const data: DbHealthResult = await res.json();
      setHealth(data);
      onStatusChange?.(data.status);
    } catch {
      const fallback: DbHealthResult = {
        connected: false,
        status: 'disconnected',
        engine: 'SQLite (hope.db)',
        tablesExpected: 10,
        tablesFound: 0,
        latencyMs: 0,
        checkedAt: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
        tables: [],
        message: 'The server could not reach the database.',
      };
      setHealth(fallback);
      onStatusChange?.('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth(false);

    // Auto re-check every 60s only when document is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchHealth(true);
      }
    }, 60_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHealth(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentStatus = loading && !health ? 'checking' : health?.status || 'disconnected';

  // State configurations: green (healthy), amber (partial), red (disconnected), gray (checking)
  const statusConfig = {
    connected: {
      label: 'Database connected',
      dotClass: 'bg-emerald-500 animate-pulse',
      badgeClass:
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/15',
    },
    partial: {
      label: 'Partially connected',
      dotClass: 'bg-amber-500',
      badgeClass:
        'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/15',
    },
    disconnected: {
      label: 'Data not connected',
      dotClass: 'bg-rose-500',
      badgeClass:
        'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300 hover:bg-rose-500/15',
    },
    checking: {
      label: 'Checking...',
      dotClass: 'bg-neutral-400 animate-ping',
      badgeClass:
        'border-border bg-surface-2 text-text-muted hover:bg-surface-2/80',
    },
  }[currentStatus];

  return (
    <div className="relative inline-block select-none font-sans">
      {/* ── Status Pill Button ── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="db-health-popover"
        aria-label={`Database status: ${statusConfig.label}. Click to verify connection.`}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer shadow-2xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
          statusConfig.badgeClass
        )}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={cn('inline-flex rounded-full h-2 w-2', statusConfig.dotClass)} />
        </span>
        <span className="leading-none whitespace-nowrap">{statusConfig.label}</span>
      </button>

      {/* Accessible live region for status announcements */}
      <span className="sr-only" aria-live="polite">
        Database status is currently {statusConfig.label}.
      </span>

      {/* ── Verification Popover ── */}
      {isOpen && (
        <div
          id="db-health-popover"
          ref={popoverRef}
          role="dialog"
          aria-label="Connection verification"
          className="absolute right-0 mt-2 w-[340px] sm:w-[380px] rounded-2xl border border-border bg-surface-1 dark:bg-surface-1/95 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.14)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.45)] backdrop-blur-md z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-xs text-text"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-1.5 text-text">
                <Database className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Connection verification</h3>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted mt-0.5">
                Live SQLite 10-table ERD health check
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchHealth(true)}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-border bg-surface-2 hover:bg-surface-2/80 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Query the database again"
            >
              <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
              <span>Re-check</span>
            </button>
          </div>

          {/* Status Banner */}
          <div className="my-3.5 p-3 rounded-xl border bg-surface-2/50 border-border">
            <div className="flex items-center gap-2">
              {currentStatus === 'connected' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              {currentStatus === 'partial' && (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              {currentStatus === 'disconnected' && (
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="font-semibold text-sm">
                {currentStatus === 'connected'
                  ? 'Database fully connected'
                  : currentStatus === 'partial'
                  ? 'Partially connected (missing tables)'
                  : 'Data not connected'}
              </span>
            </div>

            {currentStatus === 'disconnected' && (
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                The server could not reach the database. Please verify local file permissions or connection availability.
              </p>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-border/80 font-mono text-[11px]">
              <div>
                <span className="text-text-faint text-[9.5px] uppercase tracking-wider block">
                  Tables Found
                </span>
                <span className="font-semibold text-text">
                  {health ? `${health.tablesFound} / ${health.tablesExpected}` : '0 / 10'}
                </span>
              </div>
              <div>
                <span className="text-text-faint text-[9.5px] uppercase tracking-wider block">
                  Latency
                </span>
                <span className="font-semibold text-text">
                  {health && currentStatus !== 'disconnected' ? `${health.latencyMs} ms` : '—'}
                </span>
              </div>
              <div>
                <span className="text-text-faint text-[9.5px] uppercase tracking-wider block">
                  Engine
                </span>
                <span className="text-text truncate block">{health?.engine || 'SQLite'}</span>
              </div>
              <div>
                <span className="text-text-faint text-[9.5px] uppercase tracking-wider block">
                  Last Checked
                </span>
                <span className="text-text tabular-nums whitespace-nowrap block">
                  {health?.checkedAt || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 10-Table Live Checklist */}
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint block">
              CANONICAL ERD TABLES ({health?.tablesFound || 0}/10)
            </span>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-surface-2/30 p-1.5 space-y-1">
              {health?.tables && health.tables.length > 0 ? (
                health.tables.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between px-2 py-1 rounded bg-surface-1/60 text-[11px] font-mono"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {t.exists ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      )}
                      <span className="font-medium text-text truncate">{t.name}</span>
                    </div>
                    <span className="text-text-muted tabular-nums shrink-0">
                      {t.exists ? `${t.rows} rows` : 'missing'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-text-muted text-xs">
                  No table information available.
                </div>
              )}
            </div>
          </div>

          {/* Explanatory Footer Note */}
          <div className="mt-3 pt-2.5 border-t border-border flex items-center gap-1.5 text-text-muted text-[10.5px]">
            <Info className="w-3.5 h-3.5 text-text-faint shrink-0" />
            <span>Figures on this page are computed from these live tables.</span>
          </div>
        </div>
      )}
    </div>
  );
}
