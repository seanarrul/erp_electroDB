'use client';

import React from 'react';
import { Database, Users } from 'lucide-react';

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

export function ProjectTeamCard() {
  return (
    <article className="w-full rounded-2xl border border-border bg-surface-1 shadow-xs overflow-hidden font-sans transition-colors duration-150">
      <div className="p-4 sm:p-5 space-y-4">
        {/* ── Top Header Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="space-y-1">
            {/* Pill badges row */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-surface-2 text-[11px] font-semibold text-text shadow-2xs">
                <Database className="w-3 h-3 text-text" />
                <span>Group 4 ElectronDB</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-bg text-primary-fg text-[11px] font-semibold tracking-wide shadow-2xs">
                2 BSCS 1
              </span>
            </div>

            {/* Main title */}
            <h2 className="font-editorial italic font-normal text-xl sm:text-2xl text-text tracking-tight leading-tight">
              Group 4 ElectronDB
            </h2>
          </div>

          <div className="flex items-center gap-1.5 font-sans text-xs text-text-muted shrink-0 self-start sm:self-center">
            <Users className="w-3.5 h-3.5 text-text-faint" />
            <span>5 core contributors</span>
          </div>
        </div>

        {/* ── 5 Member Boxes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group relative rounded-xl border border-border hover:border-border-control bg-surface-1 dark:bg-surface-2/40 p-3.5 flex flex-col justify-between min-h-[116px] shadow-2xs hover:shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-default select-none"
            >
              {/* Author Avatar & Badge Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="w-9 h-9 rounded-full ring-2 ring-border select-none shrink-0 bg-[#041a24] dark:bg-white text-white dark:text-[#041a24] flex items-center justify-center font-mono font-bold text-[11px] shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <span>{member.initials}</span>
                </div>

                <span className="bg-primary-bg text-primary-fg text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide shadow-2xs">
                  {member.role}
                </span>
              </div>

              {/* Name & Handle */}
              <div className="space-y-0.5 min-w-0 pt-2.5">
                <h3 className="text-xs sm:text-[13px] font-bold text-text truncate leading-snug group-hover:text-accent transition-colors">
                  {member.name}
                </h3>
                <p className="text-[11px] text-text-faint font-sans truncate">
                  {member.handle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
