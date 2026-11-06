import React from 'react';
import dynamic from 'next/dynamic';
import { getCurrentUser } from '@/app/actions/auth';
import { getHomeSummary } from '@/lib/data/home';
import { DashboardHeader } from '@/components/home/DashboardHeader';
import { ProjectTeamCard } from '@/components/home/ProjectTeamCard';
import { SupabaseDataAuditCard } from '@/components/home/SupabaseDataAuditCard';
import { DashboardKpis } from '@/components/home/DashboardKpis';
import { redirect } from 'next/navigation';

const ErdDiagram = dynamic(
  () => import('@/components/home/ErdDiagram').then((mod) => mod.ErdDiagram),
  {
    loading: () => (
      <div className="w-full h-80 rounded-[4px] bg-neutral-100/70 border border-black/5 animate-pulse flex items-center justify-center font-mono text-xs text-[#52615B]">
        Loading database architecture schema...
      </div>
    ),
  }
);

export const revalidate = 30;

interface PageProps {
  searchParams: Promise<{ forceFailure?: string; view?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (!user) {
    redirect('/login');
  }

  const forceFailure = params?.forceFailure === '1';
  const summary = await getHomeSummary(forceFailure);
  const data = summary.data;
  const counts = data?.counts || {};

  return (
    <div className="space-y-4 sm:space-y-5 max-w-[1440px] mx-auto pb-10 font-sans">
      {/* 1. Dashboard Header */}
      <DashboardHeader
        fullName={user.fullName || 'Admin'}
        checkedAt={data?.checkedAt || 'Oct 28, 2026 12:45 PM'}
        totalTables={data?.totalTables || 10}
        isConnected={summary.success}
      />

      {/* 2. Group 4 ElectronDB & Role Introductions */}
      <section aria-label="Group 4 ElectronDB">
        <ProjectTeamCard />
      </section>

      {/* 3. Supabase Connected Data Store & Verification Audit */}
      <section aria-label="Supabase Connected Data Store and Verification Audit">
        <SupabaseDataAuditCard
          counts={counts}
          totalRows={data?.totalRows || 0}
          totalTables={data?.totalTables || 10}
          checkedAt={data?.checkedAt || 'Just now'}
          durationMs={summary.durationMs}
          isConnected={summary.isSupabaseConnected ?? false}
        />
      </section>

      {/* 4. Main Center Workspace (Architecture Hub) + Right-Side Portrait KPI Panel */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        {/* Center / Left Main Area: Relational Database Architecture Hub */}
        <div className="flex-1 min-w-0 w-full">
          <section id="erd" aria-label="Relational Database Architecture">
            <ErdDiagram
              counts={counts}
              userRole={user.role}
            />
          </section>
        </div>

        {/* Right-Side Portrait KPI Monitoring Panel */}
        <aside className="w-full xl:w-[248px] shrink-0" aria-label="Key Performance Indicators">
          {data?.kpis && <DashboardKpis kpis={data.kpis} />}
        </aside>
      </div>
    </div>
  );
}
