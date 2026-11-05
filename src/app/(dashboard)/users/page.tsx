import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { getAllUsers } from '@/lib/auth-db';
import { UserManagementView } from '@/components/users/UserManagementView';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Only Superadmin and Admin can access User Management (§1.2 & §3.8)
  const isSuperadmin = user.role === 'Superadmin';
  const isAdmin = user.role === 'Admin' || user.role === 'admin';

  if (!isSuperadmin && !isAdmin) {
    redirect('/');
  }

  const users = getAllUsers(user.role);

  return (
    <div className="space-y-6">
      <UserManagementView
        initialUsers={users}
        currentUserRole={user.role}
      />
    </div>
  );
}
