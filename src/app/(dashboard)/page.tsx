import React from 'react';
import { getCurrentUser } from '@/app/actions/auth';
import { getHomeSummary } from '@/lib/data/home';
import { DashboardHeader } from '@/components/home/DashboardHeader';
import { DatabaseStatusWidget } from '@/components/home/DatabaseStatusWidget';
import { ProjectTeamCard } from '@/components/home/ProjectTeamCard';
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

  return (
    <div className="flex flex-col min-[1200px]:grid min-[1200px]:grid-cols-[minmax(0,1fr)_288px] min-[1200px]:gap-x-10 gap-y-8 max-w-[1440px] mx-auto pb-10 font-sans items-start">
      {/* ── Main Content Column (Title, Database Status, Live Monitoring Stats) ── */}
      <div className="min-w-0 w-full space-y-4 sm:space-y-5">
        {/* 1. Dashboard Header (Title & Database Connected status card) */}
        <DashboardHeader
          fullName={user.fullName || 'Admin'}
          checkedAt={data?.checkedAt || 'Nov 6, 2026 12:45 PM'}
          totalTables={data?.totalTables || 10}
          isConnected={summary.success}
        />

        {/* 2. Key Performance Indicators Monitoring Grid */}
        {data?.kpis && (
          <section aria-label="Key Performance Indicators" className="w-full">
            <DashboardKpis kpis={data.kpis} layout="grid" />
          </section>
        )}
      </div>

      {/* ── Right Rail: Floating, Formal Vertical Team Panel & Database Status Widget ── */}
      <aside
        aria-label="Team Credits and Database Status"
        className="w-full max-w-[480px] min-[1200px]:max-w-[288px] min-[1200px]:w-[288px] shrink-0 min-[1200px]:sticky min-[1200px]:top-24 min-[1200px]:mr-6 self-start space-y-3.5"
      >
        {/* Database Connected Status Box above Project Team */}
        <DatabaseStatusWidget
          checkedAt={data?.checkedAt || 'Nov 6, 2026, 5:27 PM'}
          totalTables={data?.totalTables || 10}
          isConnected={summary.isSupabaseConnected ?? summary.success}
        />
        <ProjectTeamCard />
      </aside>
    </div>
  );
}
