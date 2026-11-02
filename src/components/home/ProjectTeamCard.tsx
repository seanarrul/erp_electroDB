'use client';

import React from 'react';
import {
  Workflow,
  Database,
  ShieldCheck,
  Palette,
  Code2,
} from 'lucide-react';

interface TeamMember {
  role: string;
  name: string;
  initials: string;
  icon: React.ComponentType<{ className?: string }>;
  avatarStyle: string;
  badgeStyle: string;
}

const MEMBERS: TeamMember[] = [
  {
    role: 'ScrumMaster',
    name: 'DE LEON, Sean Arrul',
    initials: 'SA',
    icon: Workflow,
    avatarStyle: 'bg-slate-100 text-slate-700 border border-slate-200',
    badgeStyle: 'text-slate-600 bg-slate-50 border-slate-200',
  },
  {
    role: 'DB Admin',
    name: 'DELA CRUZ, Veil',
    initials: 'VC',
    icon: Database,
    avatarStyle: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    badgeStyle: 'text-amber-800 bg-amber-50/80 border-amber-200',
  },
  {
    role: 'Tester',
    name: 'ECHAGUE, Arielle',
    initials: 'AE',
    icon: ShieldCheck,
    avatarStyle: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    badgeStyle: 'text-emerald-800 bg-emerald-50/80 border-emerald-200',
  },
  {
    role: 'UI Designer',
    name: 'CASING, Christian jay',
    initials: 'CC',
    icon: Palette,
    avatarStyle: 'bg-indigo-50 text-indigo-800 border border-indigo-200/80',
    badgeStyle: 'text-indigo-800 bg-indigo-50/80 border-indigo-200',
  },
  {
    role: 'Developer',
    name: 'Ildefonso, Jeptah Ashley',
    initials: 'JI',
    icon: Code2,
    avatarStyle: 'bg-[#166B52] text-white shadow-2xs',
    badgeStyle: 'text-[#166B52] bg-[#E8F3EE] border-[#C3DED3]',
  },
];

export function ProjectTeamCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs font-sans space-y-2.5">
      {/* Slim Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-[13px] font-bold text-gray-900 tracking-tight">
            Group 4 ElectronDB
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            2 BSCS 1
          </span>
          <span className="text-gray-300 hidden sm:inline">&bull;</span>
          <span className="text-[11px] text-gray-500 font-normal">
            Information Management Hope ERD &mdash; Nov 9, 2026
          </span>
        </div>

        <div className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>5 Members</span>
        </div>
      </div>

      {/* Slim & Distinctive Member Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {MEMBERS.map((member) => {
          const Icon = member.icon;
          return (
            <div
              key={member.name}
              className="group bg-[#FAFBFA] hover:bg-white rounded-lg border border-gray-200 hover:border-gray-300 p-2.5 flex items-center gap-2.5 shadow-2xs hover:shadow-xs transition-all"
            >
              {/* Unique Initial Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${member.avatarStyle}`}
              >
                {member.initials}
              </div>

              {/* Member Name & Role */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight group-hover:text-[#166B52] transition-colors">
                  {member.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border truncate ${member.badgeStyle}`}
                  >
                    <Icon className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{member.role}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
