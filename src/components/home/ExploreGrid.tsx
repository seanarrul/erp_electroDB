'use client';

import React from 'react';
import Link from 'next/link';
import {
  Boxes,
  Users,
  Package,
  User,
  BarChart3,
  Building2,
  Briefcase,
  Clock,
  TrendingUp,
  CreditCard,
  Receipt,
  FileText,
  Layers,
  ShoppingCart,
  Database,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { ERD_MODULES } from '@/lib/erd';
import type { UserRole } from '@/lib/types';

interface ExploreGridProps {
  counts: Record<string, number>;
  userRole?: UserRole;
}

export function ExploreGrid({ counts, userRole = 'admin' }: ExploreGridProps) {
  // Module configuration matching Editorial Monochrome Reference
  const moduleConfigs: Record<
    string,
    {
      subtitle: string;
      Icon: React.ElementType;
      badgeText: string;
      stats: {
        label: string;
        value: string | number;
        icon: React.ElementType;
      }[];
    }
  > = {
    employees: {
      subtitle: 'Manage employee records, job history and department assignments.',
      Icon: Users,
      badgeText: `${counts.EMPLOYEE ?? 32} employees`,
      stats: [
        {
          label: 'DEPARTMENT',
          value: counts.DEPARTMENT ?? 5,
          icon: Building2,
        },
        {
          label: 'JOB',
          value: counts.JOB ?? 5,
          icon: Briefcase,
        },
        {
          label: 'JOBHISTORY',
          value: counts.JOBHISTORY ?? 34,
          icon: Clock,
        },
      ],
    },
    products: {
      subtitle: 'Monitor stock levels, product descriptions, and historical price adjustments.',
      Icon: Package,
      badgeText: `${counts.PRODUCT ?? 57} products`,
      stats: [
        {
          label: 'PRODUCT',
          value: counts.PRODUCT ?? 57,
          icon: Package,
        },
        {
          label: 'PRICEHIST',
          value: counts.PRICEHIST ?? 79,
          icon: TrendingUp,
        },
        {
          label: 'IN STOCK',
          value: counts.PRODUCT ?? 57,
          icon: Boxes,
        },
      ],
    },
    customers: {
      subtitle: 'Customer ledger, account receivables, and official payment receipts.',
      Icon: User,
      badgeText: `${counts.CUSTOMER ?? 82} accounts`,
      stats: [
        {
          label: 'CUSTOMER',
          value: counts.CUSTOMER ?? 82,
          icon: User,
        },
        {
          label: 'PAYMENTS',
          value: counts.PAYMENTS ?? 118,
          icon: CreditCard,
        },
        {
          label: 'RECEIPTS',
          value: counts.PAYMENTS ?? 118,
          icon: Receipt,
        },
      ],
    },
    sales: {
      subtitle: 'Track sales transactions, line items, and computed order totals.',
      Icon: BarChart3,
      badgeText: `${counts.SALES ?? 124} transactions`,
      stats: [
        {
          label: 'SALES',
          value: counts.SALES ?? 124,
          icon: FileText,
        },
        {
          label: 'SALESDETAIL',
          value: counts.SALESDETAIL ?? 313,
          icon: Layers,
        },
        {
          label: 'TOTAL ORDERS',
          value: counts.SALES ?? 124,
          icon: ShoppingCart,
        },
      ],
    },
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Section Header matching Reference Image ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h2 className="font-editorial italic font-normal text-3xl sm:text-4xl text-text tracking-tight leading-tight">
            Explore System Modules
          </h2>
          <p className="text-sm text-text-muted font-sans mt-1">
            Interconnected business domains and 3NF database partitions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-muted font-sans shrink-0 self-start sm:self-end">
          <Users className="w-4 h-4 text-text-faint" />
          <span>4 Core Business Domains</span>
        </div>
      </div>

      {/* ── 2x2 Grid of System Module Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {ERD_MODULES.map((mod) => {
          const config = moduleConfigs[mod.id] || moduleConfigs.sales;
          const canAccess = mod.roles.includes(userRole);
          const Icon = config.Icon;

          return (
            <div
              key={mod.id}
              className="group relative bg-surface-1 rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 ease-out p-6 sm:p-7 flex flex-col justify-between gap-5 overflow-hidden"
            >
              {/* Distinct solid vertical accent bar on left edge */}
              <div className="absolute left-0 inset-y-0 w-1.5 bg-primary-bg rounded-l-2xl pointer-events-none" />

              <div className="space-y-5">
                {/* 1. Header: Circular Icon Badge + Title & Subtitle + Solid Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0 text-text shadow-2xs">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-editorial font-normal text-xl sm:text-[22px] text-text tracking-tight leading-snug">
                        {mod.name}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-text-muted font-sans mt-1 leading-relaxed">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Top Right Solid Pill */}
                  <div className="shrink-0">
                    {!canAccess ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 text-text-muted border border-border text-xs font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Admin only</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-primary-bg text-primary-fg text-xs font-semibold shadow-2xs tracking-wide">
                        {config.badgeText}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Middle: 3-Column Metric Row */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {config.stats.map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div
                        key={idx}
                        className="bg-surface-2/90 rounded-xl p-3 sm:py-3.5 sm:px-3.5 border border-border flex flex-col justify-between min-w-0"
                      >
                        <div className="flex items-center gap-1.5 text-text-faint mb-1.5 min-w-0">
                          <StatIcon className="w-3.5 h-3.5 text-text-faint shrink-0 stroke-[2]" />
                          <span className="font-mono text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-text-muted truncate">
                            {stat.label}
                          </span>
                        </div>
                        <span className="font-sans text-lg sm:text-xl font-bold text-text tabular-nums leading-none">
                          {stat.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Bottom: Records Summary on left, Action Button on right */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-text-muted font-sans min-w-0 truncate">
                  <Database className="w-4 h-4 text-text-faint shrink-0" />
                  <span className="truncate">
                    Records: <strong className="font-semibold text-text">{mod.detail}</strong>
                  </span>
                </div>

                {/* Compact 36px interactive action button */}
                <div className="shrink-0 self-end sm:self-auto">
                  {canAccess ? (
                    <Link
                      href={mod.href}
                      className="group/btn inline-flex items-center gap-2 h-9 px-4 rounded-full bg-primary-bg hover:opacity-90 text-primary-fg text-xs sm:text-[13px] font-medium shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <span>Open {mod.name}</span>
                      <span className="w-5 h-5 rounded-full bg-primary-fg text-primary-bg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1 shadow-2xs">
                        <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-surface-2 text-text-faint text-xs sm:text-[13px] font-medium border border-border cursor-not-allowed"
                    >
                      <span>Open {mod.name}</span>
                      <span className="w-5 h-5 rounded-full bg-surface-3 text-text-faint flex items-center justify-center shrink-0">
                        <Lock className="w-3 h-3" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
