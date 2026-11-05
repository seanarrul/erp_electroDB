'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { RightsModal } from '@/components/users/RightsModal';
import { toggleBlockUserAction } from '@/app/actions/auth';
import type { UserAccount, UserRole } from '@/lib/types';
import { Shield, UserPlus, Lock, Unlock, SlidersHorizontal, User } from 'lucide-react';

interface UserManagementViewProps {
  initialUsers: UserAccount[];
  currentUserRole: UserRole;
}

export function UserManagementView({ initialUsers, currentUserRole }: UserManagementViewProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [selectedUserForRights, setSelectedUserForRights] = useState<UserAccount | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSuperadmin = currentUserRole === 'Superadmin';

  const handleToggleBlock = (user: UserAccount) => {
    startTransition(async () => {
      const res = await toggleBlockUserAction(user.userId);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === user.userId
              ? { ...u, isBlocked: !u.isBlocked, status: u.isBlocked ? 'Active' : 'Inactive' }
              : u
          )
        );
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 dark:border-border pb-5">
        <div>
          <h1 className="font-editorial text-3xl font-normal text-[#041a24] dark:text-white tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-[#41555f] dark:text-slate-300 mt-1">
            {!isSuperadmin
              ? 'Admins manage Users only. Superadmin accounts are hidden and cannot be modified.'
              : 'Superadmin view: Manage all system administrators, managers, and user access rights.'}
          </p>
        </div>

        <Button
          onClick={() => router.push('/login?tab=register')}
          className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs inline-flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          + Add User
        </Button>
      </div>

      {/* Main Table (Figure 35 & 36) */}
      <div className="bg-white dark:bg-surface-1 rounded-[4px] border border-black/10 dark:border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 dark:border-border bg-[#F8FAFC] dark:bg-surface-2 text-[#475569] dark:text-text-muted font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-border text-[#1E293B] dark:text-text">
              {users.map((u) => {
                const isAdmin = u.role === 'Admin' || u.role === 'Superadmin';
                const isBlocked = u.isBlocked;

                return (
                  <tr
                    key={u.userId}
                    className={`transition-colors hover:bg-neutral-50 dark:hover:bg-surface-2 ${
                      isBlocked ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-[#041a24] dark:text-white">
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </div>
                      <span className={isBlocked ? 'text-red-900 dark:text-red-300 font-semibold' : ''}>
                        {u.fullName}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[#475569] dark:text-text-muted">
                      {u.email}
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold uppercase ${
                          u.role === 'Superadmin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                            : u.role === 'Admin'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isBlocked ? (
                        <span className="inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-800">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions (Fig 35 & 36) */}
                    <td className="py-3 px-4 text-right">
                      {/* For Admins, other Admins show "—" (Fig 35) */}
                      {!isSuperadmin && isAdmin ? (
                        <span className="text-[#94A3B8] font-mono select-none">&mdash;</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(u)}
                            disabled={isPending}
                            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                              isBlocked
                                ? 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                          >
                            {isBlocked ? 'Unblock' : 'Block'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedUserForRights(u)}
                            className="px-2 py-1 rounded text-xs text-[#0284C7] hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium transition-colors cursor-pointer"
                          >
                            Rights
                          </button>

                          <button
                            type="button"
                            onClick={() => alert(`Edit profile for ${u.fullName}`)}
                            className="px-2 py-1 rounded text-xs text-[#475569] hover:text-[#041a24] hover:bg-neutral-100 font-medium transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rights Modal */}
      <RightsModal
        user={selectedUserForRights}
        isOpen={Boolean(selectedUserForRights)}
        onClose={() => setSelectedUserForRights(null)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
