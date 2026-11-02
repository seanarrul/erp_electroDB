'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Receipt,
  CreditCard,
  Package,
  Users,
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

export function Sidebar({ userRole = 'admin', userName = 'Jeptah Ashley Ildefonso' }: SidebarProps) {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

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

        {/* Grouped Navigation */}
        <nav className="space-y-4 pt-1" aria-label="Main Navigation">
          {navLinks.map((sec) => (
            <div key={sec.section} className="space-y-1">
              <div className="px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400 select-none">
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
                        'group flex items-center justify-between px-2.5 py-2 rounded-[3px] text-sm transition-all outline-none select-none',
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
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#041a24] leading-tight truncate">
                {userName}
              </span>
              <CheckCircle2 className="w-3 h-3 text-[#041a24] shrink-0 fill-[#041a24] text-white" />
            </div>
            <span className="font-mono text-[10px] text-[#41555f] leading-tight truncate mt-0.5">
              @{userName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'administrator'}
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
      <aside className="hidden lg:flex w-[248px] h-screen flex-col bg-white/95 backdrop-blur-xs border-r border-black/10 shrink-0 select-none sticky top-0">
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
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-black/10 shadow-xl flex flex-col lg:hidden transition-transform duration-200 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile Navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
