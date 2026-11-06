'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ERD_TABLES,
  ERD_GEOMETRY,
  ERD_MODULES,
  ERD_RELATIONSHIPS,
  type ErdModuleId,
} from '@/lib/erd';
import type { UserRole } from '@/lib/types';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
} from 'lucide-react';

interface ErdDiagramProps {
  counts: Record<string, number>;
  userRole?: UserRole;
  defaultExpanded?: boolean;
}

// Module color tokens
const MODULE_COLORS: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    cardBorder: string;
    glow: string;
  }
> = {
  employees: {
    bg: '#DBEAFE',
    border: '#3B82F6',
    text: '#1E3A8A',
    badgeBg: '#EFF6FF',
    badgeBorder: '#93C5FD',
    badgeText: '#1D4ED8',
    cardBorder: 'border-blue-400 dark:border-blue-500',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  sales: {
    bg: '#FEE2E2',
    border: '#EF4444',
    text: '#7F1D1D',
    badgeBg: '#FEF2F2',
    badgeBorder: '#FCA5A5',
    badgeText: '#B91C1C',
    cardBorder: 'border-red-400 dark:border-red-500',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  products: {
    bg: '#DCFCE7',
    border: '#22C55E',
    text: '#14532D',
    badgeBg: '#F0FDF4',
    badgeBorder: '#86EFAC',
    badgeText: '#15803D',
    cardBorder: 'border-emerald-400 dark:border-emerald-500',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  customers: {
    bg: '#FEF9C3',
    border: '#EAB308',
    text: '#713F12',
    badgeBg: '#FEFCE8',
    badgeBorder: '#FDE047',
    badgeText: '#A16207',
    cardBorder: 'border-yellow-400 dark:border-yellow-500',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
};

interface ConnectionPath {
  id: string;
  d: string;
  label: string;
  businessMeaning: string;
  midX: number;
  midY: number;
  labelWidth: number;
  fromTable: string;
  toTable: string;
  fromCardinality: '1' | '0..1';
  toCardinality: '0..*' | '1..*';
  startPoint: { x: number; y: number; dir: 'left' | 'right' | 'top' | 'bottom' };
  endPoint: { x: number; y: number; dir: 'left' | 'right' | 'top' | 'bottom' };
}

// 9 Canonical Relationships mapped to 1440 x 760 layout with generous spacing
const RELATIONSHIP_PATHS: ConnectionPath[] = [
  {
    id: 'rel_dept_jobhistory',
    fromTable: 'DEPARTMENT',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Assigned Dept',
    businessMeaning: 'One department assigns staff positions to zero or many job history entries.',
    d: 'M 250 88 L 300 88 L 300 140 L 350 140',
    midX: 300,
    midY: 114,
    labelWidth: 92,
    startPoint: { x: 250, y: 88, dir: 'right' },
    endPoint: { x: 350, y: 140, dir: 'left' },
  },
  {
    id: 'rel_job_jobhistory',
    fromTable: 'JOB',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Position Held',
    businessMeaning: 'One job title is appointed to zero or many job history records.',
    d: 'M 250 223 L 350 223',
    midX: 300,
    midY: 223,
    labelWidth: 90,
    startPoint: { x: 250, y: 223, dir: 'right' },
    endPoint: { x: 350, y: 223, dir: 'left' },
  },
  {
    id: 'rel_emp_jobhistory',
    fromTable: 'EMPLOYEE',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'Career History',
    businessMeaning: 'Each employee has one or more chronological job appointments.',
    d: 'M 250 360 L 465 360 L 465 273',
    midX: 350,
    midY: 360,
    labelWidth: 94,
    startPoint: { x: 250, y: 360, dir: 'right' },
    endPoint: { x: 465, y: 273, dir: 'bottom' },
  },
  {
    id: 'rel_emp_sales',
    fromTable: 'EMPLOYEE',
    toTable: 'SALES',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Sales Rep Handled',
    businessMeaning: 'An employee acts as the assigned representative for zero or many sales orders.',
    d: 'M 250 430 L 680 430',
    midX: 465,
    midY: 430,
    labelWidth: 120,
    startPoint: { x: 250, y: 430, dir: 'right' },
    endPoint: { x: 680, y: 430, dir: 'left' },
  },
  {
    id: 'rel_cust_sales',
    fromTable: 'CUSTOMER',
    toTable: 'SALES',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Customer Orders',
    businessMeaning: 'A customer account places zero or many sales orders.',
    d: 'M 785 184 L 785 310',
    midX: 785,
    midY: 247,
    labelWidth: 108,
    startPoint: { x: 785, y: 184, dir: 'bottom' },
    endPoint: { x: 785, y: 310, dir: 'top' },
  },
  {
    id: 'rel_sales_payment',
    fromTable: 'SALES',
    toTable: 'PAYMENT',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Payment Receipts',
    businessMeaning: 'A sales invoice receives zero or many official payment receipts.',
    d: 'M 785 454 L 785 560',
    midX: 785,
    midY: 507,
    labelWidth: 114,
    startPoint: { x: 785, y: 454, dir: 'bottom' },
    endPoint: { x: 785, y: 560, dir: 'top' },
  },
  {
    id: 'rel_sales_salesdetail',
    fromTable: 'SALES',
    toTable: 'SALESDETAIL',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'Contains Line Items',
    businessMeaning: 'A sales invoice must contain one or more itemized product line items.',
    d: 'M 890 350 L 960 350',
    midX: 925,
    midY: 326,
    labelWidth: 116,
    startPoint: { x: 890, y: 350, dir: 'right' },
    endPoint: { x: 960, y: 350, dir: 'left' },
  },
  {
    id: 'rel_prod_salesdetail',
    fromTable: 'PRODUCT',
    toTable: 'SALESDETAIL',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Purchased SKU',
    businessMeaning: 'A catalog product appears in zero or many sales detail line items.',
    d: 'M 1210 350 L 1160 350',
    midX: 1185,
    midY: 326,
    labelWidth: 94,
    startPoint: { x: 1210, y: 350, dir: 'left' },
    endPoint: { x: 1160, y: 350, dir: 'right' },
  },
  {
    id: 'rel_prod_pricehist',
    fromTable: 'PRODUCT',
    toTable: 'PRICEHIST',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'Price Schedule',
    businessMeaning: 'A product has one or more effective unit prices over its lifecycle.',
    d: 'M 1310 310 L 1310 172',
    midX: 1310,
    midY: 241,
    labelWidth: 100,
    startPoint: { x: 1310, y: 310, dir: 'top' },
    endPoint: { x: 1310, y: 172, dir: 'bottom' },
  },
];

// Helper to draw clean Crow's Foot cardinality marks
function renderCardinalityMark(
  x: number,
  y: number,
  dir: 'left' | 'right' | 'top' | 'bottom',
  type: 'one' | 'zero_many' | 'one_many'
) {
  const strokeClass = 'stroke-[#17231F] dark:stroke-slate-300';

  if (dir === 'left') {
    if (type === 'zero_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <circle cx={x - 14} cy={y} r="3" className="fill-white dark:fill-surface-1" />
          <path d={`M ${x - 9} ${y} L ${x} ${y - 6} M ${x - 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    if (type === 'one_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <line x1={x - 13} y1={y - 6} x2={x - 13} y2={y + 6} />
          <path d={`M ${x - 9} ${y} L ${x} ${y - 6} M ${x - 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    return (
      <g className={strokeClass} strokeWidth="1.5">
        <line x1={x + 4} y1={y - 6} x2={x + 4} y2={y + 6} />
        <line x1={x + 9} y1={y - 6} x2={x + 9} y2={y + 6} />
      </g>
    );
  }

  if (dir === 'right') {
    if (type === 'zero_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <circle cx={x + 14} cy={y} r="3" className="fill-white dark:fill-surface-1" />
          <path d={`M ${x + 9} ${y} L ${x} ${y - 6} M ${x + 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    if (type === 'one_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <line x1={x + 13} y1={y - 6} x2={x + 13} y2={y + 6} />
          <path d={`M ${x + 9} ${y} L ${x} ${y - 6} M ${x + 9} ${y} L ${x} ${y + 6}`} />
        </g>
      );
    }
    return (
      <g className={strokeClass} strokeWidth="1.5">
        <line x1={x - 4} y1={y - 6} x2={x - 4} y2={y + 6} />
        <line x1={x - 9} y1={y - 6} x2={x - 9} y2={y + 6} />
      </g>
    );
  }

  if (dir === 'bottom') {
    if (type === 'zero_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <circle cx={x} cy={y + 14} r="3" className="fill-white dark:fill-surface-1" />
          <path d={`M ${x} ${y + 9} L ${x - 6} ${y} M ${x} ${y + 9} L ${x + 6} ${y}`} />
        </g>
      );
    }
    if (type === 'one_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <line x1={x - 6} y1={y + 13} x2={x + 6} y2={y + 13} />
          <path d={`M ${x} ${y + 9} L ${x - 6} ${y} M ${x} ${y + 9} L ${x + 6} ${y}`} />
        </g>
      );
    }
    return (
      <g className={strokeClass} strokeWidth="1.5">
        <line x1={x - 6} y1={y - 4} x2={x + 6} y2={y - 4} />
        <line x1={x - 6} y1={y - 9} x2={x + 6} y2={y - 9} />
      </g>
    );
  }

  if (dir === 'top') {
    if (type === 'zero_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <circle cx={x} cy={y - 14} r="3" className="fill-white dark:fill-surface-1" />
          <path d={`M ${x} ${y - 9} L ${x - 6} ${y} M ${x} ${y - 9} L ${x + 6} ${y}`} />
        </g>
      );
    }
    if (type === 'one_many') {
      return (
        <g className={strokeClass} strokeWidth="1.5" fill="none">
          <line x1={x - 6} y1={y - 13} x2={x + 6} y2={y - 13} />
          <path d={`M ${x} ${y - 9} L ${x - 6} ${y} M ${x} ${y - 9} L ${x + 6} ${y}`} />
        </g>
      );
    }
    return (
      <g className={strokeClass} strokeWidth="1.5">
        <line x1={x - 6} y1={y + 4} x2={x + 6} y2={y + 4} />
        <line x1={x - 6} y1={y + 9} x2={x + 6} y2={y + 9} />
      </g>
    );
  }

  return null;
}

export function ErdDiagram({
  counts,
  userRole = 'admin',
  defaultExpanded = false,
}: ErdDiagramProps) {
  const router = useRouter();

  // State
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [activeModuleFilter, setActiveModuleFilter] = useState<'ALL' | ErdModuleId>('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLegend, setShowLegend] = useState(true);

  // Keyboard navigation & Esc listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (selectedTable) setSelectedTable(null);
        else if (isModalOpen) setIsModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTable, isModalOpen]);

  // Total canonical records
  const totalRowsCount = useMemo(() => {
    return Object.values(counts).reduce((acc, c) => acc + (c || 0), 0);
  }, [counts]);

  // Active highlighted table
  const currentActiveTable = hoveredTable || selectedTable;

  // Active relationship lines for current highlighted table
  const activeRelationshipIds = useMemo(() => {
    if (!currentActiveTable) return new Set<string>();
    const ids = new Set<string>();
    RELATIONSHIP_PATHS.forEach((rel) => {
      if (rel.fromTable === currentActiveTable || rel.toTable === currentActiveTable) {
        ids.add(rel.id);
      }
    });
    return ids;
  }, [currentActiveTable]);

  // Is table in active module filter?
  const isTableInFilter = (tableName: string) => {
    if (activeModuleFilter === 'ALL') return true;
    return ERD_TABLES[tableName]?.moduleId === activeModuleFilter;
  };

  // Inspect selected table data
  const inspectTable = selectedTable ? ERD_TABLES[selectedTable] : null;

  // ------------------------------------------------------------------------
  // 1. COMPACT DASHBOARD SUMMARY CARD (SPACE-SAVING FOR /home)
  // ------------------------------------------------------------------------
  const renderCompactCard = () => (
    <div className="bg-white dark:bg-surface-1 rounded-[4px] border border-black/10 dark:border-border p-5 sm:p-6 shadow-2xs space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-lg sm:text-xl font-normal text-[#041a24] dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Relational Database Architecture</span>
            </h2>
            <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-[2px] bg-[#041a24] dark:bg-surface-2 dark:border dark:border-border text-white">
              10 Tables &bull; 9 Foreign Keys
            </span>
          </div>
          <p className="text-xs text-[#41555f] dark:text-slate-300 mt-0.5">
            Canonical 3NF ERD schema with full Audit Trail engine ({totalRowsCount} live coursework records).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium border border-black/15 dark:border-border bg-black/5 dark:bg-surface-2 hover:bg-black/10 text-[#041a24] dark:text-white transition-all cursor-pointer"
            title={isExpanded ? 'Collapse inline architecture view' : 'Expand inline architecture view'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Collapse in Page</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Expand in Page</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] text-xs font-mono font-semibold bg-[#041a24] dark:bg-white text-white dark:text-slate-900 hover:bg-[#0c2e3f] shadow-2xs transition-all cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Click to View Architecture &amp; ERD</span>
          </button>
        </div>
      </div>

      {/* 4 Business Module Badges with Live Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {ERD_MODULES.map((mod) => {
          const modTables = mod.tables;
          const modTotalRows = modTables.reduce((acc, t) => acc + (counts[t] || 0), 0);
          const colorToken = MODULE_COLORS[mod.id];

          return (
            <div
              key={mod.id}
              onClick={() => {
                setActiveModuleFilter(mod.id);
                setIsModalOpen(true);
              }}
              className="p-3 rounded-[3px] border border-black/10 dark:border-border bg-[#F9FAF9] dark:bg-surface-2 hover:border-black/30 dark:hover:border-slate-500 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#41555f] dark:text-slate-300">
                  {mod.name}
                </span>
                <span
                  className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded border"
                  style={{
                    backgroundColor: colorToken.badgeBg,
                    borderColor: colorToken.badgeBorder,
                    color: colorToken.badgeText,
                  }}
                >
                  {modTotalRows} rows
                </span>
              </div>
              <div className="text-xs text-[#041a24] dark:text-white font-semibold flex items-center justify-between">
                <span>{modTables.join(' &bull; ')}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#041a24] dark:text-white" />
              </div>
              <p className="text-[11px] text-[#52615B] dark:text-slate-400 line-clamp-1">
                {mod.mainList}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ------------------------------------------------------------------------
  // 2. MAIN SVG CANVAS & PRESENTATION CONTROLS
  // ------------------------------------------------------------------------
  const renderSvgCanvas = (isModalMode: boolean = false) => (
    <div className="space-y-4">
      {/* Top Presentation Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F4F4F0] dark:bg-surface-2 p-2.5 rounded-[4px] border border-black/10 dark:border-border">
        {/* Module Focus Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-[#41555f] dark:text-slate-400 mr-1 text-[11px] uppercase tracking-wider">
            Focus:
          </span>
          <button
            type="button"
            onClick={() => setActiveModuleFilter('ALL')}
            className={`px-2.5 py-1 rounded-[2px] transition-all cursor-pointer font-medium ${
              activeModuleFilter === 'ALL'
                ? 'bg-[#041a24] dark:bg-white text-white dark:text-slate-900 shadow-2xs font-semibold'
                : 'bg-white dark:bg-surface-1 border border-black/10 dark:border-border text-[#41555f] dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            All Modules (10 Tables)
          </button>

          {ERD_MODULES.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => setActiveModuleFilter(mod.id)}
              className={`px-2.5 py-1 rounded-[2px] transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                activeModuleFilter === mod.id
                  ? 'bg-[#041a24] dark:bg-white text-white dark:text-slate-900 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-surface-1 border border-black/10 dark:border-border text-[#41555f] dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: MODULE_COLORS[mod.id].border }}
              />
              <span>{mod.name}</span>
            </button>
          ))}
        </div>

        {/* View Controls & Zoom */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className="p-1.5 rounded-[2px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 text-[#41555f] dark:text-slate-300 hover:text-black dark:hover:text-white text-xs cursor-pointer inline-flex items-center gap-1"
            title="Toggle Cardinality Legend"
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-mono text-[11px]">Legend</span>
          </button>

          <div className="flex items-center border border-black/10 dark:border-border rounded-[2px] bg-white dark:bg-surface-1 p-0.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1 hover:bg-black/5 dark:hover:bg-surface-2 rounded text-[#41555f] dark:text-slate-300 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-[#041a24] dark:text-white tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 hover:bg-black/5 dark:hover:bg-surface-2 rounded text-[#41555f] dark:text-slate-300 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-black/5 dark:hover:bg-surface-2 rounded text-[#41555f] dark:text-slate-300 border-l border-black/10 dark:border-border ml-0.5 cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {!isModalMode && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-[2px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 text-[#41555f] dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
              title="Open full-screen presentation view"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Module Banner Note */}
      {activeModuleFilter !== 'ALL' && (
        <div className="px-4 py-2.5 rounded-[3px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: MODULE_COLORS[activeModuleFilter].border }}
            />
            <span className="font-semibold text-[#041a24] dark:text-white">
              {ERD_MODULES.find((m) => m.id === activeModuleFilter)?.name}:
            </span>
            <span className="text-[#52615B] dark:text-slate-300">
              {ERD_MODULES.find((m) => m.id === activeModuleFilter)?.workflowSummary}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModuleFilter('ALL')}
            className="text-[11px] font-mono text-[#41555f] hover:text-black dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
          >
            Show All Tables
          </button>
        </div>
      )}

      {/* SVG Canvas Container with Scroll / Overflow */}
      <div className="relative rounded-[4px] border border-black/10 dark:border-border bg-[#FCFCFA] dark:bg-surface-1 overflow-x-auto overflow-y-hidden shadow-inner">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${1440 * zoomLevel}px`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          <svg
            viewBox="0 0 1440 750"
            className="w-[1440px] h-[750px] select-none"
            aria-label="Relational Database Architecture Diagram"
          >
            <defs>
              <filter id="erd-pill-shadow" x="-10%" y="-20%" width="120%" height="150%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* 1. BACKGROUND RELATIONSHIP LINES */}
            <g className="relationships">
              {RELATIONSHIP_PATHS.map((rel) => {
                const isActive = activeRelationshipIds.has(rel.id);
                const isFilteredIn =
                  activeModuleFilter === 'ALL' ||
                  ERD_TABLES[rel.fromTable]?.moduleId === activeModuleFilter ||
                  ERD_TABLES[rel.toTable]?.moduleId === activeModuleFilter;

                const opacity = !isFilteredIn
                  ? 0.12
                  : currentActiveTable && !isActive
                  ? 0.25
                  : 1;

                const strokeColor = isActive ? '#0F172A' : '#718096';
                const strokeWidth = isActive ? 2.5 : 1.5;

                return (
                  <g
                    key={rel.id}
                    style={{ opacity, transition: 'opacity 0.2s, stroke 0.2s' }}
                    className="cursor-pointer"
                  >
                    {/* Path line */}
                    <path
                      d={rel.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Cardinality marks */}
                    {renderCardinalityMark(
                      rel.startPoint.x,
                      rel.startPoint.y,
                      rel.startPoint.dir,
                      rel.fromCardinality === '1' ? 'one' : 'one'
                    )}
                    {renderCardinalityMark(
                      rel.endPoint.x,
                      rel.endPoint.y,
                      rel.endPoint.dir,
                      rel.toCardinality === '0..*'
                        ? 'zero_many'
                        : rel.toCardinality === '1..*'
                        ? 'one_many'
                        : 'one'
                    )}

                    {/* Clean Pill Label on top of line */}
                    <g className="label-badge">
                      <rect
                        x={rel.midX - rel.labelWidth / 2}
                        y={rel.midY - 11}
                        width={rel.labelWidth}
                        height={22}
                        rx="4"
                        fill="#FFFFFF"
                        stroke={isActive ? '#041A24' : '#CCD5CD'}
                        strokeWidth={isActive ? '1.5' : '1'}
                        filter="url(#erd-pill-shadow)"
                      />
                      <text
                        x={rel.midX}
                        y={rel.midY + 3.5}
                        textAnchor="middle"
                        className={`text-[10px] font-mono font-semibold ${
                          isActive
                            ? 'fill-[#041A24] font-bold'
                            : 'fill-[#2D3748]'
                        }`}
                      >
                        {rel.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* 2. FOREGROUND TABLE BOXES */}
            <g className="tables">
              {Object.keys(ERD_TABLES).map((tableName) => {
                const table = ERD_TABLES[tableName];
                const geom = ERD_GEOMETRY[tableName];
                const count = counts[tableName] ?? 0;
                const colors = MODULE_COLORS[table.moduleId];

                const isFilteredIn = isTableInFilter(tableName);
                const isSelected = selectedTable === tableName;
                const isHovered = hoveredTable === tableName;
                const isIncident = activeRelationshipIds.size > 0 && isTableConnected(tableName, currentActiveTable);

                const opacity = !isFilteredIn
                  ? 0.2
                  : currentActiveTable && !isSelected && !isHovered && !isIncident
                  ? 0.45
                  : 1;

                return (
                  <g
                    key={tableName}
                    transform={`translate(${geom.x}, ${geom.y})`}
                    style={{ opacity, transition: 'opacity 0.2s, transform 0.2s' }}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTable(tableName)}
                    onMouseLeave={() => setHoveredTable(null)}
                    onClick={() => setSelectedTable((prev) => (prev === tableName ? null : tableName))}
                  >
                    {/* Outer Table Box Container */}
                    <rect
                      x="0"
                      y="0"
                      width={geom.width}
                      height={geom.height}
                      rx="3"
                      fill="#FFFFFF"
                      className="dark:fill-surface-1"
                      stroke={
                        isSelected || isHovered
                          ? '#041A24'
                          : colors.border
                      }
                      strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                      filter={isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : undefined}
                    />

                    {/* Table Header with Module Tint */}
                    <path
                      d={`M 0 3 Q 0 0 3 0 L ${geom.width - 3} 0 Q ${geom.width} 0 ${geom.width} 3 L ${geom.width} 28 L 0 28 Z`}
                      fill={colors.bg}
                      stroke={colors.border}
                      strokeWidth="0.5"
                    />

                    {/* Table Name */}
                    <text
                      x="10"
                      y="18"
                      className="font-mono text-[11px] font-bold tracking-tight"
                      fill={colors.text}
                    >
                      {table.name}
                    </text>

                    {/* Row Count Pill Badge */}
                    <g transform={`translate(${geom.width - 45}, 6)`}>
                      <rect
                        x="0"
                        y="0"
                        width="36"
                        height="16"
                        rx="2"
                        fill={colors.badgeBg}
                        stroke={colors.badgeBorder}
                        strokeWidth="1"
                      />
                      <text
                        x="18"
                        y="11.5"
                        textAnchor="middle"
                        className="font-mono text-[10px] font-bold"
                        fill={colors.badgeText}
                      >
                        {count}
                      </text>
                    </g>

                    {/* Column List (First 5-7 core business columns) */}
                    {table.columns.slice(0, 7).map((col, idx) => {
                      const yPos = 44 + idx * 16;
                      const isPk = Boolean(col.isPk);
                      const isFk = Boolean(col.isFk);

                      return (
                        <g key={col.name}>
                          {/* Column Name */}
                          <text
                            x="10"
                            y={yPos}
                            className={`font-mono text-[10px] ${
                              isPk
                                ? 'font-bold fill-[#041A24] dark:fill-white underline'
                                : 'fill-[#2D3748] dark:fill-slate-300'
                            }`}
                          >
                            {col.name}
                          </text>

                          {/* Data Type */}
                          <text
                            x={geom.width - 55}
                            y={yPos}
                            textAnchor="end"
                            className="font-mono text-[9px] fill-[#718096] dark:fill-slate-400"
                          >
                            {col.type.toLowerCase()}
                          </text>

                          {/* Key Tag [PK] / [FK] */}
                          <text
                            x={geom.width - 8}
                            y={yPos}
                            textAnchor="end"
                            className={`font-mono text-[9px] font-bold ${
                              isPk && isFk
                                ? 'fill-indigo-600 dark:fill-indigo-400'
                                : isPk
                                ? 'fill-[#1D4ED8] dark:fill-blue-400'
                                : isFk
                                ? 'fill-[#047857] dark:fill-emerald-400'
                                : 'fill-transparent'
                            }`}
                          >
                            {isPk && isFk ? '[PK, FK]' : isPk ? '[PK]' : isFk ? '[FK]' : ''}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Cardinality Notation Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-[3px] bg-white dark:bg-surface-1 border border-black/10 dark:border-border text-xs font-sans">
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="font-semibold text-[#041a24] dark:text-white uppercase tracking-wider text-[10px]">
              Notation:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#17231F] dark:text-white">||</span>
              <span className="text-[#52615B] dark:text-slate-300">Exactly one</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#17231F] dark:text-white">0&lt;</span>
              <span className="text-[#52615B] dark:text-slate-300">Zero or many</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#17231F] dark:text-white">|&lt;</span>
              <span className="text-[#52615B] dark:text-slate-300">One or many</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-sans">
            <span className="font-semibold text-[#041a24] dark:text-white uppercase tracking-wider text-[10px] font-mono">
              Sections:
            </span>
            {ERD_MODULES.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-[2px] border"
                  style={{
                    backgroundColor: MODULE_COLORS[m.id].bg,
                    borderColor: MODULE_COLORS[m.id].border,
                  }}
                />
                <span className="text-[#52615B] dark:text-slate-300 font-medium">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TABLE INSPECTOR DRAWER / MODAL POPUP */}
      {inspectTable && (
        <div className="p-4 rounded-[4px] border-2 border-[#041A24] dark:border-white/30 bg-white dark:bg-surface-1 shadow-lg space-y-4">
          <div className="flex items-start justify-between border-b border-black/10 dark:border-border pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold text-[#041A24] dark:text-white">
                  Table: {inspectTable.name}
                </h3>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                  style={{
                    backgroundColor: MODULE_COLORS[inspectTable.moduleId].badgeBg,
                    borderColor: MODULE_COLORS[inspectTable.moduleId].badgeBorder,
                    color: MODULE_COLORS[inspectTable.moduleId].badgeText,
                  }}
                >
                  {inspectTable.moduleName}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/5 dark:bg-surface-2 font-bold text-[#041A24] dark:text-white">
                  {counts[inspectTable.name] ?? 0} Live Records
                </span>
              </div>
              <p className="text-xs text-[#52615B] dark:text-slate-300">
                {inspectTable.businessUsage}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={ERD_MODULES.find((m) => m.id === inspectTable.moduleId)?.href || '/'}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[2px] text-xs font-mono font-semibold bg-[#041A24] dark:bg-white text-white dark:text-slate-900 hover:bg-[#0c2e3f] transition-all"
              >
                <span>Open {inspectTable.moduleName}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="p-1 rounded text-[#52615B] hover:text-black dark:text-slate-400 dark:hover:text-white cursor-pointer"
                title="Close Inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Column Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-black/10 dark:border-border text-[10px] text-[#52615B] dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-1.5 px-2">Column Name</th>
                  <th className="py-1.5 px-2">Data Type</th>
                  <th className="py-1.5 px-2">Constraint</th>
                  <th className="py-1.5 px-2">Foreign Key Target</th>
                  <th className="py-1.5 px-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-border text-xs">
                {inspectTable.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-black/5 dark:hover:bg-surface-2">
                    <td className="py-1.5 px-2 font-bold text-[#041A24] dark:text-white">
                      {col.name}
                    </td>
                    <td className="py-1.5 px-2 text-[#52615B] dark:text-slate-300">
                      {col.type}
                    </td>
                    <td className="py-1.5 px-2">
                      {col.isPk && col.isFk ? (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]">
                          PK, FK
                        </span>
                      ) : col.isPk ? (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px]">
                          Primary Key
                        </span>
                      ) : col.isFk ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                          Foreign Key
                        </span>
                      ) : (
                        <span className="text-slate-400">&mdash;</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-indigo-700 dark:text-indigo-400 font-medium">
                      {col.fkTarget || '&mdash;'}
                    </td>
                    <td className="py-1.5 px-2 font-sans text-[#52615B] dark:text-slate-300">
                      {col.description || inspectTable.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Helper to test if two tables are connected
  function isTableConnected(tableA: string, tableB: string | null): boolean {
    if (!tableB) return false;
    return RELATIONSHIP_PATHS.some(
      (r) =>
        (r.fromTable === tableA && r.toTable === tableB) ||
        (r.fromTable === tableB && r.toTable === tableA)
    );
  }

  // ------------------------------------------------------------------------
  // 3. RENDER WORKSPACE (COMPACT CARD ON /home + EXPAND & MODAL PRESENTATION)
  // ------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* 1. Compact Dashboard Card */}
      {renderCompactCard()}

      {/* 2. In-Page Expanded View (Toggled when user clicks "Expand in Page") */}
      {isExpanded && (
        <div className="bg-white dark:bg-surface-1 rounded-[4px] border border-black/10 dark:border-border p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-border pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#041a24] dark:text-white" />
              <h3 className="font-editorial text-lg text-[#041a24] dark:text-white">
                Interactive Relational Architecture Canvas
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs font-mono text-[#52615B] hover:text-black dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Hide diagram</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
          {renderSvgCanvas(false)}
        </div>
      )}

      {/* 3. Full-Screen Interactive Presentation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-surface-1 rounded-lg border border-black/20 dark:border-border shadow-2xl w-full max-w-[1500px] max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-border bg-[#FAFAFA] dark:bg-surface-2 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#041a24] text-white">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#041a24] dark:text-white font-editorial">
                      Canonical Relational Database Architecture
                    </h2>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Third Normal Form (3NF)
                    </span>
                  </div>
                  <p className="text-xs text-[#52615B] dark:text-slate-300 mt-0.5 font-sans">
                    Complete schema mapping departments, jobs, employees, customers, products, sales, and receipts with audit integrity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-md hover:bg-black/10 dark:hover:bg-surface-3 text-[#52615B] dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                  aria-label="Close presentation modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Full Canvas */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {renderSvgCanvas(true)}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-black/10 dark:border-border bg-[#F4F4F0] dark:bg-surface-2 flex items-center justify-between text-xs font-mono text-[#52615B] dark:text-slate-400 shrink-0">
              <div className="flex items-center gap-4">
                <span>&bull; Press <strong>Esc</strong> to close</span>
                <span>&bull; Click any table to inspect fields and foreign keys</span>
                <span>&bull; Use Focus buttons to spotlight individual modules</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-[2px] font-semibold bg-[#041a24] dark:bg-white text-white dark:text-slate-900 hover:bg-[#0c2e3f] cursor-pointer"
              >
                Close Architecture View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
