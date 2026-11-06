'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ERD_TABLES,
  ERD_GEOMETRY,
  ERD_MODULES,
} from '@/lib/erd';
import type { UserRole } from '@/lib/types';

interface ErdDiagramProps {
  counts: Record<string, number>;
  userRole?: UserRole;
}

// Module styling lookup with noticeable, vibrant color coding (Blue, Yellow, Red, Green)
const MODULE_COLORS: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  }
> = {
  employees: {
    bg: '#D0E1FD', // Blue header
    border: '#3B82F6',
    text: '#1E3A8A',
    badgeBg: '#FFFFFF',
    badgeBorder: '#93C5FD',
    badgeText: '#1E40AF',
  },
  products: {
    bg: '#BBF7D0', // Green header
    border: '#16A34A',
    text: '#14532D',
    badgeBg: '#FFFFFF',
    badgeBorder: '#86EFAC',
    badgeText: '#15803D',
  },
  customers: {
    bg: '#FEF08A', // Yellow header
    border: '#CA8A04',
    text: '#713F12',
    badgeBg: '#FFFFFF',
    badgeBorder: '#FDE047',
    badgeText: '#854D0E',
  },
  sales: {
    bg: '#FECDD3', // Red/Coral header
    border: '#DC2626',
    text: '#7F1D1D',
    badgeBg: '#FFFFFF',
    badgeBorder: '#FCA5A5',
    badgeText: '#991B1B',
  },
};

interface ConnectionPath {
  id: string;
  d: string;
  label: string;
  midX: number;
  midY: number;
  fromTable: string;
  toTable: string;
  fromCardinality: '1' | '0..1';
  toCardinality: '0..*' | '1..*';
  startPoint: { x: number; y: number; dir: 'left' | 'right' | 'top' | 'bottom' };
  endPoint: { x: number; y: number; dir: 'left' | 'right' | 'top' | 'bottom' };
}

// Defined orthogonal paths for all 9 relationships with exact connection points and spacious clearance
const RELATIONSHIP_PATHS: ConnectionPath[] = [
  {
    id: 'rel_dept_jobhistory',
    fromTable: 'DEPARTMENT',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'placed in',
    d: 'M 215 73 L 247 73 L 247 95 L 280 95',
    midX: 247,
    midY: 84,
    startPoint: { x: 215, y: 73, dir: 'right' },
    endPoint: { x: 280, y: 95, dir: 'left' },
  },
  {
    id: 'rel_job_jobhistory',
    fromTable: 'JOB',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'appointed to',
    d: 'M 215 188 L 247 188 L 247 155 L 280 155',
    midX: 247,
    midY: 172,
    startPoint: { x: 215, y: 188, dir: 'right' },
    endPoint: { x: 280, y: 155, dir: 'left' },
  },
  {
    id: 'rel_emp_jobhistory',
    fromTable: 'EMPLOYEE',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'career history',
    d: 'M 215 295 L 355 295 L 355 217',
    midX: 285,
    midY: 285,
    startPoint: { x: 215, y: 295, dir: 'right' },
    endPoint: { x: 355, y: 217, dir: 'bottom' },
  },
  {
    id: 'rel_emp_sales',
    fromTable: 'EMPLOYEE',
    toTable: 'SALES',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'handled by',
    d: 'M 215 355 L 550 355',
    midX: 382,
    midY: 345,
    startPoint: { x: 215, y: 355, dir: 'right' },
    endPoint: { x: 550, y: 355, dir: 'left' },
  },
  {
    id: 'rel_cust_sales',
    fromTable: 'CUSTOMER',
    toTable: 'SALES',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'makes sales',
    d: 'M 647 450 L 647 398',
    midX: 647,
    midY: 424,
    startPoint: { x: 647, y: 450, dir: 'top' },
    endPoint: { x: 647, y: 398, dir: 'bottom' },
  },
  {
    id: 'rel_sales_payment',
    fromTable: 'SALES',
    toTable: 'PAYMENT',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'has receipts',
    d: 'M 647 270 L 647 173',
    midX: 647,
    midY: 221,
    startPoint: { x: 647, y: 270, dir: 'top' },
    endPoint: { x: 647, y: 173, dir: 'bottom' },
  },
  {
    id: 'rel_sales_salesdetail',
    fromTable: 'SALES',
    toTable: 'SALESDETAIL',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'contains item',
    d: 'M 745 318 L 840 318',
    midX: 792,
    midY: 308,
    startPoint: { x: 745, y: 318, dir: 'right' },
    endPoint: { x: 840, y: 318, dir: 'left' },
  },
  {
    id: 'rel_prod_salesdetail',
    fromTable: 'PRODUCT',
    toTable: 'SALESDETAIL',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'ordered SKU',
    d: 'M 1125 318 L 1035 318',
    midX: 1080,
    midY: 308,
    startPoint: { x: 1125, y: 318, dir: 'left' },
    endPoint: { x: 1035, y: 318, dir: 'right' },
  },
  {
    id: 'rel_prod_pricehist',
    fromTable: 'PRODUCT',
    toTable: 'PRICEHIST',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'price history',
    d: 'M 1215 270 L 1215 161',
    midX: 1215,
    midY: 215,
    startPoint: { x: 1215, y: 270, dir: 'top' },
    endPoint: { x: 1215, y: 161, dir: 'bottom' },
  },
];

