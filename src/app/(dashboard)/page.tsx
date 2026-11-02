import React from 'react';
import { getCurrentUser } from '@/app/actions/auth';
import { getHomeSummary } from '@/lib/data/home';
import { DashboardHeader } from '@/components/home/DashboardHeader';
import { ProjectTeamCard } from '@/components/home/ProjectTeamCard';
import { DashboardKpis } from '@/components/home/DashboardKpis';
import { ErdDiagram } from '@/components/home/ErdDiagram';
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
    <div className="space-y-6 sm:space-y-8 max-w-[1240px] mx-auto pb-12 font-sans">
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

      {/* 3. Database Overview & Interactive Canonical ERD Section (Standalone Card) */}
      <section id="erd" aria-label="Relational Database Architecture">
        <div className="bg-white rounded-[4px] border border-black/10 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-normal text-[#041a24] tracking-tight flex items-center gap-2.5">
                <span>Relational Database Architecture</span>
                <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-[2px] bg-[#041a24] text-white">
                  10 Tables &bull; 9 Foreign Keys
                </span>
              </h2>
              <p className="text-xs text-[#41555f] mt-0.5">
                Canonical ERD schema mapping departments, jobs, employees, customers, products, sales, and payments.
              </p>
            </div>
          </div>

          <ErdDiagram
            counts={counts}
            userRole={user.role}
          />
        </div>
      </section>

      {/* 4. KPI Metric Cards */}
      <section aria-label="Key Performance Indicators">
        {data?.kpis && <DashboardKpis kpis={data.kpis} />}
      </section>
    </div>
  );
}
