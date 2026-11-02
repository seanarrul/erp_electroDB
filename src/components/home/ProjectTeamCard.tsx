'use client';

import React from 'react';

interface TeamMember {
  role: string;
  name: string;
}

const MEMBERS: TeamMember[] = [
  {
    role: 'ScrumMaster',
    name: 'DE LEON, Sean Arrul',
  },
  {
    role: 'DB Admin',
    name: 'DELA CRUZ, Veil',
  },
  {
    role: 'Tester',
    name: 'ECHAGUE, Arielle',
  },
  {
    role: 'UI Designer',
    name: 'CASING, Christian',
  },
  {
    role: 'Dev',
    name: 'Ildefonso, Jeptah Ashley',
  },
];

function BlankProfileAvatar() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full block"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask id="profile-mask">
        <circle cx="50" cy="50" r="50" fill="white" />
      </mask>
      <g mask="url(#profile-mask)">
        <circle cx="50" cy="50" r="50" fill="#9CA3AF" />
        <circle cx="50" cy="38" r="16.5" fill="#FFFFFF" />
        <ellipse cx="50" cy="85" rx="30" ry="25" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function ProjectTeamCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Group 4 ElectronDB</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
              2 BSCS 1
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Information Management Hope ERD - November 9 2026
          </p>
        </div>

        <div className="hidden sm:flex items-center text-xs text-gray-500 font-medium">
          <span>5 Members</span>
        </div>
      </div>

      {/* Team Members Portrait Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {MEMBERS.map((member) => (
          <div
            key={member.name}
            className="bg-white hover:bg-gray-50/70 rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center justify-center gap-3.5 shadow-2xs hover:shadow-xs transition-all"
          >
            {/* Blank Profile Icon matching uploaded reference image */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 shadow-2xs select-none">
              <BlankProfileAvatar />
            </div>

            {/* Member Details: Plain Name & Plain Role Tag */}
            <div className="space-y-2 w-full">
              <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 tracking-tight leading-snug">
                {member.name}
              </h3>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-800 border border-gray-200 tracking-wide">
                  {member.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
