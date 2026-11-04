'use client';

import React, { useState, useMemo, useEffect, useTransition, useDeferredValue, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ProductDetailPanel } from './ProductDetailPanel';

const AddProductModal = dynamic(
  () => import('./AddProductModal').then((mod) => mod.AddProductModal),
  { ssr: false }
);
import { RightSideKpiPanel } from '@/components/ui/RightSideKpiPanel';
import { formatPHP, formatDate } from '@/lib/utils';
import {
  splitDescription,
  getFamilyLabel,
  getProductFamily,
  formatPriceChange,
  FAMILY_LABELS,
} from '@/lib/products';
import type {
  ProductOverviewItem,
  PriceHistoryItem,
  ProductsSummaryMetrics,
  ProductDetailItem,
} from '@/lib/data/products';
import {
  Search,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShoppingBag,
  DollarSign,
  Package,
  History,
  X,
  AlertCircle,
} from 'lucide-react';

const CANONICAL_FAMILY_PREFIXES = [
  'ALL',
  'CPU',
  'GPU',
  'MB',
  'RAM',
  'SSD',
  'PSU',
  'CASE',
  'MON',
  'KB',
  'MS',
];

interface ProductsMainViewProps {
  initialProducts: ProductOverviewItem[];
  initialPriceHistory: PriceHistoryItem[];
  metrics: ProductsSummaryMetrics;
  userRole?: string;
}

