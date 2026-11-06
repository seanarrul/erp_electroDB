'use client';

import React from 'react';

interface TeamMember {
  role: string;
  name: string;
  handle: string;
  initials: string;
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
    <div
      aria-label="Project Team Credits"
      className="w-full rounded-md border border-border bg-surface-1 p-3 font-sans transition-colors duration-150"
    >
      {/* Header: Quiet monospace uppercase label */}
      <div className="pb-2 mb-1.5 border-b border-border/80">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-text-faint select-none">
          TEAM &bull; GROUP 4 &bull; 2 BSCS 1
        </span>
      </div>

      {/* Members List: Compact vertical list (desktop rail) / compact wrapped row (below 1100px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 min-[1100px]:grid-cols-1 gap-1">
        {MEMBERS.map((member) => {
          const displayName = DISPLAY_NAMES[member.handle] || member.name;
          return (
            <div
              key={member.handle}
              title={`${displayName} (${member.handle}) — ${member.role}`}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-[3px] hover:bg-surface-2/60 transition-colors duration-150 cursor-default min-h-[38px] select-none"
            >
              {/* Compact initials avatar (24px) */}
              <div className="w-6 h-6 rounded-full ring-1 ring-border bg-surface-2 text-text flex items-center justify-center font-mono text-[10px] font-semibold shrink-0">
                {member.initials}
              </div>

              {/* Name & plain muted role */}
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[12px] font-medium text-text leading-tight truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-text-muted leading-tight truncate">
                  {member.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
