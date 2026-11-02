'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
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
        { href: '/', label: 'Home' },
      ],
    },
    {
      section: 'TRANSACTIONS',
      items: [
        { href: '/sales', label: 'Sales' },
        { href: '/customers', label: 'Customers & Payments' },
      ],
    },
    {
      section: 'CATALOG',
      items: [
        { href: '/products', label: 'Products & Pricing' },
      ],
    },
    {
      section: 'ORGANIZATION',
      items: [
        { href: '/employees', label: 'Employees' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5 overflow-y-auto font-sans">
      <div className="space-y-4">
        {/* Brand Section matching JeptahzRepo */}
        <div className="flex items-start justify-between pb-5 border-b border-neutral-100">
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="group block select-none"
            aria-label="ElectronDB G4 HopeERD"
          >
            <div className="font-editorial italic text-[25px] font-normal tracking-tight text-black group-hover:text-black/70 transition-colors leading-none">
              ElectronDB
            </div>
            <div className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase mt-1">
              Blog Archive &bull; HopeERD
            </div>
          </Link>

          {/* Panel collapse indicator / mobile close */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="p-1.5 rounded-[6px] text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Toggle panel"
            aria-label="Toggle panel"
          >
            <PanelLeftClose className="w-4 h-4 hidden lg:block stroke-[1.5]" />
            <X className="w-4 h-4 lg:hidden" />
          </button>
        </div>

        {/* Minimalist Flat Vertical Navigation Stream (Exact JeptahzRepo Text Sizing & Spacing) */}
        <nav className="mt-5 space-y-4 pt-1" aria-label="Main Navigation">
          {navLinks.map((sec) => (
            <div key={sec.section} className="space-y-1">
              <div className="px-1 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400 select-none">
                {sec.section}
              </div>

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const isDashboard = item.href === '/';
                  const isActive = isDashboard
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                  const hasChevron = item.href !== '/';

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        'group flex items-center justify-between py-2 px-1 text-[15px] font-sans transition-colors cursor-pointer select-none',
                        isActive
                          ? 'font-bold text-black'
                          : 'text-neutral-600 hover:text-black font-medium'
                      )}
                    >
                      <span className="tracking-tight truncate">{item.label}</span>
                      {hasChevron && (
                        <ChevronRight
                          className={cn(
                            'w-3.5 h-3.5 transition-colors stroke-[1.5]',
                            isActive
                              ? 'text-black stroke-[2]'
                              : 'text-neutral-300 group-hover:text-neutral-500'
                          )}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile matching JeptahzRepo */}
      <div className="pt-4 border-t border-neutral-100 mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-black/10 shrink-0 shadow-xs bg-neutral-200">
            <img
              src="/images/default-avatar.jpg"
              alt={userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center space-x-1">
              <span className="font-editorial italic text-[15px] text-black leading-tight truncate">
                {userName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
            </div>
            <span className="text-xs text-neutral-400 font-sans leading-tight truncate mt-0.5">
              @{userName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'administrator'}
            </span>
          </div>
        </div>

        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            title="Sign Out (Lock Session)"
            aria-label="Sign Out"
            className="p-1.5 text-neutral-400 hover:text-black rounded-[4px] transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 stroke-[1.5]" />
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
