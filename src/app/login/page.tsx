'use client';

import React, { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginAction, registerAction } from '@/app/actions/auth';
import { TopographicCanvas } from '@/components/ambient/TopographicCanvas';
import { HopeLogo } from '@/components/brand/HopeLogo';
import { BRAND } from '@/lib/brand';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#F4F4F0] text-[#041a24] selection:bg-[#041a24] selection:text-white overflow-x-hidden font-sans">
      {/* Matte Light Topographic Background */}
      <TopographicCanvas />

      {/* Brand Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-8 pb-4 sm:pt-12 sm:pb-6 flex items-center justify-center text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
          <HopeLogo size={48} className="shrink-0 drop-shadow-sm" />
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-[#041a24] leading-tight tracking-tight">
              {BRAND.name}
            </h1>
            <p className="font-mono text-xs sm:text-sm text-[#41555f] leading-snug mt-1">
              {BRAND.systemName}
            </p>
          </div>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-10 w-full max-w-md mx-auto">
        {/* Pure White Architectural Authentication Card */}
        <div className="w-full bg-white border border-black/10 rounded-[4px] shadow-xs p-6 sm:p-8 space-y-5">
          {/* Left-Aligned Card Heading & Supporting Text */}
          <div className="text-left">
            <h2 className="font-editorial text-2xl font-normal text-[#041a24] tracking-tight leading-tight">
              {mode === 'signin' ? 'Sign In' : 'Create Staff Account'}
            </h2>
            <p className="text-xs text-[#41555f] mt-1 font-sans">
              {mode === 'signin' ? 'Access your authorized staff account.' : 'Register a new authenticated staff member.'}
            </p>
          </div>

          {/* Accessible Segmented Tabs: Sign In & Register */}
          <div
            role="tablist"
            aria-label="Authentication modes"
            className="grid grid-cols-2 p-1 rounded-[2px] bg-[#F4F4F0] border border-black/10 text-xs font-mono"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-1.5 text-center transition-all rounded-[2px] font-medium cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#041a24] text-white shadow-2xs'
                  : 'text-[#41555f] hover:text-[#041a24]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-1.5 text-center transition-all rounded-[2px] font-medium cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#041a24] text-white shadow-2xs'
                  : 'text-[#41555f] hover:text-[#041a24]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message Box */}
          {error && (
            <div
              role="alert"
              className="rounded-[2px] bg-red-50 border border-red-200 p-2.5 text-xs text-red-800 flex items-start gap-2 font-mono"
            >
              <span className="font-semibold shrink-0">ERROR:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-semibold text-[#041a24] mb-1 font-sans"
                >
                  Email address
                </label>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="Enter your email address"
                  className="w-full h-9 px-3 bg-white border border-black/15 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 rounded-[2px] text-xs text-[#041a24] placeholder-[#41555f]/60 outline-none transition-all font-sans"
                />
              </div>

              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-semibold text-[#041a24] mb-1 font-sans"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full h-9 pl-3 pr-9 bg-white border border-black/15 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 rounded-[2px] text-xs text-[#041a24] placeholder-[#41555f]/60 outline-none transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#041a24] p-1 rounded transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-9 bg-[#041a24] hover:bg-[#1c313b] active:bg-black disabled:opacity-50 text-white font-medium text-xs rounded-[2px] shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isPending ? (
                  <span className="flex items-center gap-2 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-[#41555f] font-sans">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-medium text-[#041a24] hover:underline"
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-[#041a24] mb-1 font-sans"
                >
                  Full name
                </label>
                <input
                  id="reg-name"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="w-full h-9 px-3 bg-white border border-black/15 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 rounded-[2px] text-xs text-[#041a24] placeholder-[#41555f]/60 outline-none transition-all font-sans"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[#041a24] mb-1 font-sans"
                >
                  Email address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className="w-full h-9 px-3 bg-white border border-black/15 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 rounded-[2px] text-xs text-[#041a24] placeholder-[#41555f]/60 outline-none transition-all font-sans"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-[#041a24] mb-1 font-sans"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    className="w-full h-9 pl-3 pr-9 bg-white border border-black/15 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 rounded-[2px] text-xs text-[#041a24] placeholder-[#41555f]/60 outline-none transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#041a24] p-1 rounded transition-colors"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className="block text-xs font-semibold text-[#041a24] mb-1 font-sans"
                >
                  Confirm password
                </label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className="w-full h-9 px-3 bg-white border border-black/15 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 rounded-[2px] text-xs text-[#041a24] placeholder-[#41555f]/60 outline-none transition-all font-sans"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-role"
                  className="block text-xs font-semibold text-[#041a24] mb-1 font-sans"
                >
                  Staff role
                </label>
                <select
                  id="reg-role"
                  name="role"
                  defaultValue="admin"
                  className="w-full h-9 px-3 bg-white border border-black/15 focus:border-[#041a24] focus:ring-1 focus:ring-[#041a24]/15 rounded-[2px] text-xs text-[#041a24] outline-none transition-all font-sans cursor-pointer"
                >
                  <option value="admin">Administrator (Complete access)</option>
                  <option value="sales">Sales Specialist (Orders & invoicing)</option>
                  <option value="cashier">Cashier / Billing (OR vouchers)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-9 bg-[#041a24] hover:bg-[#1c313b] active:bg-black disabled:opacity-50 text-white font-medium text-xs rounded-[2px] shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isPending ? (
                  <span className="flex items-center gap-2 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Creating account...</span>
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-[#41555f] font-sans">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="font-medium text-[#041a24] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center font-mono text-[11px] text-[#41555f]">
        {BRAND.name} &bull; {BRAND.systemName} &bull; Group 4 ElectronDB
      </footer>
    </div>
  );
}
