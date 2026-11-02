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
  // Module configuration with clean Black / White / Emerald Theme
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
      subtitle: 'Manage product catalog, pricing and historical price adjustments.',
      Icon: Package,
      badgeText: `${counts.PRODUCT ?? 57} products`,
      badgeIcon: Package,
      stats: [
        {
          label: 'PRODUCT',
          value: counts.PRODUCT ?? 57,
          icon: Package,
        },
        {
          label: 'PRICEHIST',
          value: counts.PRICEHIST ?? 79,
          icon: Tag,
        },
        {
          label: 'PRICE RECORDS',
          value: counts.PRICEHIST ?? 79,
          icon: TrendingUp,
        },
      ],
    },
    customers: {
      subtitle: 'Manage customer records and payment transactions.',
      Icon: UserCheck,
      badgeText: `${counts.CUSTOMER ?? 82} customers`,
      badgeIcon: Users,
      stats: [
        {
          label: 'CUSTOMER',
          value: counts.CUSTOMER ?? 82,
          icon: User,
        },
        {
          label: 'PAYMENT',
          value: counts.PAYMENT ?? 165,
          icon: CreditCard,
        },
        {
          label: 'PAYMENT RECORDS',
          value: counts.PAYMENT ?? 165,
          icon: Receipt,
        },
      ],
    },
    sales: {
      subtitle: 'Track sales transactions, items, and computed totals.',
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
    <div className="space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] flex items-center justify-center text-[#166B52] shrink-0 border border-emerald-100 shadow-2xs">
          <Boxes className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-gray-900">
            Explore System Modules
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Explore the four core business modules and their interconnected database tables.
          </p>
        </div>
      </div>

      {/* Grid: 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {ERD_MODULES.map((mod) => {
          const config = moduleConfigs[mod.id] || moduleConfigs.sales;
          const canAccess = mod.roles.includes(userRole);
          const Icon = config.Icon;
          const BadgeIcon = config.badgeIcon;

          return (
            <div
              key={mod.id}
              className="relative bg-white rounded-xl border border-gray-200 border-l-[4px] border-l-[#166B52] p-5 sm:p-5.5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
            >
              <div className="space-y-4">
                {/* 1. Header: Module Icon + Title & Subtitle + Top Right Badge (Monochrome & Emerald Theme) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#E8F3EE] text-[#166B52]">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-[17px] font-bold text-gray-900 tracking-tight">
                        {mod.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Top Right Pill Badge */}
                  <div className="shrink-0">
                    {!canAccess ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-semibold uppercase tracking-wider">
                        <Lock className="w-3 h-3 stroke-[2]" />
                        <span>Admin only</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-100 bg-[#E8F3EE] text-[#166B52] text-xs font-medium">
                        <BadgeIcon className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{config.badgeText}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Middle: 3 Stat Cards (Clean Black & White / Neutral Style) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {config.stats.map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div
                        key={idx}
                        className="bg-[#F8FAFC] rounded-lg p-2 sm:py-2.5 sm:px-3 border border-gray-100 flex items-center gap-2 min-w-0"
                      >
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-gray-100 text-gray-700">
                          <StatIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 truncate">
                            {stat.label}
                          </span>
                          <span className="block text-xs sm:text-sm font-bold text-gray-900 tabular-nums">
                            {stat.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Bottom: Straightforward Records & Details on left, Solid Emerald Button on right */}
              <div className="pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <Database className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-700 shrink-0">Records &amp; Details:</span>
                  <span className="font-medium text-gray-900 truncate">{mod.detail}</span>
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  {canAccess ? (
                    <Link
                      href={mod.href}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#166B52] hover:bg-[#11523E] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      <span>Open {mod.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed w-full sm:w-auto"
                    >
                      <span>Open {mod.name}</span>
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
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
