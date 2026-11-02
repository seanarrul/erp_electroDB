'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Menu, LogOut, ShieldCheck } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { logoutAction } from '@/app/actions/auth';
import type { UserRole } from '@/lib/types';

interface HeaderProps {
  userRole?: UserRole;
  userName?: string;
  title?: string;
}

export function Header({ userRole = 'admin', userName = 'Jeptah Ashley Ildefonso' }: HeaderProps) {
  const pathname = usePathname();
  const [dateString, setDateString] = useState<string>('Nov 2, 2026');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleMobileSidebar } = useSidebar();

  useEffect(() => {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(now);
    setDateString(formatted);
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Compute dynamic breadcrumb based on route
  let breadcrumb = 'OVERVIEW';
  if (pathname.startsWith('/customers')) breadcrumb = 'CUSTOMERS & PAYMENTS';
  else if (pathname.startsWith('/sales')) breadcrumb = 'SALES';
  else if (pathname.startsWith('/products')) breadcrumb = 'PRODUCTS & PRICING';
  else if (pathname.startsWith('/employees')) breadcrumb = 'EMPLOYEES';
  else if (pathname.startsWith('/payments') || pathname.startsWith('/receipts')) breadcrumb = 'PAYMENTS & RECEIPTS';

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    sales: 'Sales Specialist',
    cashier: 'Billing Cashier',
  };

  const roleLabel = roleLabels[userRole] || 'Staff Member';

  return (
    <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-black/10 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 shrink-0 select-none relative z-30 font-sans">
      {/* Left: Mobile Toggle + Breadcrumb (Stitch Style) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 text-[#041a24] hover:bg-black/5 rounded-[2px] transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-[#41555f] select-none">
          <span>DATABASE</span>
          <span className="text-black/25">/</span>
          <span className="font-semibold text-[#041a24]">{breadcrumb}</span>
        </nav>
      </div>

      {/* Right Controls: Live Status Pill, Notification Bell, User Name in Editorial Italic */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Live Status Pill matching Stitch */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-black/10 bg-white/90 shadow-2xs font-mono text-[10px] text-[#41555f]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-800">LIVE</span>
          <span className="text-black/30">|</span>
          <span>{dateString}</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative p-1 text-black/60 hover:text-[#041a24] hover:bg-black/5 rounded-[2px] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile Dropdown Menu in Editorial Italic */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-1.5 pl-2 cursor-pointer group hover:opacity-90 transition-opacity focus:outline-none"
          >
            <span className="font-editorial italic text-sm text-[#041a24] group-hover:text-black">
              {userName}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-black/40 group-hover:text-[#041a24] transition-transform duration-200 ${
                isMenuOpen ? 'rotate-180 text-[#041a24]' : ''
              }`}
            />
          </button>

          {/* Interactive Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-[4px] shadow-sm border border-black/10 py-2 z-50 animate-in fade-in-50 duration-150 font-sans text-xs">
              {/* User Header Info */}
              <div className="px-4 py-3 border-b border-black/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#041a24] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 ring-1 ring-black/10">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-[#041a24] truncate">{userName}</p>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-white bg-[#041a24] px-1.5 py-0.5 rounded-[2px] mt-1">
                      <ShieldCheck className="w-3 h-3" />
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-1">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50/70 rounded-[2px] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
