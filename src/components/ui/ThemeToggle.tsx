'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { getPref, setPref, subscribeTheme, type ThemePref } from '@/lib/theme/theme';

interface ThemeToggleProps {
  variant?: 'segmented' | 'compact' | 'menu-item';
  className?: string;
}

export function ThemeToggle({ variant = 'segmented', className = '' }: ThemeToggleProps) {
  // Safe SSR & client external store subscription (prevents hydration mismatch)
  const currentPref = useSyncExternalStore(subscribeTheme, getPref, () => 'system');

  const options: Array<{ pref: ThemePref; label: string; icon: React.ReactNode }> = [
    {
      pref: 'system',
      label: 'System',
      icon: <Monitor className="w-3.5 h-3.5" />,
    },
    {
      pref: 'light',
      label: 'Light',
      icon: <Sun className="w-3.5 h-3.5" />,
    },
    {
      pref: 'dark',
      label: 'Dark',
      icon: <Moon className="w-3.5 h-3.5" />,
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + options.length) % options.length;
    } else {
      return;
    }
    e.preventDefault();
    setPref(options[nextIndex].pref);
  };

  if (variant === 'menu-item') {
    return (
      <div className={`px-3 py-2 space-y-1.5 ${className}`}>
        <span className="block font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Appearance
        </span>
        <div
          role="radiogroup"
          aria-label="Theme preference"
          className="grid grid-cols-3 gap-1 p-0.5 rounded-[3px] bg-surface-2 border border-border"
        >
          {options.map((opt, idx) => {
            const isSelected = currentPref === opt.pref;
            return (
              <button
                key={opt.pref}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setPref(opt.pref)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-[2px] font-mono text-[11px] transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'bg-surface-1 text-text shadow-2xs font-semibold border border-border'
                    : 'text-text-muted hover:text-text hover:bg-surface-1/50'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Segmented control in the top bar header
  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className={`inline-flex items-center p-0.5 rounded-[3px] bg-surface-2 border border-border select-none ${className}`}
    >
      {options.map((opt, idx) => {
        const isSelected = currentPref === opt.pref;
        return (
          <button
            key={opt.pref}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${opt.label} theme`}
            title={`${opt.label} theme`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => setPref(opt.pref)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`p-1 sm:px-2 sm:py-1 rounded-[2px] flex items-center gap-1 font-mono text-[10px] transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
              isSelected
                ? 'bg-surface-1 text-text shadow-2xs font-semibold border border-border'
                : 'text-text-muted hover:text-text hover:bg-surface-1/50'
            }`}
          >
            {opt.icon}
            <span className="hidden md:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
