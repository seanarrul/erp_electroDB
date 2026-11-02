'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Bell, ChevronDown, Menu, LogOut, ShieldCheck } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import { useSidebar } from './SidebarContext';
import { logoutAction } from '@/app/actions/auth';
import type { UserRole } from '@/lib/types';

interface HeaderProps {
  userRole?: UserRole;
  userName?: string;
  title?: string;
}

export function Header({ userRole = 'admin', userName = 'Admin' }: HeaderProps) {
  const [dateString, setDateString] = useState<string>('Wed, Oct 28, 2026');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleMobileSidebar } = useSidebar();

  useEffect(() => {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
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

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    sales: 'Sales Specialist',
    cashier: 'Billing Cashier',
  };

  const roleLabel = roleLabels[userRole] || 'Staff Member';

  return (
    <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-black/10 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 shrink-0 select-none relative z-30 font-sans">
      {/* Left Area: Mobile Menu Toggle + Global Search Bar */}
      <div className="flex items-center gap-2.5 flex-1 max-w-xl">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 text-[#041a24] hover:bg-black/5 rounded-[2px] transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <GlobalSearchBar />
      </div>

      {/* Right Controls: Notification, Date, User Avatar Menu */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative p-1.5 text-black/60 hover:text-[#041a24] hover:bg-black/5 rounded-[2px] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#041a24] rounded-full ring-1 ring-white" />
        </button>

        {/* Date Display (Monospace Provenance) */}
        <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-[#41555f]">
          <Calendar className="w-3.5 h-3.5 text-black/40" />
          <span>{dateString}</span>
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 pl-3 border-l border-black/10 cursor-pointer group hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="w-7 h-7 rounded-full bg-[#041a24] text-white flex items-center justify-center font-mono font-bold text-xs ring-1 ring-black/10">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-[#041a24] group-hover:text-black">
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
