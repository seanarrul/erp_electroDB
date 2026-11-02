'use client';

import React from 'react';
import Link from 'next/link';
import {
  Boxes,
  Users,
  Package,
  UserCheck,
  BarChart3,
  Building2,
  Briefcase,
  FileText,
  Tag,
  TrendingUp,
  User,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Layers,
  ShoppingCart,
  Database,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { ERD_MODULES } from '@/lib/erd';
import type { UserRole } from '@/lib/types';

interface ExploreGridProps {
  counts: Record<string, number>;
  userRole?: UserRole;
}

export function ExploreGrid({ counts, userRole = 'admin' }: ExploreGridProps) {
  // Module configuration with JeptahzRepo Editorial Style
  const moduleConfigs: Record<
    string,
    {
      subtitle: string;
      Icon: React.ElementType;
      badgeText: string;
      badgeIcon: React.ElementType;
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
      badgeIcon: Users,
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
          icon: FileText,
        },
      ],
    },
    products: {
      subtitle: 'Monitor stock levels, product descriptions, and historical price adjustments.',
      Icon: Package,
      badgeText: `${counts.PRODUCT ?? 10} products`,
      badgeIcon: Tag,
      stats: [
        {
          label: 'PRODUCT',
          value: counts.PRODUCT ?? 10,
          icon: Package,
        },
        {
          label: 'PRICEHIST',
          value: counts.PRICEHIST ?? 16,
          icon: TrendingUp,
        },
        {
          label: 'IN STOCK',
          value: counts.PRODUCT ?? 10,
          icon: Boxes,
        },
      ],
    },
    customers: {
      subtitle: 'Customer ledger, account receivables, and official payment receipts.',
      Icon: UserCheck,
      badgeText: `${counts.CUSTOMER ?? 10} accounts`,
      badgeIcon: User,
      stats: [
        {
          label: 'CUSTOMER',
          value: counts.CUSTOMER ?? 10,
          icon: UserCheck,
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
      badgeIcon: TrendingUp,
      stats: [
        {
          label: 'SALES',
          value: counts.SALES ?? 124,
          icon: FileSpreadsheet,
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
    <div className="space-y-4 font-sans">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[2px] bg-[#041a24] flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Boxes className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#041a24] tracking-tight">
              Explore System Modules
            </h3>
            <p className="text-xs text-[#41555f]">
              Interconnected business domains and 3NF database partitions.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block font-mono text-[11px] text-[#41555f]">
          4 Core Business Domains
        </span>
      </div>

      {/* Grid: 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ERD_MODULES.map((mod) => {
          const config = moduleConfigs[mod.id] || moduleConfigs.sales;
          const canAccess = mod.roles.includes(userRole);
          const Icon = config.Icon;
          const BadgeIcon = config.badgeIcon;

          return (
            <div
              key={mod.id}
              className="relative bg-white rounded-[4px] border border-black/10 hover:border-[#041a24] p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
            >
              <div className="space-y-4">
                {/* 1. Header: Module Icon + Title & Subtitle + Top Right Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0 bg-[#F4F4F0] text-[#041a24] border border-black/10">
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-editorial text-base sm:text-lg font-normal text-[#041a24] tracking-tight">
                        {mod.name}
                      </h4>
                      <p className="text-xs text-[#41555f] mt-0.5 leading-snug">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Top Right Pill Badge */}
                  <div className="shrink-0">
                    {!canAccess ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-black/5 text-[#41555f] border border-black/10 font-mono text-[10px] font-semibold uppercase tracking-wider">
                        <Lock className="w-3 h-3 stroke-[2]" />
                        <span>Admin only</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#041a24] text-white font-mono text-[10px] font-medium tracking-wide">
                        <BadgeIcon className="w-3 h-3 stroke-[2]" />
                        <span>{config.badgeText}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Middle: 3 Stat Boxes (JeptahzRepo Parchment Style) */}
                <div className="grid grid-cols-3 gap-2">
                  {config.stats.map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div
                        key={idx}
                        className="bg-[#F4F4F0]/70 rounded-[2px] p-2 sm:py-2.5 sm:px-3 border border-black/10 flex items-center gap-2 min-w-0"
                      >
                        <div className="w-6 h-6 rounded-[2px] flex items-center justify-center shrink-0 bg-white text-[#041a24] border border-black/10">
                          <StatIcon className="w-3 h-3 stroke-[2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-[#41555f] truncate">
                            {stat.label}
                          </span>
                          <span className="block font-mono text-xs sm:text-sm font-bold text-[#041a24] tabular-nums">
                            {stat.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Bottom: Records & Details on left, Button on right */}
              <div className="pt-3 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <Database className="w-3.5 h-3.5 text-black/40 shrink-0" />
                  <span className="font-mono text-[10px] text-[#41555f] shrink-0">Records:</span>
                  <span className="font-mono text-[11px] text-[#041a24] font-medium truncate">{mod.detail}</span>
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  {canAccess ? (
                    <Link
                      href={mod.href}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#041a24] hover:bg-[#1c313b] text-white font-mono text-xs font-medium shadow-2xs transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      <span>Open {mod.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-black/5 text-black/40 font-mono text-xs cursor-not-allowed w-full sm:w-auto border border-black/10"
                    >
                      <span>Open {mod.name}</span>
                      <Lock className="w-3 h-3 text-black/30" />
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
