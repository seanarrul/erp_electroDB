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

  const isSuperadmin = userRole === 'Superadmin';
  const isAdmin = userRole === 'Admin' || userRole === 'admin' || isSuperadmin;

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
        { href: '/customers', label: 'Customer' },
      ],
    },
    {
      section: 'CATALOG',
      items: [
        { href: '/products', label: 'Products' },
      ],
    },
    {
      section: 'ORGANIZATION',
      items: [
        { href: '/employees', label: 'Human Resources' },
        { href: '/reports', label: 'Reports' },
      ],
    },
    ...(isAdmin
      ? [
          {
            section: 'ADMINISTRATION',
            items: [
              { href: '/users', label: 'User Management' },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5 overflow-y-auto font-sans bg-bg text-text transition-colors duration-150">
      <div className="space-y-4">
        {/* Brand Section matching Image 1 */}
        <div className="flex items-start justify-between pb-5 border-b border-border">
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="group block select-none"
            aria-label="ElectronDB Monitoring HOPEERD"
          >
            <div className="font-editorial italic text-[25px] font-normal tracking-tight text-text group-hover:text-accent transition-colors leading-none">
              ElectronDB
            </div>
            <div className="font-mono text-[10px] tracking-widest text-text-muted uppercase mt-1">
              MONITORING &bull; HOPEERD
            </div>
          </Link>

          {/* Panel collapse indicator / mobile close */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="p-1.5 rounded-[6px] text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            title="Toggle panel"
            aria-label="Toggle panel"
          >
            <PanelLeftClose className="w-4 h-4 hidden lg:block stroke-[1.5]" />
            <X className="w-4 h-4 lg:hidden" />
          </button>
        </div>

        {/* Minimalist Flat Vertical Navigation Stream matching Image 2 */}
        <nav className="mt-5 space-y-4 pt-1" aria-label="Main Navigation">
          {navLinks.map((sec) => (
            <div key={sec.section} className="space-y-1">
              <div className="px-1 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-text-faint select-none">
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
                        'group flex items-center justify-between py-2 px-1 text-[15px] font-sans transition-colors cursor-pointer select-none rounded-[2px]',
                        isActive
                          ? 'font-bold text-text dark:text-accent'
                          : 'text-text-muted hover:text-text hover:bg-surface-2/60 font-medium'
                      )}
                    >
                      <span className="tracking-tight truncate">{item.label}</span>
                      {hasChevron && (
                        <ChevronRight
                          className={cn(
                            'w-3.5 h-3.5 transition-colors stroke-[1.5]',
                            isActive
                              ? 'text-text dark:text-accent stroke-[2]'
                              : 'text-text-faint group-hover:text-text-muted'
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

      {/* Bottom Profile matching Image 2 */}
      <div className="pt-4 border-t border-border mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full ring-1 ring-border shrink-0 shadow-xs bg-[#041a24] dark:bg-white text-white dark:text-[#041a24] flex items-center justify-center font-mono font-bold text-[10px]">
            {userName ? userName.slice(0, 2).toUpperCase() : 'JE'}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center space-x-1">
              <span className="font-editorial italic text-[15px] text-text leading-tight truncate">
                {userName.length > 17 ? `${userName.slice(0, 15)}...` : userName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
            </div>
            <span className="text-xs text-text-faint font-sans leading-tight truncate mt-0.5">
              @{userName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jeptahashleyildefonso'}
            </span>
          </div>
        </div>

        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            title="Sign Out (Lock Session)"
            aria-label="Sign Out"
            className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-[4px] transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4 stroke-[1.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
