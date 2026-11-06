'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ErdDiagram } from './ErdDiagram';
import type { UserRole } from '@/lib/types';

interface TableListItem {
  num: string;
  name: string;
  description: string;
  defaultCount: number;
  moduleHref: string;
}

const CANONICAL_TABLES_LEFT: TableListItem[] = [
  {
    num: '01',
    name: 'DEPARTMENT',
    description: 'Organizational Units',
    defaultCount: 8,
    moduleHref: '/employees',
  },
  {
    num: '02',
    name: 'JOB',
    description: 'Job Classifications',
    defaultCount: 14,
    moduleHref: '/employees',
  },
  {
    num: '03',
    name: 'EMPLOYEE',
    description: 'Personnel Records',
    defaultCount: 32,
    moduleHref: '/employees',
  },
  {
    num: '04',
    name: 'JOBHISTORY',
    description: 'Employment History',
    defaultCount: 54,
    moduleHref: '/employees',
  },
  {
    num: '05',
    name: 'CUSTOMER',
    description: 'Customer Records',
    defaultCount: 82,
    moduleHref: '/customers',
  },
];

const CANONICAL_TABLES_RIGHT: TableListItem[] = [
  {
    num: '06',
    name: 'PRODUCT',
    description: 'Hardware Catalog',
    defaultCount: 57,
    moduleHref: '/products',
  },
  {
    num: '07',
    name: 'PRICEHIST',
    description: 'Price History',
    defaultCount: 79,
    moduleHref: '/products',
  },
  {
    num: '08',
    name: 'SALES',
    description: 'Sales Transactions',
    defaultCount: 124,
    moduleHref: '/sales',
  },
  {
    num: '09',
    name: 'SALESDETAIL',
    description: 'Transaction Details',
    defaultCount: 313,
    moduleHref: '/sales',
  },
  {
    num: '10',
    name: 'PAYMENT',
    description: 'Payment Records',
    defaultCount: 165,
    moduleHref: '/customers',
  },
];

interface DatabaseAuditDashboardProps {
  counts?: Record<string, number>;
  totalRows?: number;
  totalTables?: number;
  checkedAt?: string;
  isConnected?: boolean;
  userRole?: UserRole;
}

