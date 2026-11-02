import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-[#041a24] text-white border-transparent',
    success: 'bg-[#041a24] text-white border-transparent',
    warning: 'bg-[#FEF08A]/80 text-[#713F12] border-yellow-400/50',
    danger:  'bg-red-50 text-red-800 border-red-200',
    info:    'bg-[#BFDBFE]/70 text-[#1E3A8A] border-blue-200',
    outline: 'bg-white text-[#041a24] border-black/15',
  };

  const badgeClass = variants[variant] || variants.default;

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-medium border leading-none tracking-wide select-none',
        badgeClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
