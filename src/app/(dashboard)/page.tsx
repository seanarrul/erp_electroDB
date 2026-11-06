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

      {/* 3. Key Performance Indicators Monitoring Grid */}
      {data?.kpis && (
        <section aria-label="Key Performance Indicators" className="w-full">
          <DashboardKpis kpis={data.kpis} layout="grid" />
        </section>
      )}
    </div>
  );
}
