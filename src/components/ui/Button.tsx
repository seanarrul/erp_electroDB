import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium transition-all rounded-[2px] select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#041a24]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99] gap-1.5 cursor-pointer';

    const variants = {
      primary: 'bg-[#041a24] text-white hover:bg-[#1c313b] active:bg-black shadow-2xs border border-[#041a24]',
      default: 'bg-[#041a24] text-white hover:bg-[#1c313b] active:bg-black shadow-2xs border border-[#041a24]',
      secondary: 'bg-[#F4F4F0] text-[#041a24] hover:bg-[#EAEAE4] active:bg-[#DFDFD7] border border-black/10 shadow-2xs',
      outline: 'border border-black/15 bg-white text-[#041a24] hover:bg-[#F4F4F0] hover:border-black/30 active:bg-[#EAEAE4] shadow-2xs',
      ghost: 'bg-transparent text-[#41555f] hover:bg-black/5 hover:text-[#041a24] active:bg-black/10',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-2xs border border-transparent',
    };

    const sizes = {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-8 px-3.5 text-xs sm:text-sm',
      lg: 'h-10 px-4.5 text-sm',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-0.5 h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
