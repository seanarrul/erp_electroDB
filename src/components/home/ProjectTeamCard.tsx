'use client';

import React from 'react';
import {
  Users,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface TeamMember {
  role: string;
  name: string;
  handle: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
}

const MEMBERS: TeamMember[] = [
  {
    role: 'ScrumMaster',
    name: 'DE LEON, Sean Arrul',
    handle: '@seanarrul',
    initials: 'SA',
    avatarBg: 'bg-[#F4F4F0]',
    avatarFg: 'text-[#041a24]',
  },
  {
    role: 'DB Admin',
    name: 'DELA CRUZ, Veil',
    handle: '@veil',
    initials: 'VD',
    avatarBg: 'bg-[#F4F4F0]',
    avatarFg: 'text-[#041a24]',
  },
  {
    role: 'Tester',
    name: 'ECHAGUE, Arielle',
    handle: '@arielle',
    initials: 'AE',
    avatarBg: 'bg-[#F4F4F0]',
    avatarFg: 'text-[#041a24]',
  },
  {
    role: 'UI Designer',
    name: 'CASING, Christian jay',
    handle: '@christianjay',
    initials: 'CC',
    avatarBg: 'bg-[#F4F4F0]',
    avatarFg: 'text-[#041a24]',
  },
  {
    role: 'Developer',
    name: 'Ildefonso, Jeptah Ashley',
    handle: '@jeptah',
    initials: 'JI',
    avatarBg: 'bg-[#041a24]',
    avatarFg: 'text-white',
  },
];

export function ProjectTeamCard() {
  return (
    <article className="w-full rounded-[4px] border border-black/10 bg-white/90 backdrop-blur-xs shadow-xs overflow-hidden font-sans">
      <div className="p-5 sm:p-7 space-y-5">
        {/* ── Top Header Toolbar (Matched to JeptahzRepo Header) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[#041a24] tracking-tight">
                Group 4 ElectronDB
              </h2>
              <span className="bg-[#041a24] text-white text-[10px] px-2 py-0.5 rounded-[2px] font-mono font-medium tracking-wide">
                2 BSCS 1
              </span>
            </div>
            <p className="text-xs text-[#55554F] font-sans">
              Information Management Hope ERD &mdash; November 9, 2026
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[11px] text-black/50">
            <Users className="w-3.5 h-3.5 text-black/40" />
            <span>5 core contributors</span>
          </div>
        </div>

        {/* ── 5 Member Boxes (Exact JeptahzRepo Card Geometry & Fonts) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group relative rounded-[4px] border border-black/10 hover:border-[#041a24] bg-white p-4 space-y-3 shadow-2xs hover:shadow-xs transition-all"
            >
              {/* Author Avatar & Badge Row */}
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-full ring-2 ring-black/5 flex items-center justify-center font-mono font-bold text-xs select-none shrink-0 ${member.avatarBg} ${member.avatarFg}`}
                >
                  {member.initials}
                </div>

                <span className="bg-[#041a24] text-white text-[10px] px-1.5 py-0.5 rounded-[2px] font-mono font-medium tracking-wide">
                  {member.role}
                </span>
              </div>

              {/* Name & Handle */}
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs font-semibold text-[#041a24] truncate leading-snug group-hover:text-[#041a24] transition-colors">
                  {member.name}
                </h3>
                <p className="font-mono text-[11px] text-[#6E6E68] truncate">
                  {member.handle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer Status Strip (Exact JeptahzRepo Bottom Actions Bar) ── */}
        <div className="pt-3 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-black/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border border-black/15 bg-white text-black/70">
              <Layers className="w-3 h-3 text-black/40" />
              <span>Strict 10-Table Canonical Schema</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-black/40">
            <span>Verified System Architecture</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black/40" />
          </div>
        </div>
      </div>
    </article>
  );
}
