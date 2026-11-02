'use client';

import React from 'react';
import {
  Users,
  Database,
  CheckCircle2,
  Palette,
  Code2,
  Sparkles,
} from 'lucide-react';

interface TeamMember {
  role: string;
  name: string;
  responsibility: string;
  initials: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    iconColor: string;
  };
  icon: React.ElementType;
}

const MEMBERS: TeamMember[] = [
  {
    role: 'ScrumMaster',
    name: 'DE LEON, Sean Arrul',
    responsibility: 'Agile sprint orchestration, requirement facilitation, team cadence, and project delivery milestones.',
    initials: 'SD',
    badgeStyle: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      iconBg: 'bg-[#E8F3EE]',
      iconColor: 'text-[#166B52]',
    },
    icon: Users,
  },
  {
    role: 'DB Admin',
    name: 'DELA CRUZ, Veil',
    responsibility: 'Canonical 3NF schema architecture, table constraints, foreign keys, and PostgreSQL/SQLite integrity.',
    initials: 'VD',
    badgeStyle: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100/70',
      iconColor: 'text-blue-700',
    },
    icon: Database,
  },
  {
    role: 'Tester',
    name: 'ECHAGUE, Arielle',
    responsibility: 'Quality assurance, functional test matrix, constraint audits, and business rule verification.',
    initials: 'AE',
    badgeStyle: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100/70',
      iconColor: 'text-amber-700',
    },
    icon: CheckCircle2,
  },
  {
    role: 'UI Designer',
    name: 'CASING, Christian',
    responsibility: 'Design system tokens, user experience layout, responsive ergonomics, and visual hierarchy.',
    initials: 'CC',
    badgeStyle: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100/70',
      iconColor: 'text-purple-700',
    },
    icon: Palette,
  },
  {
    role: 'WebDeveloper',
    name: 'Ildefonso, Jeptah Ashley',
    responsibility: 'Full-stack Next.js 15 architecture, server actions, client reactivity, and data layer integrations.',
    initials: 'JI',
    badgeStyle: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      iconBg: 'bg-teal-100/70',
      iconColor: 'text-teal-700',
    },
    icon: Code2,
  },
];

export function ProjectTeamCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Group 4 ElectronDB</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F3EE] text-[#166B52] border border-emerald-100">
              2 BSCS 1
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Information Management Hope ERD - November 9 2026
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium text-gray-600">5 Active Members</span>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {MEMBERS.map((member) => {
          const Icon = member.icon;
          return (
            <div
              key={member.name}
              className="bg-[#F8FAFC]/80 hover:bg-white rounded-xl border border-gray-100 hover:border-gray-200/90 p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs transition-all group"
            >
              <div>
                {/* Top: Avatar Initials + Role Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${member.badgeStyle.iconBg} ${member.badgeStyle.iconColor} shadow-2xs select-none`}
                  >
                    {member.initials}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${member.badgeStyle.bg} ${member.badgeStyle.text} ${member.badgeStyle.border} uppercase tracking-wider`}
                  >
                    <Icon className="w-3 h-3 stroke-[2.2]" />
                    <span>{member.role}</span>
                  </span>
                </div>

                {/* Member Name & Responsibilities */}
                <div className="mt-3">
                  <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 tracking-tight leading-snug group-hover:text-[#166B52] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                    {member.responsibility}
                  </p>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-2 border-t border-gray-100/90 flex items-center justify-between text-[10px] font-medium text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Role</span>
                </span>
                <span className="text-gray-400 uppercase font-mono text-[9px]">G4</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