export function ProductsMainView({
  initialProducts,
  initialPriceHistory,
  metrics,
  userRole = 'sales',
}: ProductsMainViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isAdmin = userRole.toLowerCase() === 'admin';

  // Read URL State with defaults
  const activeView = (searchParams.get('view') === 'history' ? 'history' : 'products') as
    | 'products'
    | 'history';
  const selectedFamily = searchParams.get('family') || 'ALL';
  const selectedCode = searchParams.get('code') || null;
  const searchQuery = searchParams.get('q') || '';
  const soldFilter = (searchParams.get('sold') || 'all') as 'all' | 'sold' | 'none';
  const sortCol = searchParams.get('sort') || (activeView === 'history' ? 'effDate' : 'prodCode');
  const sortOrder = (searchParams.get('order') || (activeView === 'history' ? 'desc' : 'asc')) as
    | 'asc'
    | 'desc';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = [10, 25, 50].includes(parseInt(searchParams.get('size') || '10', 10))
    ? parseInt(searchParams.get('size') || '10', 10)
    : 10;

  // Window width for drawer vs split column
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1280);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

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

  // Update URL helper (uses router.replace to avoid history pollution and full reload costs)
  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    startTransition(() => {
      router.replace(`/products?${params.toString()}`, { scroll: false });
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
    updateUrl({ family: null, q: null, sold: null, page: '1' });
  };

  // Distinct families in catalog
  const catalogFamilies = useMemo(() => {
    const list = [...CANONICAL_FAMILY_PREFIXES];
    Object.keys(metrics.familyCounts).forEach((f) => {
      if (!list.includes(f)) list.push(f);
    });
    return list;
  }, [metrics.familyCounts]);

  // 1. Filtered Products View list (uses deferredSearch for non-blocking rendering)
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Family filter
      if (selectedFamily !== 'ALL' && p.family.toUpperCase() !== selectedFamily.toUpperCase()) {
        return false;
      }
      // Sales activity filter
      if (soldFilter === 'sold' && p.unitsSold <= 0) return false;
      if (soldFilter === 'none' && p.unitsSold > 0) return false;

      // Search query (code or description)
      if (deferredSearch.trim()) {
        const q = deferredSearch.trim().toLowerCase();
        const codeMatch = p.prodCode.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        if (!codeMatch && !descMatch) return false;
      }

      return true;
    });
  }, [initialProducts, selectedFamily, soldFilter, deferredSearch]);

  // 2. Filtered Price History View list
  const filteredPriceHistory = useMemo(() => {
    return initialPriceHistory.filter((h) => {
      // Family filter
      const pFamily = h.prodCode.split('-')[0]?.toUpperCase();
      if (selectedFamily !== 'ALL' && pFamily !== selectedFamily.toUpperCase()) {
        return false;
      }

      // Sales activity filter (filter by matching product)
      if (soldFilter !== 'all') {
        const prod = initialProducts.find((p) => p.prodCode === h.prodCode);
        if (soldFilter === 'sold' && (!prod || prod.unitsSold <= 0)) return false;
        if (soldFilter === 'none' && prod && prod.unitsSold > 0) return false;
      }

      // Search query
      if (deferredSearch.trim()) {
        const q = deferredSearch.trim().toLowerCase();
        const codeMatch = h.prodCode.toLowerCase().includes(q);
        const descMatch = h.description.toLowerCase().includes(q);
        if (!codeMatch && !descMatch) return false;
      }

      return true;
    });
  }, [initialPriceHistory, initialProducts, selectedFamily, soldFilter, deferredSearch]);

  // 3. Sorting logic
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
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
  }, [filteredProducts, sortCol, sortOrder]);

  const sortedPriceHistory = useMemo(() => {
    return [...filteredPriceHistory].sort((a, b) => {
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
  }, [filteredPriceHistory, sortCol, sortOrder]);

  // 4. Pagination
  const totalCount = activeView === 'products' ? sortedProducts.length : sortedPriceHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);

  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(startIdx, endIdx);
  }, [sortedProducts, startIdx, endIdx]);

  const paginatedPriceHistory = useMemo(() => {
    return sortedPriceHistory.slice(startIdx, endIdx);
  }, [sortedPriceHistory, startIdx, endIdx]);

  // 5. Selected Product Detail Object
  const selectedProductDetail: ProductDetailItem | null = useMemo(() => {
    if (!selectedCode) return null;
    const prod = initialProducts.find(
      (p) => p.prodCode.toUpperCase() === selectedCode.toUpperCase()
    );
    if (!prod) return null;

    // Filter all price history rows for this product
    const historyRows = initialPriceHistory
      .filter((h) => h.prodCode.toUpperCase() === prod.prodCode.toUpperCase())
      .sort((a, b) => b.effDate.localeCompare(a.effDate));

    const latestEffDate = historyRows.length > 0 ? historyRows[0].effDate : null;

    return {
      ...prod,
      hasSales: prod.unitsSold > 0,
      priceHistory: historyRows.map((r, idx) => ({
        ...r,
        canCorrectPrice: idx === 0 && prod.unitsSold === 0,
      })),
    };
  }, [selectedCode, initialProducts, initialPriceHistory]);

  const hasUnknownCode = Boolean(selectedCode && !selectedProductDetail);

  // Sorting Handler
  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      updateUrl({ order: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateUrl({ sort: colKey, order: 'asc', page: '1' });
    }
  };

  // CSV Export Handler (Section 16)
  const handleExportCSV = () => {
    const today = new Date().toISOString().split('T')[0];

    if (activeView === 'products') {
      const headers = [
        'Product Code',
        'Description',
        'Unit',
        'Unit price',
      ];
      const rows = filteredProducts.map((p) => [
        p.prodCode,
        `"${p.description.replace(/"/g, '""')}"`,
        p.unit,
        p.currentUnitPrice != null ? p.currentUnitPrice.toFixed(2) : '',
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `products-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        'Effective date',
        'Product Code',
        'Description',
        'Unit price',
        'Status',
      ];
      const rows = filteredPriceHistory.map((h) => [
        h.effDate,
        h.prodCode,
        `"${h.description.replace(/"/g, '""')}"`,
        h.unitPrice.toFixed(2),
        h.status,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `price-history-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* 9.1 Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-black/10 dark:border-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#41555f] dark:text-slate-400 block">
            ElectronDB G4 HopeERD &bull; Products
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-[#041a24] dark:text-white mt-0.5">
            Products &amp; Pricing
          </h1>
          <p className="text-xs text-[#41555f] dark:text-slate-300 mt-0.5 font-sans">
            PC hardware catalog, unit prices, and historical price adjustments.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="bg-white dark:bg-surface-2 border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-surface-3 text-[#0F172A] dark:text-white rounded-[2px] px-3 py-1.5 text-xs font-medium shadow-2xs transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] active:scale-[0.985] cursor-pointer inline-flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-black/60 dark:text-white" />
            <span>Export CSV</span>
          </Button>

          {isAdmin && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddProductOpen(true)}
              className="bg-[#0F172A] dark:bg-white hover:bg-[#1E293B] dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-[2px] px-3.5 py-1.5 text-xs font-medium shadow-2xs transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] active:scale-[0.985] cursor-pointer inline-flex items-center gap-1.5 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2-Column Desktop Layout: Main Content (Left) + Right-Side Portrait KPI Panel (Right) */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Filter and View Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-1">
        {/* Left: View Tabs */}
        <div className="inline-flex p-1 bg-[#F4F4F0] dark:bg-surface-2 rounded-[2px] border border-black/10 dark:border-white/15 gap-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => updateUrl({ view: 'products', page: '1' })}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] transition-all cursor-pointer font-medium ${
              activeView === 'products'
                ? 'bg-[#041a24] dark:bg-white text-white dark:text-slate-900 shadow-2xs font-semibold'
                : 'text-[#41555f] dark:text-slate-300 hover:text-[#041a24] dark:hover:text-white'
            }`}
          >
            <span>Products</span>
            <span
              className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-[2px] ${
                activeView === 'products'
                  ? 'bg-white/20 dark:bg-slate-900/15 text-white dark:text-slate-900 font-semibold'
                  : 'bg-black/5 dark:bg-surface-1 text-[#41555f] dark:text-slate-300'
              }`}
            >
              {filteredProducts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => updateUrl({ view: 'history', page: '1' })}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] transition-all cursor-pointer font-medium ${
              activeView === 'history'
                ? 'bg-[#041a24] dark:bg-white text-white dark:text-slate-900 shadow-2xs font-semibold'
                : 'text-[#41555f] dark:text-slate-300 hover:text-[#041a24] dark:hover:text-white'
            }`}
          >
            <span>Price history</span>
            <span
              className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-[2px] ${
                activeView === 'history'
                  ? 'bg-white/20 dark:bg-slate-900/15 text-white dark:text-slate-900 font-semibold'
                  : 'bg-black/5 dark:bg-surface-1 text-[#41555f] dark:text-slate-300'
              }`}
            >
              {filteredPriceHistory.length}
            </span>
          </button>
        </div>

        {/* Right: Search & Sales Activity Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-black/40 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search code or description..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-[2px] border border-black/15 dark:border-white/20 bg-white dark:bg-surface-1 pl-8 pr-7 py-1.5 text-xs text-[#041a24] dark:text-white placeholder:text-[#41555f]/60 dark:placeholder:text-slate-400 focus:border-[#041a24] dark:focus:border-white focus:ring-1 focus:ring-[#041a24]/15 focus:outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search query"
                className="absolute right-2 top-2 text-black/40 dark:text-slate-400 hover:text-[#041a24] dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sales Activity Select */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#41555f] dark:text-slate-300 whitespace-nowrap">Sales:</span>
            <select
              value={soldFilter}
              onChange={(e) => updateUrl({ sold: e.target.value === 'all' ? null : e.target.value, page: '1' })}
              className="rounded-[2px] border border-black/15 dark:border-white/20 bg-white dark:bg-surface-1 px-2 py-1.5 text-xs text-[#041a24] dark:text-white focus:border-[#041a24] dark:focus:border-white focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="sold">Has sales</option>
              <option value="none">No sales yet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unknown code warning */}
      {hasUnknownCode && (
        <div className="rounded-[4px] border border-[rgba(134,37,37,0.3)] bg-[#FCECEC] dark:bg-danger-soft p-3 text-xs text-[#862525] dark:text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>That product was not found ({selectedCode}).</span>
          </div>
          <button
            type="button"
            onClick={() => updateUrl({ code: null })}
            className="underline font-semibold hover:text-black dark:hover:text-text"
          >
            Show all products
          </button>
        </div>
      )}

      {/* Main Content Layout: Table & Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table Column */}
        <div
          className={`${
            selectedProductDetail && isDesktop ? 'xl:col-span-7 2xl:col-span-8' : 'xl:col-span-12'
          }`}
        >
          {/* Card Container for Table */}
          <div className="rounded-[4px] border border-black/10 dark:border-border bg-white dark:bg-surface-1 overflow-hidden shadow-2xs font-sans">
            {activeView === 'products' ? (
              // PRODUCTS VIEW (Section 9.4)
              paginatedProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#41555f] dark:text-slate-300 space-y-2 font-mono">
                  <p className="font-semibold text-[#041a24] dark:text-white">No products match your filters.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="rounded-[2px] border-black/15 dark:border-white/20 text-xs dark:text-white"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-border bg-[#F4F4F0]/70 dark:bg-surface-2 text-[#41555f] dark:text-white font-mono text-[10px] uppercase tracking-wider">
                        <th
                          onClick={() => handleSort('prodCode')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Product Code</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'prodCode' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('description')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none min-w-[200px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Description</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'description' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('unit')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Unit</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'unit' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('currentUnitPrice')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Unit price</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'currentUnitPrice' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="group/tbody divide-y divide-black/5 dark:divide-border">
                      {paginatedProducts.map((p) => {
                        const { title, detail } = splitDescription(p.description);
                        const family = getProductFamily(p.prodCode);
                        const familyName = getFamilyLabel(family);
                        const isSelected = selectedCode?.toUpperCase() === p.prodCode.toUpperCase();

                        return (
                          <tr
                            key={p.prodCode}
                            onClick={() => updateUrl({ code: p.prodCode })}
                            className={`group/row cursor-pointer transition-[opacity,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isSelected
                                ? 'bg-black/5 dark:bg-surface-2 !opacity-100 font-medium'
                                : 'group-hover/tbody:opacity-[0.62] hover:!opacity-100 hover:bg-[#F3F2EE] dark:hover:bg-surface-2'
                            }`}
                          >
                            <td className="relative py-2.5 px-3 whitespace-nowrap overflow-hidden">
                              <div
                                className={`absolute inset-y-0 left-0 w-[3px] bg-[#0F172A] dark:bg-white origin-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
                                  isSelected ? 'scale-y-100' : 'scale-y-0 group-hover/row:scale-y-100'
                                }`}
                              />
                              <span className="inline-block font-mono font-semibold text-[#0F172A] dark:text-white transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1.5">
                                {p.prodCode}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-[#0F172A] dark:text-white leading-tight transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1">
                                {title}
                              </div>
                              {detail && (
                                <div className="text-[11px] text-[#41555f] dark:text-slate-300 leading-snug line-clamp-1 mt-0.5">
                                  {detail}
                                </div>
                              )}
                              <span className="inline-block font-mono text-[9px] uppercase tracking-wider text-[#41555f] dark:text-slate-400 mt-0.5">
                                {family} &bull; {familyName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-xs text-[#41555f] dark:text-slate-200 border border-transparent bg-transparent transition-[transform,background-color,border-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:-translate-y-0.5 group-hover/row:bg-white dark:group-hover/row:bg-surface-3 group-hover/row:border-[#CBD5E1] dark:group-hover/row:border-white/30 group-hover/row:shadow-2xs">
                                {p.unit}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {p.currentUnitPrice !== null ? (
                                <div className="font-mono font-bold tabular-nums text-[#0F172A] dark:text-white inline-flex items-baseline gap-1 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:-translate-x-1">
                                  <span>{formatPHP(p.currentUnitPrice)}</span>
                                  <span className="font-normal font-sans text-[11px] text-slate-400 dark:text-slate-400 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:text-slate-700 dark:group-hover/row:text-white">
                                    {' '}
                                    / {p.unit}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] font-mono text-[9px] bg-black/5 dark:bg-surface-2 text-[#41555f] dark:text-slate-300 border border-black/10 dark:border-border">
                                  No price record
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // PRICE HISTORY VIEW (Section 9.4)
              paginatedPriceHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#52615B] dark:text-slate-300 space-y-2">
                  <p className="font-semibold text-[#17231F] dark:text-white">No price records match your filters.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="rounded-[2px] border-black/15 dark:border-white/20 text-xs dark:text-white"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-border bg-[#F4F4F0]/70 dark:bg-surface-2 text-[#41555f] dark:text-white font-mono text-[10px] uppercase tracking-wider">
                        <th
                          onClick={() => handleSort('effDate')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Effective date</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'effDate' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('prodCode')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Product Code</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'prodCode' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('description')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none min-w-[200px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Description</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'description' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('unitPrice')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Unit price</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'unitPrice' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('status')}
                          className="group/th py-2.5 px-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>Status</span>
                            <span className="inline-flex transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/th:opacity-100 group-hover/th:-translate-y-0.5">
                              {sortCol === 'status' ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" /> : <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-slate-400" />
                              )}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="group/tbody divide-y divide-black/5 dark:divide-border">
                      {paginatedPriceHistory.map((h, i) => {
                        const { title, detail } = splitDescription(h.description);
                        const hFamily = getProductFamily(h.prodCode);
                        const hFamilyName = getFamilyLabel(hFamily);
                        const isSelected = selectedCode?.toUpperCase() === h.prodCode.toUpperCase();

                        return (
                          <tr
                            key={`${h.prodCode}-${h.effDate}-${i}`}
                            onClick={() => updateUrl({ code: h.prodCode })}
                            className={`group/row cursor-pointer transition-[opacity,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isSelected
                                ? 'bg-black/5 dark:bg-surface-2 !opacity-100 font-medium'
                                : 'group-hover/tbody:opacity-[0.62] hover:!opacity-100 hover:bg-[#F3F2EE] dark:hover:bg-surface-2'
                            }`}
                          >
                            <td className="relative py-2.5 px-3 whitespace-nowrap overflow-hidden">
                              <div
                                className={`absolute inset-y-0 left-0 w-[3px] bg-[#0F172A] dark:bg-white origin-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
                                  isSelected ? 'scale-y-100' : 'scale-y-0 group-hover/row:scale-y-100'
                                }`}
                              />
                              <span className="inline-block font-mono text-xs text-[#0F172A] dark:text-white transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1.5">
                                {formatDate(h.effDate)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-[#0F172A] dark:text-white whitespace-nowrap">
                              {h.prodCode}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-[#0F172A] dark:text-white leading-tight transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1">
                                {title}
                              </div>
                              {detail && (
                                <div className="text-[11px] text-[#41555f] dark:text-slate-300 line-clamp-1 mt-0.5">
                                  {detail}
                                </div>
                              )}
                              <span className="inline-block font-mono text-[9px] uppercase tracking-wider text-[#41555f] dark:text-slate-400 mt-0.5">
                                {hFamily} &bull; {hFamilyName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-mono font-bold tabular-nums text-[#0F172A] dark:text-white inline-flex items-baseline gap-1 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:-translate-x-1">
                                <span>{formatPHP(h.unitPrice)}</span>
                                <span className="font-normal font-sans text-[11px] text-slate-400 dark:text-slate-400 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:text-slate-700 dark:group-hover/row:text-white">
                                  {' '}
                                  / {h.unit}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="inline-flex transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:-translate-y-0.5">
                                {h.status === 'Current' && (
                                  <span className="inline-flex items-center gap-1 rounded-[2px] bg-[#0F172A] dark:bg-white px-1.5 py-0.5 text-[10px] font-mono text-white dark:text-slate-900 font-semibold">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Current
                                  </span>
                                )}
                                {h.status === 'Past' && (
                                  <span className="inline-flex items-center gap-1 rounded-[2px] bg-black/5 dark:bg-surface-2 border border-black/10 dark:border-border px-1.5 py-0.5 text-[10px] font-mono text-[#41555f] dark:text-slate-300">
                                    <Clock className="h-3 w-3" />
                                    Past
                                  </span>
                                )}
                                {h.status === 'Future-dated' && (
                                  <span className="inline-flex items-center gap-1 rounded-[2px] bg-[#FEF08A]/80 dark:bg-warning-soft border border-yellow-400/50 dark:border-warning px-1.5 py-0.5 text-[10px] font-mono text-[#713F12] dark:text-warning">
                                    <AlertTriangle className="h-3 w-3" />
                                    Future-dated
                                  </span>
                                )}
                              </span>
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
                <span className="text-[11px] text-[#52615B] dark:text-text-muted">
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
        {selectedProductDetail && isDesktop && (
          <div className="xl:col-span-5 2xl:col-span-4">
            <ProductDetailPanel
              product={selectedProductDetail}
              onClose={() => updateUrl({ code: null })}
              userRole={userRole}
              availableUnits={metrics.allUnits}
              isDrawer={false}
            />
          </div>
        )}
      </div>

      {/* Detail Panel Drawer (Mobile / Tablet < 1280px) */}
      {selectedProductDetail && !isDesktop && (
        <ProductDetailPanel
          product={selectedProductDetail}
          onClose={() => updateUrl({ code: null })}
          userRole={userRole}
          availableUnits={metrics.allUnits}
          isDrawer={true}
        />
      )}

      </div>

        {/* Right-Side Portrait KPI Monitoring Panel */}
        <aside className="w-full xl:w-[276px] shrink-0">
          <RightSideKpiPanel
            title="CATALOG METRICS"
            cards={[
              {
                id: 'products',
                title: 'PRODUCTS',
                value: metrics.totalProducts,
                subtext: `In ${metrics.totalFamilies} families`,
                icon: Package,
              },
              {
                id: 'price-records',
                title: 'PRICE RECORDS',
                value: metrics.totalPriceRecords,
                subtext: `${metrics.priceChangesRecorded} price changes recorded`,
                icon: History,
              },
              {
                id: 'units-sold',
                title: 'UNITS SOLD',
                value: metrics.totalUnitsSold.toLocaleString(),
                unit: 'pc',
                subtext: 'From sale lines',
                icon: Layers,
              },
              {
                id: 'sales-revenue',
                title: 'SALES REVENUE',
                value: formatPHP(metrics.totalSalesRevenue),
                subtext: 'At the price on each sale date',
                icon: DollarSign,
              },
            ]}
          />
        </aside>
      </div>

      {/* Add Product Modal (Admin only) */}
      {isAdmin && (
        <AddProductModal
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          availableUnits={metrics.allUnits}
          existingCodes={initialProducts.map((p) => p.prodCode)}
        />
      )}
    </div>
  );
}
