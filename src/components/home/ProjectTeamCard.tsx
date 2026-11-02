'use client';

import React from 'react';
import { Users } from 'lucide-react';

interface TeamMember {
  role: string;
  name: string;
  handle: string;
  avatar?: string;
}

const MEMBERS: TeamMember[] = [
  {
    role: 'ScrumMaster',
    name: 'DE LEON, Sean Arrul',
    handle: '@seanarrul',
    avatar: '/images/default-avatar.jpg',
  },
  {
    role: 'DB Admin',
    name: 'DELA CRUZ, Veil',
    handle: '@veil',
    avatar: '/images/default-avatar.jpg',
  },
  {
    role: 'Tester',
    name: 'ECHAGUE, Arielle',
    handle: '@arielle',
    avatar: '/images/default-avatar.jpg',
  },
  {
    role: 'UI Designer',
    name: 'CASING, Christian jay',
    handle: '@christianjay',
    avatar: '/images/default-avatar.jpg',
  },
  {
    role: 'Developer',
    name: 'Ildefonso, Jeptah Ashley',
    handle: '@jeptah',
    avatar: '/images/default-avatar.jpg',
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
                <div className="w-9 h-9 rounded-full ring-2 ring-black/5 overflow-hidden select-none shrink-0 bg-neutral-200">
                  <img
                    src={member.avatar || '/images/default-avatar.jpg'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
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
      </div>
    </article>
  );
}