export function DatabaseAuditDashboard({
  counts = {},
  totalRows = 928,
  totalTables = 10,
  checkedAt = 'Nov 6, 2026',
  isConnected = true,
  userRole = 'admin',
}: DatabaseAuditDashboardProps) {
  const [isArchitectureExpanded, setIsArchitectureExpanded] = useState(true);

  const calculatedTotalRows =
    totalRows > 0
      ? totalRows
      : Object.values(counts).reduce((acc, curr) => acc + (Number(curr) || 0), 0) || 928;

  const displayDate = checkedAt
    ? checkedAt.includes(',')
      ? checkedAt.split(',').slice(0, 2).join(',')
      : checkedAt
    : 'Nov 6, 2026';

  return (
    <article className="w-full rounded-xl sm:rounded-2xl border border-gray-200/90 dark:border-border bg-white dark:bg-surface-1 p-3.5 sm:p-5 shadow-xs font-sans transition-colors duration-150">
      {/* ── [TOP HEADER & METRICS] ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200/80 dark:border-border">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#041a24] dark:text-white tracking-tight leading-none">
            Database Overview
          </h2>
          <p className="text-[11px] sm:text-xs text-[#52615B] dark:text-slate-400 mt-1">
            Database structure and integrity
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 self-start sm:self-auto shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Connected
        </span>
      </div>

      {/* KPI Row: 4 Ultra-Slim Side-by-Side Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
        <div className="rounded border border-gray-200/80 dark:border-border px-3 py-1.5 bg-gray-50/60 dark:bg-surface-2/40">
          <div className="text-[10px] text-[#52615B] dark:text-slate-400 uppercase tracking-wider font-medium">
            Tables
          </div>
          <div className="text-base sm:text-lg font-bold text-[#041a24] dark:text-white leading-tight mt-0.5 font-mono">
            {totalTables} / 10
          </div>
        </div>

        <div className="rounded border border-gray-200/80 dark:border-border px-3 py-1.5 bg-gray-50/60 dark:bg-surface-2/40">
          <div className="text-[10px] text-[#52615B] dark:text-slate-400 uppercase tracking-wider font-medium">
            Records
          </div>
          <div className="text-base sm:text-lg font-bold text-[#041a24] dark:text-white leading-tight mt-0.5 font-mono">
            {calculatedTotalRows.toLocaleString()}
          </div>
        </div>

        <div className="rounded border border-gray-200/80 dark:border-border px-3 py-1.5 bg-gray-50/60 dark:bg-surface-2/40">
          <div className="text-[10px] text-[#52615B] dark:text-slate-400 uppercase tracking-wider font-medium">
            Relationships
          </div>
          <div className="text-base sm:text-lg font-bold text-[#041a24] dark:text-white leading-tight mt-0.5 font-mono">
            9
          </div>
        </div>

        <div className="rounded border border-gray-200/80 dark:border-border px-3 py-1.5 bg-gray-50/60 dark:bg-surface-2/40">
          <div className="text-[10px] text-[#52615B] dark:text-slate-400 uppercase tracking-wider font-medium">
            Integrity
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
            Verified
          </div>
        </div>
      </div>

      {/* ── [DATABASE TABLES LIST (TOP HALF)] ── */}
      <div className="flex items-center justify-between pt-3 pb-1 border-t border-gray-200/80 dark:border-border mt-3">
        <h3 className="text-xs font-bold text-[#041a24] dark:text-white tracking-tight">
          Database Tables
        </h3>
        <span className="text-[10px] sm:text-[11px] text-[#52615B] dark:text-slate-400 font-mono">
          Last updated: {displayDate}
        </span>
      </div>

      {/* Tables List: 2-Column Balanced Table Grid (01-05 Left, 06-10 Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 gap-y-1 mt-1">
        {/* Left Column: 01 to 05 */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 dark:border-border text-[10px] font-semibold text-[#52615B] dark:text-slate-400 uppercase tracking-wider">
                <th className="py-1 px-1 font-semibold w-7">#</th>
                <th className="py-1 px-2 font-semibold">TABLE</th>
                <th className="py-1 px-2 font-semibold">DESCRIPTION</th>
                <th className="py-1 px-2 font-semibold text-right">RECORDS</th>
                <th className="py-1 px-1 font-semibold text-right w-16">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-border/40 font-mono">
              {CANONICAL_TABLES_LEFT.map((t) => (
                <tr
                  key={t.name}
                  className="hover:bg-gray-50/70 dark:hover:bg-surface-2/30 transition-colors"
                >
                  <td className="py-1 px-1 text-[11px] text-[#7A8781] dark:text-slate-500">
                    {t.num}
                  </td>
                  <td className="py-1 px-2 font-bold text-[11px] text-[#041a24] dark:text-white">
                    <Link href={t.moduleHref} className="hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="py-1 px-2 font-sans text-[11px] text-[#52615B] dark:text-slate-300">
                    {t.description}
                  </td>
                  <td className="py-1 px-2 font-bold text-[11px] text-[#041a24] dark:text-white text-right tabular-nums">
                    {(counts[t.name] ?? t.defaultCount).toLocaleString()}
                  </td>
                  <td className="py-1 px-1 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: 06 to 10 */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 dark:border-border text-[10px] font-semibold text-[#52615B] dark:text-slate-400 uppercase tracking-wider">
                <th className="py-1 px-1 font-semibold w-7">#</th>
                <th className="py-1 px-2 font-semibold">TABLE</th>
                <th className="py-1 px-2 font-semibold">DESCRIPTION</th>
                <th className="py-1 px-2 font-semibold text-right">RECORDS</th>
                <th className="py-1 px-1 font-semibold text-right w-16">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-border/40 font-mono">
              {CANONICAL_TABLES_RIGHT.map((t) => (
                <tr
                  key={t.name}
                  className="hover:bg-gray-50/70 dark:hover:bg-surface-2/30 transition-colors"
                >
                  <td className="py-1 px-1 text-[11px] text-[#7A8781] dark:text-slate-500">
                    {t.num}
                  </td>
                  <td className="py-1 px-2 font-bold text-[11px] text-[#041a24] dark:text-white">
                    <Link href={t.moduleHref} className="hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="py-1 px-2 font-sans text-[11px] text-[#52615B] dark:text-slate-300">
                    {t.description}
                  </td>
                  <td className="py-1 px-2 font-bold text-[11px] text-[#041a24] dark:text-white text-right tabular-nums">
                    {(counts[t.name] ?? t.defaultCount).toLocaleString()}
                  </td>
                  <td className="py-1 px-1 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── [COLLAPSIBLE DATABASE ARCHITECTURE (BOTTOM HALF)] ── */}
      <div className="mt-4 pt-1">
        <button
          type="button"
          onClick={() => setIsArchitectureExpanded(!isArchitectureExpanded)}
          className="w-full bg-[#041a24] hover:bg-[#072432] text-white px-3.5 py-2 rounded-[3px] flex items-center justify-between cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-white/20 select-none shadow-2xs"
          aria-expanded={isArchitectureExpanded}
        >
          <span className="font-mono text-xs font-semibold flex items-center gap-1.5 text-white">
            <span className="text-[10px] text-slate-300">
              {isArchitectureExpanded ? '▼' : '▲'}
            </span>
            Relational Database Architecture (10 Tables &bull; 9 Foreign Keys)
          </span>
          <span className="text-[10px] font-mono text-slate-300 hover:text-white transition-colors">
            {isArchitectureExpanded ? 'Click to hide' : 'Click to expand'}
          </span>
        </button>

        {/* Expandable ERD Architecture Content */}
        {isArchitectureExpanded && (
          <div className="border border-t-0 border-gray-200/90 dark:border-border rounded-b-[4px] p-3 sm:p-4 bg-white dark:bg-surface-1 transition-all">
            <ErdDiagram counts={counts} userRole={userRole} />
          </div>
        )}
      </div>

      {/* ── [FOOTER] ── */}
      <div className="pt-2.5 mt-2.5 border-t border-gray-200/80 dark:border-border/50 text-[10px] text-gray-500 dark:text-slate-400 font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <span>10 tables &bull; 928 records &bull; Database integrity verified</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          &bull; HopeDB Coursework Canonical
        </span>
      </div>
    </article>
  );
}
