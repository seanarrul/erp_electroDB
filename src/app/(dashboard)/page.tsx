import React from 'react';
import { getCurrentUser } from '@/app/actions/auth';
import { getHomeSummary } from '@/lib/data/home';
import { DashboardHeader } from '@/components/home/DashboardHeader';
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
    <div className="flex flex-col min-[1100px]:flex-row items-start gap-4 sm:gap-5 max-w-[1440px] mx-auto pb-10 font-sans">
      {/* ── Main Content Column (Title, Database Status, Live Monitoring Stats) ── */}
      <div className="flex-1 min-w-0 w-full space-y-4 sm:space-y-5">
        {/* 1. Dashboard Header (Title & Database Connected status card) */}
        <DashboardHeader
          fullName={user.fullName || 'Admin'}
          checkedAt={data?.checkedAt || 'Nov 6, 2026 12:45 PM'}
          totalTables={data?.totalTables || 10}
          isConnected={summary.success}
        />

        {/* 2. Key Performance Indicators Monitoring Grid (Moves up into freed space) */}
        {data?.kpis && (
          <section aria-label="Key Performance Indicators" className="w-full">
            <DashboardKpis kpis={data.kpis} layout="grid" />
          </section>
        )}
      </div>

      {/* ── Right Rail: Slim, Sticky Team Credits Panel ── */}
      <aside
        aria-label="Team Credits"
        className="w-full min-[1100px]:w-[250px] shrink-0 min-[1100px]:sticky min-[1100px]:top-4"
      >
        <ProjectTeamCard />
      </aside>
    </div>
  );
}
