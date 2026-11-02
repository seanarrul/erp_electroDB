'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Receipt,
  CreditCard,
  Package,
  Users,
  Search,
  CheckCircle2,
  Lock,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { BRAND } from '@/lib/brand';
import type { UserRole } from '@/lib/types';
import { logoutAction } from '@/app/actions/auth';
import { useSidebar } from '@/components/layout/SidebarContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole?: UserRole;
  userName?: string;
}

export function Sidebar({ userRole = 'admin', userName = 'JeptahzRepo' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  const [sidebarSearch, setSidebarSearch] = useState('');

  const navLinks = [
    {
      section: 'OVERVIEW',
      items: [
        { href: '/', label: 'Home', icon: Home },
      ],
    },
    {
      section: 'TRANSACTIONS',
      items: [
        { href: '/sales', label: 'Sales', icon: Receipt },
        { href: '/customers', label: 'Customers & Payments', icon: CreditCard },
      ],
    },
    {
      section: 'CATALOG',
      items: [
        { href: '/products', label: 'Products & Pricing', icon: Package },
      ],
    },
    {
      section: 'ORGANIZATION',
      items: [
        { href: '/employees', label: 'Employees', icon: Users },
      ],
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sidebarSearch.trim()) {
      router.push(`/customers?q=${encodeURIComponent(sidebarSearch.trim())}`);
      closeMobileSidebar();
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5 overflow-y-auto font-sans">
      <div className="space-y-4">
        {/* Brand Section matching Stitch */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="flex flex-col select-none group"
            aria-label="ElectronDB G4 HopeERD"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-editorial italic text-[22px] font-bold tracking-tight text-[#041a24]">
                ElectronDB
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#41555f] mt-0.5">
              G4 HOPEERD &bull; MONITORING
            </span>
          </Link>

          {/* Panel collapse indicator / mobile close */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="p-1 text-black/40 hover:text-[#041a24] transition-colors"
            aria-label="Toggle panel"
          >
            <PanelLeftClose className="w-4 h-4 hidden lg:block" />
            <X className="w-4 h-4 lg:hidden" />
          </button>
        </div>

        {/* Quick Search Bar matching Stitch */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-8 pl-8 pr-8 text-xs bg-black/3 hover:bg-black/5 focus:bg-white text-[#041a24] placeholder:text-[#41555f]/60 rounded-[3px] border border-black/10 focus:border-[#041a24] focus:outline-none transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-black/40 border border-black/10 px-1 py-0.2 rounded-[2px] bg-white pointer-events-none select-none">
            ⌘K
          </kbd>
        </form>

        {/* Grouped Navigation */}
        <nav className="space-y-4 pt-1" aria-label="Main Navigation">
          {navLinks.map((sec) => (
            <div key={sec.section} className="space-y-1">
              <div className="px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41555f]">
                {sec.section}
              </div>

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isDashboard = item.href === '/';
                  const isActive = isDashboard
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        'group flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-xs transition-all outline-none select-none',
                        isActive
                          ? 'bg-black/5 text-[#041a24] font-semibold'
                          : 'text-[#041a24] hover:bg-black/4 font-medium'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive ? 'text-[#041a24] stroke-[2.2]' : 'text-black/40 group-hover:text-[#041a24] stroke-[1.8]'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Stitch Active Indicator Dot */}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#041a24] shrink-0 ml-2" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile matching Stitch Image */}
      <div className="pt-3 border-t border-black/10 mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#041a24] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none">
            J
          </div>
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#041a24] leading-tight truncate">
                JeptahzRepo
              </span>
              <CheckCircle2 className="w-3 h-3 text-[#041a24] shrink-0 fill-[#041a24] text-white" />
            </div>
            <span className="font-mono text-[10px] text-[#41555f] leading-tight truncate mt-0.5">
              @administrator
            </span>
          </div>
        </div>

        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            title="Sign Out (Lock Session)"
            aria-label="Sign Out"
            className="p-1.5 text-black/40 hover:text-red-600 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-[230px] h-screen flex-col bg-white/95 backdrop-blur-xs border-r border-black/10 shrink-0 select-none sticky top-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop */}
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
