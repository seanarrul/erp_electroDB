'use client';

import React from 'react';
import { Database, Users } from 'lucide-react';

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
    name: 'CASING, Christian Jay',
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
    <article className="w-full rounded-2xl border border-black/10 bg-white/90 backdrop-blur-sm shadow-xs overflow-hidden font-sans">
      <div className="p-6 sm:p-8 space-y-6">
        {/* ── Top Header Toolbar matching user image ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-black/10">
          <div className="space-y-2">
            {/* Pill badges row */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/15 bg-white text-xs font-semibold text-[#041a24] shadow-2xs">
                <Database className="w-3.5 h-3.5 text-[#041a24]" />
                <span>Group 4 ElectronDB</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#041a24] text-white text-xs font-semibold tracking-wide">
                BSCS 1
              </span>
            </div>

            {/* Main title and subtitle */}
            <div className="pt-0.5">
              <h2 className="font-editorial italic font-normal text-3xl sm:text-4xl lg:text-5xl text-[#041a24] tracking-tight leading-tight">
                Group 4 ElectronDB
              </h2>
              <p className="text-xs sm:text-sm text-[#55554F] font-sans mt-1">
                Information Management Hope ERD &mdash; November 9, 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-sans text-xs sm:text-sm text-neutral-500 shrink-0 self-start sm:self-end">
            <Users className="w-4 h-4 text-neutral-400" />
            <span>5 core contributors</span>
          </div>
        </div>

        {/* ── 5 Member Boxes (Bigger, Spaced, Rounded-2xl with Smooth Hover Transitions) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group relative rounded-2xl border border-black/10 hover:border-black/25 bg-white p-5 flex flex-col justify-between min-h-[145px] shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 cursor-default select-none"
            >
              {/* Author Avatar & Badge Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="w-11 h-11 rounded-full ring-2 ring-black/5 overflow-hidden select-none shrink-0 bg-neutral-100 shadow-2xs">
                  <img
                    src={member.avatar || '/images/default-avatar.jpg'}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <span className="bg-[#041a24] text-white text-[11px] px-2.5 py-1 rounded-lg font-semibold tracking-wide shadow-2xs">
                  {member.role}
                </span>
              </div>

              {/* Name & Handle */}
              <div className="space-y-0.5 min-w-0 pt-4">
                <h3 className="text-sm font-bold text-[#041a24] truncate leading-snug group-hover:text-black transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs text-neutral-400 font-sans truncate">
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
