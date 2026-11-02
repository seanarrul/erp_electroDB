'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { navigationItems, type NavigationItem } from '@/lib/labels';
import { BRAND } from '@/lib/brand';
import type { UserRole } from '@/lib/types';
import { logoutAction } from '@/app/actions/auth';
import { HopeLogo } from '@/components/brand/HopeLogo';
import { useSidebar } from '@/components/layout/SidebarContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole?: UserRole;
  userName?: string;
}

export function Sidebar({ userRole = 'admin', userName = 'Admin' }: SidebarProps) {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

  const filteredNav = navigationItems.filter((item) => item.roles.includes(userRole));

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    sales: 'Sales Representative',
    cashier: 'Cashier / Billing',
  };

  const roleLabel = roleLabels[userRole] || 'Administrator';

  // Group items by clean canonical sections
  const sections: { key: string; label: string; items: NavigationItem[] }[] = [
    { key: 'OVERVIEW', label: 'OVERVIEW', items: [] },
    { key: 'TRANSACTIONS', label: 'TRANSACTIONS', items: [] },
    { key: 'CATALOG', label: 'CATALOG', items: [] },
    { key: 'ORGANIZATION', label: 'ORGANIZATION', items: [] },
  ];

  filteredNav.forEach((item) => {
    const sec = sections.find((s) => s.key === item.section);
    if (sec) sec.items.push(item);
  });

  const activeSections = sections.filter((s) => s.items.length > 0);

  // Common inner sidebar content with editorial broadsheet aesthetics
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-4.5 overflow-y-auto font-sans">
      <div className="space-y-4">
        {/* Brand Section */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="flex items-center gap-2.5 group select-none"
            aria-label="ElectronDB G4 HopeERD — Information Management Monitoring System"
          >
            <HopeLogo size={28} className="shrink-0 transition-transform group-hover:scale-105" />
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-[#041a24] leading-tight tracking-tight">
                {BRAND.name}
              </span>
              <span className="font-mono text-[10px] text-[#41555f] leading-tight mt-0.5 truncate">
                {BRAND.systemName}
              </span>
            </div>
          </Link>

          {/* Mobile drawer close button */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="lg:hidden p-1 text-black/50 hover:text-[#041a24] hover:bg-black/5 rounded-[2px] transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-3.5 pt-0.5" aria-label="Main Navigation">
          {activeSections.map((sec) => (
            <div key={sec.key} className="space-y-1">
              {/* Section Header */}
              <div className="px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#41555f]">
                {sec.label}
              </div>

              {/* Section Items */}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isDashboard = item.href === '/';
                  const isActive = isDashboard
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      aria-label={`${item.label} — ${item.subtitle}`}
                      title={`${item.label} — ${item.subtitle}`}
                      className={cn(
                        'group flex items-start gap-2.5 px-2.5 py-1.5 rounded-[2px] font-sans transition-all cursor-pointer outline-none select-none',
                        isActive
                          ? 'bg-[#041a24] text-white shadow-2xs'
                          : 'text-[#041a24] hover:bg-black/5 hover:text-[#041a24]'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 mt-0.5 transition-colors',
                          isActive
                            ? 'text-white stroke-[2]'
                            : 'text-black/40 group-hover:text-[#041a24] stroke-[1.8]'
                        )}
                      />
                      <div className="flex flex-col min-w-0 text-left">
                        <span
                          className={cn(
                            'text-[12px] leading-tight truncate tracking-tight',
                            isActive ? 'font-semibold text-white' : 'font-medium text-[#041a24]'
                          )}
                        >
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] leading-tight truncate mt-0.5',
                            isActive ? 'text-white/70 font-normal' : 'text-[#41555f]'
                          )}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Utility Area */}
      <div className="pt-3 border-t border-black/10 mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#041a24] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 ring-1 ring-black/10 select-none">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[12px] font-semibold text-[#041a24] leading-tight truncate">
              {userName}
            </span>
            <span className="font-mono text-[10px] text-[#41555f] leading-tight truncate mt-0.5">
              {roleLabel}
            </span>
          </div>
        </div>

        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            title="Sign Out"
            aria-label="Sign Out"
            className="p-1.5 text-black/50 hover:text-red-600 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-[240px] h-screen flex-col bg-white/95 backdrop-blur-xs border-r border-black/10 shrink-0 select-none sticky top-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Responsive Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#041a24]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Responsive Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-black/10 shadow-xl flex flex-col lg:hidden transition-transform duration-200 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile Navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