// Helper to draw crow's foot notation marks
function renderCardinalityMark(
  x: number,
  y: number,
  dir: 'left' | 'right' | 'top' | 'bottom',
  type: 'one' | 'zero_many' | 'one_many'
) {
  if (dir === 'left') {
    if (type === 'zero_many') {
      return (
        <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
          <circle cx={x - 14} cy={y} r="3" className="fill-white dark:fill-surface-1" />
          <path d={`M ${x - 9} ${y} L ${x} ${y - 6} M ${x - 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    if (type === 'one_many') {
      return (
        <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
          <line x1={x - 14} y1={y - 5} x2={x - 14} y2={y + 5} />
          <path d={`M ${x - 9} ${y} L ${x} ${y - 6} M ${x - 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    return (
      <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5">
        <line x1={x + 5} y1={y - 5} x2={x + 5} y2={y + 5} />
        <line x1={x + 10} y1={y - 5} x2={x + 10} y2={y + 5} />
      </g>
    );
  }

  if (dir === 'right') {
    if (type === 'zero_many') {
      return (
        <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
          <circle cx={x + 14} cy={y} r="3" className="fill-white dark:fill-surface-1" />
          <path d={`M ${x + 9} ${y} L ${x} ${y - 6} M ${x + 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    if (type === 'one_many') {
      return (
        <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
          <line x1={x + 14} y1={y - 5} x2={x + 14} y2={y + 5} />
          <path d={`M ${x + 9} ${y} L ${x} ${y - 6} M ${x + 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    return (
      <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5">
        <line x1={x - 5} y1={y - 5} x2={x - 5} y2={y + 5} />
        <line x1={x - 10} y1={y - 5} x2={x - 10} y2={y + 5} />
      </g>
    );
  }

  if (dir === 'top') {
    if (type === 'zero_many') {
      return (
        <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
          <circle cx={x} cy={y - 14} r="3" className="fill-white dark:fill-surface-1" />
          <path d={`M ${x} ${y - 9} L ${x - 6} ${y} M ${x} ${y - 9} L ${x + 6} ${y}`} />
        </g>
      );
    }
    if (type === 'one_many') {
      return (
        <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
          <line x1={x - 5} y1={y - 14} x2={x + 5} y2={y - 14} />
          <path d={`M ${x} ${y - 9} L ${x - 6} ${y} M ${x} ${y - 9} L ${x + 6} ${y}`} />
        </g>
      );
    }
    return (
      <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5">
        <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y + 5} />
        <line x1={x - 5} y1={y + 10} x2={x + 5} y2={y + 10} />
      </g>
    );
  }

  // dir === 'bottom'
  if (type === 'zero_many') {
    return (
      <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
        <circle cx={x} cy={y + 14} r="3" className="fill-white dark:fill-surface-1" />
        <path d={`M ${x} ${y + 9} L ${x - 6} ${y} M ${x} ${y + 9} L ${x + 6} ${y}`} />
      </g>
    );
  }
  if (type === 'one_many') {
    return (
      <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5" fill="none">
        <line x1={x - 5} y1={y + 14} x2={x + 5} y2={y + 14} />
        <path d={`M ${x} ${y + 9} L ${x - 6} ${y} M ${x} ${y + 9} L ${x + 6} ${y}`} />
      </g>
    );
  }
  return (
    <g className="stroke-[#041a24] dark:stroke-slate-300" strokeWidth="1.5">
      <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y - 5} />
      <line x1={x - 5} y1={y - 10} x2={x + 5} y2={y - 10} />
    </g>
  );
}

export function ErdDiagram({ counts, userRole = 'admin' }: ErdDiagramProps) {
  const router = useRouter();
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const handleTableClick = (tableName: string, event: React.MouseEvent) => {
    const table = ERD_TABLES[tableName];
    if (!table) return;

    const moduleInfo = ERD_MODULES.find((m) => m.id === table.moduleId);
    if (!moduleInfo) return;

    const canAccess = moduleInfo.roles.includes(userRole);
    if (!canAccess) {
      const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
      setTooltip({
        text: 'Admin only',
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setTimeout(() => setTooltip(null), 2500);
      return;
    }

    router.push(moduleInfo.href);
  };

  const handleTableKeyDown = (tableName: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const table = ERD_TABLES[tableName];
      if (!table) return;
      const moduleInfo = ERD_MODULES.find((m) => m.id === table.moduleId);
      if (!moduleInfo) return;
      if (!moduleInfo.roles.includes(userRole)) {
        const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
        setTooltip({
          text: 'Admin only',
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setTimeout(() => setTooltip(null), 2500);
        return;
      }
      router.push(moduleInfo.href);
    }
  };

  const isRelationshipActive = (rel: ConnectionPath) => {
    if (!activeTable) return false;
    return rel.fromTable === activeTable || rel.toTable === activeTable;
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Scrollable Container on screens < 900px */}
      <div className="relative">
        <div className="overflow-x-auto pb-1 scroll-smooth">
          <div
            className="min-w-[1100px] xl:min-w-full"
            role="img"
            aria-label="HopeERD Relational Database Architecture: 10 tables and 9 relationships."
          >
            <svg
              viewBox="0 0 1335 595"
              className="w-full max-w-[1280px] mx-auto h-auto select-none block"
              style={{ maxHeight: '540px' }}
            >
              {/* Definitions */}
              <defs>
                <filter id="erd-subtle-shadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#041a24" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* 1. Relationship Lines & Labels */}
              {RELATIONSHIP_PATHS.map((rel) => {
                const isActive = isRelationshipActive(rel);
                const isDimmed = activeTable !== null && !isActive;

                return (
                  <g
                    key={rel.id}
                    className="transition-opacity duration-200"
                    style={{ opacity: isDimmed ? 0.2 : 1 }}
                  >
                    {/* Background wider hit stroke */}
                    <path d={rel.d} fill="none" stroke="transparent" strokeWidth="12" />

                    {/* Main connection line */}
                    <path
                      d={rel.d}
                      fill="none"
                      className={isActive ? 'stroke-[#041a24] dark:stroke-[#3ECF8E]' : 'stroke-[#94A3B8] dark:stroke-slate-500'}
                      strokeWidth={isActive ? '2' : '1.25'}
                    />

                    {/* From Cardinality mark (Always 1) */}
                    {renderCardinalityMark(
                      rel.startPoint.x,
                      rel.startPoint.y,
                      rel.startPoint.dir,
                      'one'
                    )}

                    {/* To Cardinality mark (0..* or 1..*) */}
                    {renderCardinalityMark(
                      rel.endPoint.x,
                      rel.endPoint.y,
                      rel.endPoint.dir,
                      rel.toCardinality === '1..*' ? 'one_many' : 'zero_many'
                    )}

                    {/* Relationship Action Label (Spacious clearance with zero overlap) */}
                    <g transform={`translate(${rel.midX}, ${rel.midY})`}>
                      <rect
                        x="-39"
                        y="-9"
                        width="78"
                        height="18"
                        className="fill-white dark:fill-surface-2 stroke-[#CBD5E1] dark:stroke-border"
                        strokeWidth="1"
                        rx="3"
                        filter="url(#erd-subtle-shadow)"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        className="font-sans text-[9px] fill-[#0F172A] dark:fill-white font-medium select-none"
                      >
                        {rel.label}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 2. Table Boxes */}
              {Object.keys(ERD_TABLES).map((tableName) => {
                const table = ERD_TABLES[tableName];
                const geom = ERD_GEOMETRY[tableName];
                if (!geom) return null;

                const moduleInfo = ERD_MODULES.find((m) => m.id === table.moduleId);
                const colors = MODULE_COLORS[table.moduleId] || MODULE_COLORS.sales;
                const rowCount = counts[tableName] ?? 0;
                const canAccess = moduleInfo?.roles.includes(userRole);

                const isActive = activeTable === tableName;
                const isRelated =
                  activeTable !== null &&
                  RELATIONSHIP_PATHS.some(
                    (r) =>
                      (r.fromTable === activeTable && r.toTable === tableName) ||
                      (r.toTable === activeTable && r.fromTable === tableName)
                  );
                const isDimmed = activeTable !== null && !isActive && !isRelated;

                const ariaLabelText = `${tableName} table, ${rowCount} rows. Opens ${moduleInfo?.name || 'module'}${
                  !canAccess ? ' (Admin only)' : ''
                }.`;

                return (
                  <g
                    key={tableName}
                    transform={`translate(${geom.x}, ${geom.y})`}
                    className="cursor-pointer transition-all duration-200 outline-none"
                    style={{
                      opacity: isDimmed ? 0.25 : 1,
                    }}
                    onMouseEnter={() => setActiveTable(tableName)}
                    onMouseLeave={() => setActiveTable(null)}
                    onClick={(e) => handleTableClick(tableName, e)}
                    onFocus={() => setActiveTable(tableName)}
                    onBlur={() => setActiveTable(null)}
                    onKeyDown={(e) => handleTableKeyDown(tableName, e)}
                    tabIndex={0}
                    role="button"
                    aria-label={ariaLabelText}
                  >
                    {/* Container Rect */}
                    <rect
                      x="0"
                      y="0"
                      width={geom.width}
                      height={geom.height}
                      className="fill-white dark:fill-surface-1"
                      stroke={isActive ? colors.border : '#E2E8F0'}
                      strokeWidth={isActive ? '2.5' : '1'}
                      rx="6"
                      filter="url(#erd-subtle-shadow)"
                    />

                    {/* Table Header Fill */}
                    <path
                      d={`M 0 6 A 6 6 0 0 1 6 0 L ${geom.width - 6} 0 A 6 6 0 0 1 ${geom.width} 6 L ${geom.width} 28 L 0 28 Z`}
                      fill={colors.bg}
                    />
                    <line x1="0" y1="28" x2={geom.width} y2="28" stroke={colors.border} strokeWidth="1.5" />

                    {/* Table Name */}
                    <text
                      x="10"
                      y="18"
                      className="font-sans font-bold text-[12px] tracking-tight"
                      fill={colors.text}
                    >
                      {tableName}
                    </text>

                    {/* Live Row Count Badge inside Header */}
                    <g transform={`translate(${geom.width - 42}, 6)`}>
                      <rect
                        x="0"
                        y="0"
                        width="34"
                        height="16"
                        rx="3"
                        fill={colors.badgeBg}
                        stroke={colors.badgeBorder}
                        strokeWidth="1"
                      />
                      <text
                        x="17"
                        y="12"
                        textAnchor="middle"
                        className="font-mono text-[9px] font-bold"
                        fill={colors.badgeText}
                      >
                        {rowCount}
                      </text>
                    </g>

                    {/* Columns List */}
                    {table.columns.map((col, idx) => {
                      const yPos = 46 + idx * 21;
                      const isPk = Boolean(col.isPk);
                      const isFk = Boolean(col.isFk);

                      let tag = '';
                      if (isPk && isFk) tag = '[PK, FK]';
                      else if (isPk) tag = '[PK]';
                      else if (isFk) tag = '[FK]';

                      return (
                        <g key={col.name}>
                          {/* Column Name */}
                          <text
                            x="10"
                            y={yPos}
                            className={`font-sans text-[11px] fill-[#0F172A] dark:fill-white ${
                              isPk ? 'font-bold underline' : 'font-normal'
                            }`}
                          >
                            {col.name}
                          </text>

                          {/* Key Tag or Type */}
                          <text
                            x={geom.width - 8}
                            y={yPos}
                            textAnchor="end"
                            className={`font-mono text-[9px] ${
                              tag ? 'fill-[#041a24] dark:fill-[#3ECF8E] font-bold' : 'fill-[#64748B] dark:fill-slate-400'
                            }`}
                          >
                            {tag || col.type.toLowerCase()}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Swipe hint for narrow viewports */}
        <div className="block lg:hidden text-center mt-1">
          <span className="text-[10px] font-sans text-[#7A8781]">
            Swipe to view the full architecture diagram.
          </span>
        </div>
      </div>

      {/* Floating Tooltip for restricted access */}
      {tooltip && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full px-2.5 py-1 bg-[#041a24] text-white text-[11px] font-medium rounded shadow-md pointer-events-none"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          {tooltip.text}
        </div>
      )}

      {/* 3. Legend & Accompanying Narrative */}
      <div className="pt-3 border-t border-gray-200/80 dark:border-border">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs text-[#041a24] dark:text-white">
          {/* Notation Symbols */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#041a24] dark:text-white text-[11px]">Notation:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#52615B] dark:text-slate-300">
              <span className="font-bold text-[#041a24] dark:text-white">||</span>
              <span className="font-sans text-[11px]">Exactly one</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#52615B] dark:text-slate-300">
              <span className="font-bold text-[#041a24] dark:text-white">0&lt;</span>
              <span className="font-sans text-[11px]">Zero or many</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#52615B] dark:text-slate-300">
              <span className="font-bold text-[#041a24] dark:text-white">|&lt;</span>
              <span className="font-sans text-[11px]">One or many</span>
            </div>
          </div>

          {/* Module Color Swatches */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#041a24] dark:text-white text-[11px]">Sections:</span>
            {ERD_MODULES.map((mod) => {
              const col = MODULE_COLORS[mod.id];
              return (
                <div key={mod.id} className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-[2px] border shadow-2xs"
                    style={{ backgroundColor: col.bg, borderColor: col.border }}
                  />
                  <span className="text-[11px] font-semibold text-[#374151] dark:text-slate-200">{mod.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
