'use client';

import React, { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CANONICAL_RIGHTS, type UserAccount } from '@/lib/types';
import { updateUserRightsAction } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

interface RightsModalProps {
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RightsModal({ user, isOpen, onClose, onSuccess }: RightsModalProps) {
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(user?.rights || []));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Sync selectedRights when user changes
  React.useEffect(() => {
    if (user) {
      setSelectedRights(new Set(user.rights || []));
      setError(null);
    }
  }, [user]);

  if (!user) return null;

  const modules = ['Customer', 'Product', 'Human Resources', 'Sales', 'Reports'] as const;

  const handleToggleRight = (code: string) => {
    setSelectedRights((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleSelectAllModule = (moduleName: string) => {
    setSelectedRights((prev) => {
      const next = new Set(prev);
      CANONICAL_RIGHTS.filter((r) => r.module === moduleName).forEach((r) => next.add(r.rightCode));
      return next;
    });
  };

  const handleClearModule = (moduleName: string) => {
    setSelectedRights((prev) => {
      const next = new Set(prev);
      CANONICAL_RIGHTS.filter((r) => r.module === moduleName).forEach((r) => next.delete(r.rightCode));
      return next;
    });
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateUserRightsAction(user.userId, Array.from(selectedRights));
      if (res.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rights — ${user.fullName}`}
      description={user.email}
      maxWidth="2xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 py-1 font-sans">
        {error && (
          <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        {modules.map((mod) => {
          const rightsInMod = CANONICAL_RIGHTS.filter((r) => r.module === mod);
          const allSelected = rightsInMod.every((r) => selectedRights.has(r.rightCode));

          return (
            <div
              key={mod}
              className="p-4 rounded-[4px] border border-black/10 dark:border-white/10 bg-white dark:bg-[#111A2E] space-y-3 shadow-2xs"
            >
              {/* Module Header with All / None shortcuts */}
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#041a24] dark:text-white uppercase tracking-wider font-mono">
                    {mod === 'Customer' ? 'Customer Management' : mod === 'Product' ? 'Product Management' : mod}
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    ({rightsInMod.filter((r) => selectedRights.has(r.rightCode)).length}/{rightsInMod.length})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleSelectAllModule(mod)}
                    className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                  >
                    All
                  </button>
                  <span className="text-black/20 dark:text-white/20">&bull;</span>
                  <button
                    type="button"
                    onClick={() => handleClearModule(mod)}
                    className="text-[11px] text-[#64748B] hover:underline cursor-pointer"
                  >
                    None
                  </button>
                </div>
              </div>

              {/* Checkboxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {rightsInMod.map((r) => {
                  const isChecked = selectedRights.has(r.rightCode);
                  return (
                    <label
                      key={r.rightCode}
                      className="flex items-center gap-2 text-xs text-[#1E293B] dark:text-[#E2E8F0] cursor-pointer select-none hover:text-[#0284C7] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRight(r.rightCode)}
                        className="w-3.5 h-3.5 rounded border-black/25 text-[#0284C7] focus:ring-0 cursor-pointer"
                      />
                      <span>{r.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white">
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Rights'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
