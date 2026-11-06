'use client';

import React from 'react';
import Image from 'next/image';

interface TeamMember {
  role: string;
  name: string;
  handle: string;
  initials: string;
  avatar?: string;
}

const MEMBERS: TeamMember[] = [
  {
    role: 'ScrumMaster',
    name: 'DE LEON, Sean Arrul',
    handle: '@seanarrul',
    initials: 'SD',
  },
  {
    role: 'DB Admin',
    name: 'DELA CRUZ, Veil',
    handle: '@veil',
    initials: 'VD',
  },
  {
    role: 'Tester',
    name: 'ECHAGUE, Arielle',
    handle: '@arielle',
    initials: 'AE',
  },
  {
    role: 'UI Designer',
    name: 'CASING, Christian Jay',
    handle: '@christianjay',
    initials: 'CC',
  },
  {
    role: 'Developer',
    name: 'Ildefonso, Jeptah Ashley',
    handle: '@jeptah',
    initials: 'JI',
  },
];

const DISPLAY_NAMES: Record<string, string> = {
  '@seanarrul': 'Sean Arrul De Leon',
  '@veil': 'Veil Dela Cruz',
  '@arielle': 'Arielle Echague',
  '@christianjay': 'Christian Jay Casing',
  '@jeptah': 'Jeptah Ashley Ildefonso',
};

export function ProjectTeamCard() {
  return (
    <article
      aria-label="Project Team Credits"
      className="w-full min-h-[440px] p-5 sm:p-6 rounded-2xl border border-border bg-surface-1/90 dark:bg-surface-1 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_12px_32px_-12px_rgba(0,0,0,0.45)] flex flex-col justify-between font-sans transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
    >
      {/* ── 1. Formal Header ── */}
      <div className="pb-4 mb-4 border-b border-border select-none">
        <span className="block font-mono text-[10px] tracking-[0.16em] uppercase text-text-faint leading-none">
          PROJECT TEAM
        </span>
        <h2 className="font-editorial italic text-[18px] text-text font-normal leading-tight mt-1.5">
          Group 4 ElectronDB
        </h2>
        <p className="font-mono text-[10.5px] text-text-muted mt-1 leading-tight tracking-tight">
          2 BSCS 1 &bull; 5 contributors
        </p>
      </div>

      {/* ── 2. Members Vertical Timeline ── */}
      <div className="relative my-auto py-1">
        {/* Continuous 1px vertical hairline connecting the avatars */}
        <div
          className="absolute left-[17.5px] top-4 bottom-4 w-px bg-border"
          aria-hidden="true"
        />

        <div className="space-y-4">
          {MEMBERS.map((member) => {
            const displayName = DISPLAY_NAMES[member.handle] || member.name;
            return (
              <div
                key={member.handle}
                title={`${displayName} (${member.handle}) — ${member.role}`}
                className="group relative flex items-center gap-3.5 px-2 py-1.5 -mx-2 rounded-lg hover:bg-surface-2/50 transition-colors duration-150 cursor-default select-none min-h-[56px]"
              >
                {/* 36px circular avatar with solid background so line does not show through */}
                <div className="relative z-10 w-9 h-9 rounded-full ring-1 ring-border group-hover:ring-accent/40 bg-surface-2 text-text flex items-center justify-center font-mono text-[11px] font-semibold shrink-0 shadow-2xs transition-colors duration-150 overflow-hidden">
                  <Image
                    src={member.avatar || '/avatars/default-avatar.jpg'}
                    alt={displayName}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                    priority
                  />
                </div>

                {/* Name & Title Case / Monospace Role */}
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="text-[13.5px] font-medium text-text leading-snug truncate">
                    {displayName}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-text-muted leading-tight mt-0.5 truncate">
                    {member.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Subtle Monospace Footer ── */}
      <div className="pt-4 mt-4 border-t border-border flex items-center justify-center select-none">
        <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-text-faint">
          ELECTRONDB &bull; HOPEERP
        </span>
      </div>
    </article>
  );
}
