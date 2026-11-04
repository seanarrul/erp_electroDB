'use client';

import React, { useState, useMemo, useEffect, useTransition, useDeferredValue, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SaleDetailPanel } from './SaleDetailPanel';

const NewSaleModal = dynamic(
  () => import('./NewSaleModal').then((mod) => mod.NewSaleModal),
  { ssr: false }
);
import { RightSideKpiPanel } from '@/components/ui/RightSideKpiPanel';
import { formatPHP, formatDate } from '@/lib/utils';
import type {
  SalesSummaryItem,
  SaleLineItem,
  SalesSummaryMetrics,
  SaleLookupData,
  SaleDetailData,
} from '@/lib/data/sales';
import {
  Search,
  Download,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  FileSpreadsheet,
  ShoppingBag,
  Layers,
  DollarSign,
  Users,
} from 'lucide-react';

interface SalesMainViewProps {
  initialSales: SalesSummaryItem[];
  initialLines: SaleLineItem[];
  metrics: SalesSummaryMetrics;
  lookups: SaleLookupData;
  userRole?: string;
  initialOpenNewSale?: boolean;
}

export function SalesMainView({
  initialSales,
  initialLines,
  metrics,
  lookups,
  userRole = 'sales',
  initialOpenNewSale = false,
}: SalesMainViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const isAdmin = userRole.toLowerCase() === 'admin';
  const isSales = userRole.toLowerCase() === 'sales' || isAdmin;

  // Read URL State
  const activeView = (searchParams.get('view') === 'lines' ? 'lines' : 'sales') as
    | 'sales'
    | 'lines';
  const selectedCode = searchParams.get('code') || null;
  const searchQuery = searchParams.get('q') || '';
  const periodFilter = searchParams.get('period') || 'all';
  const deptFilter = searchParams.get('dept') || 'all';
  const repFilter = searchParams.get('rep') ? Number(searchParams.get('rep')) : 0;
  const sortCol = searchParams.get('sort') || (activeView === 'lines' ? 'transNo' : 'salesDate');
  const sortOrder = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = [10, 25, 50].includes(parseInt(searchParams.get('size') || '10', 10))
    ? parseInt(searchParams.get('size') || '10', 10)
    : 10;

  // Responsive drawer vs column
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1280);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Modal state
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(initialOpenNewSale);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Local Search state for instant, zero-lag typing
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const deferredSearch = useDeferredValue(localSearch);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize local search state if URL updates externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // URL State Updater (uses router.replace to avoid history pollution and full reload costs)
  const updateUrl = (updates: Record<string, string | null>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      router.replace(`/sales?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      updateUrl({ q: val ? val : null, page: '1' });
    }, 300);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    updateUrl({ q: null, page: '1' });
  };

  const handleClearAllFilters = () => {
    setLocalSearch('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    updateUrl({ q: null, period: null, dept: null, rep: null, page: '1' });
  };

  // 1. Filtered Sales (uses deferredSearch for non-blocking rendering)
  const filteredSales = useMemo(() => {
    const matchesPeriod = (dateStr: string) => {
      if (periodFilter === 'all') return true;
      const todayStr = '2026-10-28';
      if (periodFilter === 'today') return dateStr === todayStr;
      if (periodFilter === 'week') return dateStr >= '2026-10-22' && dateStr <= todayStr;
      if (periodFilter === 'month') return dateStr.startsWith('2026-10');
      if (periodFilter === 'year') return dateStr.startsWith('2026');
      return true;
    };

    return initialSales.filter((s) => {
      if (!matchesPeriod(s.salesDate)) return false;
      if (deptFilter !== 'all' && s.deptCode !== deptFilter) return false;
      if (repFilter !== 0 && s.empNo !== repFilter) return false;

      if (deferredSearch) {
        const q = deferredSearch.toLowerCase().trim();
        const matchesNo = String(s.transNo).includes(q);
        const matchesCust = s.custName.toLowerCase().includes(q) || String(s.custNo).includes(q);
        const matchesRep = s.repName.toLowerCase().includes(q);
        const matchesDept = s.deptName.toLowerCase().includes(q) || s.deptCode.toLowerCase().includes(q);
        if (!matchesNo && !matchesCust && !matchesRep && !matchesDept) return false;
      }

      return true;
    });
  }, [initialSales, periodFilter, deptFilter, repFilter, deferredSearch]);

  // Set of matching transNos
  const matchingTransNos = useMemo(() => {
    return new Set(filteredSales.map((s) => s.transNo));
  }, [filteredSales]);

  // 2. Filtered Lines
  const filteredLines = useMemo(() => {
    return initialLines.filter((l) => {
      // Must match filtered sales
      if (!matchingTransNos.has(l.transNo)) return false;

      // Text query on product fields
      if (deferredSearch) {
        const q = deferredSearch.toLowerCase().trim();
        const matchesProd =
          l.prodCode.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          String(l.transNo).includes(q) ||
          l.custName.toLowerCase().includes(q);
        if (!matchesProd) return false;
      }

      return true;
    });
  }, [initialLines, matchingTransNos, deferredSearch]);

  // 3. Sorting
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let valA: any = (a as any)[sortCol];
      let valB: any = (b as any)[sortCol];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredSales, sortCol, sortOrder]);

  const sortedLines = useMemo(() => {
    return [...filteredLines].sort((a, b) => {
      let valA: any = (a as any)[sortCol];
      let valB: any = (b as any)[sortCol];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredLines, sortCol, sortOrder]);

  // 4. Pagination
  const totalCount = activeView === 'sales' ? sortedSales.length : sortedLines.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);

  const paginatedSales = useMemo(() => {
    return sortedSales.slice(startIdx, endIdx);
  }, [sortedSales, startIdx, endIdx]);

  const paginatedLines = useMemo(() => {
    return sortedLines.slice(startIdx, endIdx);
  }, [sortedLines, startIdx, endIdx]);

  // 5. Selected Sale Detail Object
  const selectedSaleDetail: SaleDetailData | null = useMemo(() => {
    if (!selectedCode) return null;
    const cleanCode = selectedCode.trim();

    const sale = initialSales.find(
      (s) => String(s.transNo) === cleanCode || String(s.transNo).replace(/\D/g, '') === cleanCode.replace(/\D/g, '')
    );
    if (!sale) return null;

    const items = initialLines.filter(
      (l) => String(l.transNo) === String(sale.transNo)
    );

    // Receipts are fetched in detail page, but for the panel we construct from available data
    return {
      sale,
      items,
      payments: [],
    };
  }, [selectedCode, initialSales, initialLines]);

  const hasUnknownCode = Boolean(selectedCode && !selectedSaleDetail);

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      updateUrl({ order: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateUrl({ sort: colKey, order: 'desc', page: '1' });
    }
  };

  // Filtered total amount for results summary (Section 7.3)
  const filteredSalesTotal = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  }, [filteredSales]);

  // CSV Export (Section 15)
  const handleExportSummaryCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    const headers = [
      'Transaction number',
      'Sales date',
      'Customer no.',
      'Customer',
      'Employee no.',
      'Employee representative',
      'Department code',
      'Department',
    ];
    const rows = filteredSales.map((s) => [
      s.transNo,
      s.salesDate,
      s.custNo,
      `"${s.custName.replace(/"/g, '""')}"`,
      s.empNo,
      `"${s.repName.replace(/"/g, '""')}"`,
      s.deptCode,
      `"${s.deptName.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const handleExportLinesCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    const headers = [
      'Transaction number',
      'Product code',
      'Description',
      'Quantity',
    ];
    const rows = filteredLines.map((l) => [
      l.transNo,
      l.prodCode,
      `"${l.description.replace(/"/g, '""')}"`,
      l.quantity,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sale-lines-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const isFilterActive =
    localSearch !== '' || periodFilter !== 'all' || deptFilter !== 'all' || repFilter !== 0;

  return (
    <div className="space-y-6">
      {/* 7.1 Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-black/10 dark:border-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#41555f] dark:text-slate-400 block">
            ElectronDB G4 HopeERD &bull; Sales
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-[#041a24] dark:text-white mt-0.5">
            Sales &amp; Orders
          </h1>
          <p className="text-xs text-[#41555f] dark:text-slate-300 mt-0.5 font-sans">
            Operational sales transactions, order summaries, and line item details.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto relative">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="bg-white dark:bg-surface-1 border border-black/15 dark:border-border hover:bg-black/5 dark:hover:bg-surface-2 text-[#041a24] dark:text-text rounded-[2px] px-3.5 py-1.5 text-xs font-medium shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-black/40 dark:text-text-faint" />
              <span>Export CSV</span>
            </Button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-[2px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 py-1 shadow-lg z-20 text-xs font-mono">
                <button
                  type="button"
                  onClick={handleExportSummaryCSV}
                  className="w-full text-left px-3 py-2 text-[#041a24] dark:text-text hover:bg-[#F4F4F0] dark:hover:bg-surface-2 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-black/40 dark:text-text-faint" />
                  <span>Sales summary</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportLinesCSV}
                  className="w-full text-left px-3 py-2 text-[#041a24] dark:text-text hover:bg-[#F4F4F0] dark:hover:bg-surface-2 flex items-center gap-2 border-t border-black/5 dark:border-border cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-black/40 dark:text-text-faint" />
                  <span>Sales detail</span>
                </button>
              </div>
            )}
          </div>

          {isSales && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsNewSaleOpen(true)}
              className="bg-[#041a24] hover:bg-[#1c313b] text-white rounded-[2px] px-3.5 py-1.5 text-xs font-medium shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Sale</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2-Column Desktop Layout: Main Content (Left) + Right-Side Portrait KPI Panel (Right) */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* View Tabs & Search Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-1">
        {/* Left: View Tabs */}
        <div className="inline-flex p-1 bg-[#F4F4F0] rounded-[2px] border border-black/10 gap-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => updateUrl({ view: 'sales', page: '1' })}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] transition-all cursor-pointer font-medium ${
              activeView === 'sales'
                ? 'bg-[#041a24] text-white shadow-2xs'
                : 'text-[#41555f] hover:text-[#041a24]'
            }`}
          >
            <span>Sales</span>
            <span
              className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-[2px] ${
                activeView === 'sales'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'bg-black/5 text-[#41555f]'
              }`}
            >
              {filteredSales.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateUrl({ view: 'lines', page: '1' })}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] transition-all cursor-pointer font-medium ${
              activeView === 'lines'
                ? 'bg-[#041a24] text-white shadow-2xs'
                : 'text-[#41555f] hover:text-[#041a24]'
            }`}
          >
            <span>Sales Detail</span>
            <span
              className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-[2px] ${
                activeView === 'lines'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'bg-black/5 text-[#41555f]'
              }`}
            >
              {filteredLines.length}
            </span>
          </button>
        </div>

        {/* Right: Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Search Box */}
          <div className="relative min-w-[200px] sm:w-60 font-sans">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-black/40" />
            <input
              type="text"
              placeholder="Search sale, customer, rep..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-[2px] border border-black/15 bg-white pl-8 pr-7 py-1.5 text-xs text-[#041a24] placeholder:text-[#41555f]/60 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 focus:outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search query"
                className="absolute right-2 top-2 text-black/40 hover:text-[#041a24]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => updateUrl({ period: e.target.value === 'all' ? null : e.target.value, page: '1' })}
            className="rounded-[2px] border border-black/15 bg-white px-2 py-1.5 text-xs text-[#041a24] focus:border-[#041a24] focus:outline-none cursor-pointer"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => updateUrl({ dept: e.target.value === 'all' ? null : e.target.value, page: '1' })}
            className="rounded-[2px] border border-black/15 bg-white px-2 py-1.5 text-xs text-[#041a24] focus:border-[#041a24] focus:outline-none cursor-pointer"
          >
            <option value="all">All departments</option>
            {lookups.departments.map((d) => (
              <option key={d.deptCode} value={d.deptCode}>
                {d.deptName}
              </option>
            ))}
          </select>

          {/* Sales Rep Filter */}
          <select
            value={repFilter}
            onChange={(e) => updateUrl({ rep: e.target.value === '0' ? null : e.target.value, page: '1' })}
            className="rounded-[2px] border border-black/15 bg-white px-2 py-1.5 text-xs text-[#041a24] focus:border-[#041a24] focus:outline-none max-w-[150px] cursor-pointer"
          >
            <option value="0">All sales reps</option>
            {lookups.employees.map((e) => (
              <option key={e.empNo} value={e.empNo}>
                {e.fullName}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-[#41555f] hover:text-[#041a24] underline whitespace-nowrap ml-1 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* 7.3 Results Summary Line */}
      <div className="flex items-center justify-between text-xs text-[#52615B] pt-1">
        <div>
          {activeView === 'sales' ? (
            <div>
              <span className="font-semibold text-[#17231F] font-mono tabular-nums">
                {filteredSales.length}
              </span>{' '}
              transactions recorded
            </div>
          ) : (
            <div>
              <span className="font-semibold text-[#17231F] font-mono tabular-nums">
                {filteredLines.length}
              </span>{' '}
              sales detail records
            </div>
          )}
        </div>
      </div>

      {/* Unknown code warning */}
      {hasUnknownCode && (
        <div className="rounded-[4px] border border-[rgba(134,37,37,0.3)] bg-[#FCECEC] p-3 text-xs text-[#862525] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>That sale was not found ({selectedCode}).</span>
          </div>
          <button
            type="button"
            onClick={() => updateUrl({ code: null })}
            className="underline font-semibold hover:text-black"
          >
            Show all sales
          </button>
        </div>
      )}

      {/* Main Content Layout: Table & Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start font-sans">
        {/* Table Column */}
        <div
          className={`${
            selectedSaleDetail && isDesktop ? 'xl:col-span-7 2xl:col-span-8' : 'xl:col-span-12'
          }`}
        >
          <div className="rounded-[4px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 overflow-hidden shadow-2xs">
            {activeView === 'sales' ? (
              // 7.4 SALES VIEW
              paginatedSales.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#41555f] dark:text-text-muted space-y-2 font-mono">
                  <p className="font-semibold text-[#041a24] dark:text-text">No sales match your filters.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="rounded-[2px] border-black/15 text-xs"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-border bg-[#F4F4F0]/70 dark:bg-surface-2/70 text-[#41555f] dark:text-text-muted font-mono text-[10px] uppercase tracking-wider">
                        <th
                          onClick={() => handleSort('transNo')}
                          className="py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Transaction Number</span>
                            {sortCol === 'transNo' ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-black/30 dark:text-text-faint" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('salesDate')}
                          className="py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Sales Date</span>
                            {sortCol === 'salesDate' ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-black/30 dark:text-text-faint" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('custName')}
                          className="py-2.5 px-3 font-semibold cursor-pointer select-none min-w-[200px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Customer</span>
                            {sortCol === 'custName' ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-black/30 dark:text-text-faint" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('repName')}
                          className="py-2.5 px-3 font-semibold cursor-pointer select-none min-w-[180px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Employee Representative</span>
                            {sortCol === 'repName' ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-black/30 dark:text-text-faint" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="group/tbody divide-y divide-black/5 dark:divide-border">
                      {paginatedSales.map((s) => {
                        const isSelected = selectedCode === String(s.transNo);

                        return (
                          <tr
                            key={s.transNo}
                            onClick={() => updateUrl({ code: String(s.transNo) })}
                            className={`group/row cursor-pointer transition-[opacity,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isSelected
                                ? 'bg-black/5 dark:bg-surface-2 !opacity-100 font-medium'
                                : 'group-hover/tbody:opacity-[0.62] hover:!opacity-100 hover:bg-[#F3F2EE] dark:hover:bg-surface-2'
                            }`}
                          >
                            <td className="relative py-2.5 px-3 font-mono font-semibold text-[#041a24] dark:text-text whitespace-nowrap overflow-hidden">
                              <div
                                className={`absolute inset-y-0 left-0 w-[3px] bg-[#0F172A] dark:bg-white origin-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
                                  isSelected ? 'scale-y-100' : 'scale-y-0 group-hover/row:scale-y-100'
                                }`}
                              />
                              <span className="inline-block transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1.5">
                                {s.transNo}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-[#41555f] dark:text-text-muted font-mono text-xs tabular-nums">
                              {formatDate(s.salesDate)}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-[#041a24] dark:text-text leading-snug transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1">
                                {s.custName}
                              </div>
                              <div className="text-[10px] font-mono text-[#41555f] dark:text-text-muted mt-0.5">
                                Customer {s.custNo}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-[#041a24] dark:text-text">
                                <span className="font-mono text-[#41555f] dark:text-text-muted mr-1.5 font-normal">#{s.empNo}</span>
                                {s.repName}
                              </div>
                              <div className="text-[11px] text-[#52615B] dark:text-text-muted mt-0.5">
                                {s.deptName}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // 7.4 SALES DETAIL VIEW
              paginatedLines.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#52615B] space-y-2">
                  <p className="font-semibold text-[#17231F]">No sales detail records match your filters.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#DDE3DE] bg-[#FAFBFA] text-[#52615B]">
                        <th
                          onClick={() => handleSort('transNo')}
                          className="py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Transaction Number</span>
                            {sortCol === 'transNo' ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('prodCode')}
                          className="py-2.5 px-3 font-semibold cursor-pointer select-none min-w-[220px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Product Code</span>
                            {sortCol === 'prodCode' ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('quantity')}
                          className="py-2.5 px-3 font-semibold cursor-pointer select-none text-right whitespace-nowrap"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Quantity</span>
                            {sortCol === 'quantity' ? (
                              sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="group/tbody divide-y divide-[#E9EDEA] dark:divide-border">
                      {paginatedLines.map((l, idx) => {
                        const isSelected = selectedCode === String(l.transNo);

                        return (
                          <tr
                            key={`${l.transNo}-${l.prodCode}-${idx}`}
                            onClick={() => updateUrl({ code: String(l.transNo) })}
                            className={`group/row cursor-pointer transition-[opacity,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isSelected
                                ? 'bg-black/5 dark:bg-surface-2 !opacity-100 font-medium'
                                : 'group-hover/tbody:opacity-[0.62] hover:!opacity-100 hover:bg-[#F3F2EE] dark:hover:bg-surface-2'
                            }`}
                          >
                            <td className="relative py-2.5 px-3 font-mono font-medium text-[#17231F] dark:text-text whitespace-nowrap overflow-hidden">
                              <div
                                className={`absolute inset-y-0 left-0 w-[3px] bg-[#0F172A] dark:bg-white origin-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
                                  isSelected ? 'scale-y-100' : 'scale-y-0 group-hover/row:scale-y-100'
                                }`}
                              />
                              <span className="inline-block transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1.5">
                                {l.transNo}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-mono font-medium text-[#17231F] dark:text-text transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1">
                                {l.prodCode}
                              </div>
                              <div className="text-[11px] text-[#52615B] dark:text-text-muted mt-0.5 line-clamp-1">
                                {l.description}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-[#17231F] dark:text-text whitespace-nowrap">
                              {l.quantity}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3.5 py-2.5 border-t border-[#DDE3DE] dark:border-border bg-[#FAFBFA] dark:bg-surface-2 gap-2">
                <span className="text-[11px] text-[#52615B] dark:text-slate-300">
                  Showing {startIdx + 1}-{endIdx} of {totalCount}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#52615B] dark:text-slate-400">Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => updateUrl({ size: e.target.value, page: '1' })}
                      className="rounded-[2px] border border-[#CCD5CD] dark:border-border bg-white dark:bg-surface-1 px-1.5 py-0.5 text-[11px] text-[#17231F] dark:text-white focus:outline-none"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  <span className="text-[11px] text-[#52615B] dark:text-slate-400">
                    {safePage} / {totalPages}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUrl({ page: String(safePage - 1) })}
                      disabled={safePage <= 1}
                      className="h-7 w-7 p-0 flex items-center justify-center rounded-[2px] dark:border-border dark:text-white"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUrl({ page: String(safePage + 1) })}
                      disabled={safePage >= totalPages}
                      className="h-7 w-7 p-0 flex items-center justify-center rounded-[2px] dark:border-border dark:text-white"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel Column (Desktop >= 1280px) */}
        {selectedSaleDetail && isDesktop && (
          <div className="xl:col-span-5 2xl:col-span-4">
            <SaleDetailPanel
              saleData={selectedSaleDetail}
              onClose={() => updateUrl({ code: null })}
              userRole={userRole}
              isDrawer={false}
            />
          </div>
        )}
      </div>

      {/* Detail Panel Drawer (Mobile / Tablet < 1280px) */}
      {selectedSaleDetail && !isDesktop && (
        <SaleDetailPanel
          saleData={selectedSaleDetail}
          onClose={() => updateUrl({ code: null })}
          userRole={userRole}
          isDrawer={true}
        />
      )}

      </div>

        {/* Right-Side Portrait KPI Monitoring Panel */}
        <aside className="w-full xl:w-[276px] shrink-0">
          <RightSideKpiPanel
            title="SALES METRICS"
            cards={[
              {
                id: 'sales',
                title: 'SALES',
                value: metrics.totalSales,
                subtext: `Across ${metrics.totalCustomersCount} customers`,
                icon: ShoppingBag,
              },
              {
                id: 'items-sold',
                title: 'ITEMS SOLD',
                value: metrics.totalItemsSold.toLocaleString(),
                unit: 'pc',
                subtext: `Across ${metrics.totalDistinctProducts} products`,
                icon: Layers,
              },
              {
                id: 'sales-revenue',
                title: 'SALES REVENUE',
                value: formatPHP(metrics.totalRevenue),
                subtext: 'Sum of calculated line amounts',
                icon: DollarSign,
              },
              {
                id: 'sales-reps',
                title: 'SALES REPS',
                value: metrics.activeRepsCount,
                subtext: `In ${metrics.sellingDepartmentsCount} selling departments`,
                icon: Users,
              },
            ]}
          />
        </aside>
      </div>

      {/* New Sale Modal (Admin & Sales) */}
      {isSales && (
        <NewSaleModal
          isOpen={isNewSaleOpen}
          onClose={() => setIsNewSaleOpen(false)}
          lookups={lookups}
        />
      )}
    </div>
  );
}
