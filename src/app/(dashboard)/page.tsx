import React from 'react';
import { getCurrentUser } from '@/app/actions/auth';
import { getHomeSummary } from '@/lib/data/home';
import { DashboardHeader } from '@/components/home/DashboardHeader';
import { ProjectTeamCard } from '@/components/home/ProjectTeamCard';
import { DatabaseAuditDashboard } from '@/components/home/DatabaseAuditDashboard';
import { DashboardKpis } from '@/components/home/DashboardKpis';
import { redirect } from 'next/navigation';

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
        checkedAt={data?.checkedAt || 'Nov 6, 2026 12:45 PM'}
        totalTables={data?.totalTables || 10}
        isConnected={summary.success}
      />

      {/* 2. Group 4 ElectronDB & Role Introductions */}
      <section aria-label="Group 4 ElectronDB">
        <ProjectTeamCard />
      </section>

      {/* 3. Main Center Workspace: Database Audit Dashboard + Right-Side Portrait KPI Panel */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        <div className="flex-1 min-w-0 w-full">
          <DatabaseAuditDashboard
            counts={counts}
            totalRows={data?.totalRows || 928}
            totalTables={data?.totalTables || 10}
            checkedAt={data?.checkedAt || 'Nov 6, 2026'}
            isConnected={summary.success}
            userRole={user.role}
          />
        </div>

        {/* Right-Side Portrait KPI Monitoring Panel */}
        <aside className="w-full xl:w-[248px] shrink-0" aria-label="Key Performance Indicators">
          {data?.kpis && <DashboardKpis kpis={data.kpis} />}
        </aside>
      </div>
    </div>
  );
}
