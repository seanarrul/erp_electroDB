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
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 shrink-0 select-none relative z-30">
      {/* Left Area: Mobile Menu Toggle + Global Search Bar */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <GlobalSearchBar />
      </div>

      {/* Right Controls: Notification, Date, User Avatar Menu */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0 font-sans">
        {/* Notification Bell */}
        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{dateString}</span>
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 pl-3 border-l border-gray-200 cursor-pointer group hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#166B52] text-white flex items-center justify-center font-semibold text-xs shadow-2xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-800 group-hover:text-gray-900">
              {userName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
                isMenuOpen ? 'rotate-180 text-gray-700' : ''
              }`}
            />
          </button>

          {/* Interactive Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 font-sans text-xs">
              {/* User Header Info */}
              <div className="px-4 py-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#166B52] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#1F2937] truncate">{userName}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#166B52] bg-[#E8F3EE] px-2 py-0.5 rounded-full mt-1">
                      <ShieldCheck className="w-3 h-3" />
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-1.5">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
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
