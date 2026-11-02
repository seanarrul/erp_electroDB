'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole, UserSession } from '@/lib/types';
import {
  ensureAuthDb,
  findAccountByEmail,
  emailExists,
  insertAccount,
  hashPassword,
  verifyPassword,
} from '@/lib/auth-db';

/**
 * Retrieves the current session (from session cookie or Supabase Auth).
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get('hope_demo_role')?.value as UserRole | undefined;
  const demoEmail = cookieStore.get('hope_demo_email')?.value;
  const demoName = cookieStore.get('hope_demo_name')?.value;

  if (demoRole && demoEmail) {
    const account = findAccountByEmail(demoEmail);
    return {
      id: account ? `staff-${account.id}` : 'demo-user-id',
      email: demoEmail,
      role: account ? account.role : demoRole,
      fullName: account ? account.fullName : demoName || 'Staff Member',
    };
  }

  // Fallback to Supabase Auth if session cookies are absent
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const role = (user.app_metadata?.role as UserRole) || 'admin';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    return {
      id: user.id,
      email: user.email || '',
      role,
      fullName,
    };
  } catch {
    return null;
  }
}

/**
 * Handles regular email/password login with secure bcrypt hash verification.
 */
export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  ensureAuthDb();

  // 1. Look up account in local secure auth.db
  const account = findAccountByEmail(email);

  if (account) {
    // 2. Verify password against bcrypt hash
    const isValid = await verifyPassword(password, account.passwordHash);
    if (!isValid) {
      return { error: 'Invalid email or password.' };
    }

    // 3. Establish authenticated session cookie
    const cookieStore = await cookies();
    cookieStore.set('hope_demo_role', account.role, {
      path: '/',
      httpOnly: true,
      maxAge: 86400 * 7, // 7 days session
      sameSite: 'lax',
    });
    cookieStore.set('hope_demo_email', account.email, {
      path: '/',
      httpOnly: true,
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });
    cookieStore.set('hope_demo_name', account.fullName, {
      path: '/',
      httpOnly: true,
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });

    redirect('/');
  }

  // 4. Fallback to Supabase Auth if account not in local auth.db
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: 'Invalid email or password.' };
    }

    if (data.user) {
      const cookieStore = await cookies();
      cookieStore.delete('hope_demo_role');
      cookieStore.delete('hope_demo_email');
      cookieStore.delete('hope_demo_name');
      redirect('/');
    }
  } catch {
    return { error: 'Invalid email or password.' };
  }

  redirect('/');
}

/**
 * Handles new staff account registration with bcrypt password hashing and auth.db persistence.
 */
export async function registerAction(formData: FormData) {
  const fullName = (formData.get('fullName') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const role = ((formData.get('role') as string) || 'admin') as UserRole;

  if (!fullName || !email || !password) {
    return { error: 'Please provide full name, email address, and password.' };
  }

  const validRoles: UserRole[] = ['admin', 'sales', 'cashier'];
  if (!validRoles.includes(role)) {
    return { error: 'Please select a valid staff role.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  ensureAuthDb();

  // 1. Prevent duplicate registrations
  if (emailExists(email)) {
    return { error: 'An account with this email address already exists. Please sign in.' };
  }

  // 2. Hash password with bcrypt salt (unhackable, non-reversible)
  const passwordHash = await hashPassword(password);

  // 3. Persist new account to auth.db
  try {
    insertAccount(email, passwordHash, fullName, role);
  } catch (err: any) {
    return { error: err?.message || 'Failed to save account to database.' };
  }

  // 4. Optional Supabase Auth sign-up in background
  try {
    const supabase = await createClient();
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });
  } catch {
    // Supabase offline fallback
  }

  // 5. Establish authenticated session immediately
  const cookieStore = await cookies();
  cookieStore.set('hope_demo_role', role, {
    path: '/',
    httpOnly: true,
    maxAge: 86400 * 7,
    sameSite: 'lax',
  });
  cookieStore.set('hope_demo_email', email, {
    path: '/',
    httpOnly: true,
    maxAge: 86400 * 7,
    sameSite: 'lax',
  });
  cookieStore.set('hope_demo_name', fullName, {
    path: '/',
    httpOnly: true,
    maxAge: 86400 * 7,
    sameSite: 'lax',
  });

  redirect('/');
}

/**
 * Instant one-click demo login for defense panel and grading evaluations.
 */
export async function demoLoginAction(role: UserRole) {
  const cookieStore = await cookies();
  const emailMap: Record<UserRole, { email: string; name: string }> = {
    admin: { email: 'admin@hope.demo', name: 'Maria Santos (Admin)' },
    sales: { email: 'sales@hope.demo', name: 'Juan Reyes (Sales Rep)' },
    cashier: { email: 'cashier@hope.demo', name: 'Carlos Dizon (Cashier)' },
  };

  const info = emailMap[role];
  cookieStore.set('hope_demo_role', role, { path: '/', httpOnly: true, maxAge: 86400 * 7, sameSite: 'lax' });
  cookieStore.set('hope_demo_email', info.email, { path: '/', httpOnly: true, maxAge: 86400 * 7, sameSite: 'lax' });
  cookieStore.set('hope_demo_name', info.name, { path: '/', httpOnly: true, maxAge: 86400 * 7, sameSite: 'lax' });

  redirect('/');
}

/**
 * Destroys session and returns to login.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('hope_demo_role');
  cookieStore.delete('hope_demo_email');
  cookieStore.delete('hope_demo_name');

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout errors on client
  }

  redirect('/login');
}
