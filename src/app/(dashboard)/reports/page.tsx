import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import {
  getTopCustomers,
  getProductMasterList,
  getTopProducts,
  getActiveEmployees,
  getAllEmployeesReport,
  getTopSales,
  getEmployeesListForDropdown,
} from '@/lib/data/reports';
import { ReportsMainView } from '@/components/reports/ReportsMainView';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Pre-fetch reports dataset
  const [
    topCustomers,
    productMaster,
    topProducts,
    activeEmployees,
    allEmployees,
    topSales,
    employeesList,
  ] = await Promise.all([
    getTopCustomers('2010-01-01', '2026-12-31', 10),
    getProductMasterList(),
    getTopProducts('2010-01-01', '2026-12-31', 10),
    getActiveEmployees(),
    getAllEmployeesReport(),
    getTopSales('2010-01-01', '2026-12-31', 10),
    getEmployeesListForDropdown(),
  ]);

  return (
    <div className="space-y-6">
      <ReportsMainView
        initialTopCustomers={topCustomers}
        initialProductMaster={productMaster}
        initialTopProducts={topProducts}
        initialActiveEmployees={activeEmployees}
        initialAllEmployees={allEmployees}
        initialTopSales={topSales}
        employeesList={employeesList}
        userRights={user.rights || []}
      />
    </div>
  );
}
