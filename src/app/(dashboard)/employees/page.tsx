import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { getHumanResourcesPageData } from '@/lib/data/employees';
import { EmployeesListView } from '@/components/employees/EmployeesListView';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const role =
    user.role === 'Superadmin' || user.role === 'Admin' || user.role === 'admin'
      ? 'admin'
      : 'user';

  const hrData = await getHumanResourcesPageData(role);

  return (
    <EmployeesListView
      initialEmployees={hrData.employees}
      initialJobs={hrData.jobs}
      initialDepartments={hrData.departments}
      initialJobHistory={hrData.jobHistory}
      metrics={hrData.metrics}
      recentAudits={hrData.recentAudits}
      userRole={role}
    />
  );
}
