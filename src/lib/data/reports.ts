import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

function getDb(): DatabaseSync {
  const dbPath = path.join(process.cwd(), 'hope.db');
  return new DatabaseSync(dbPath);
}

// 1. Top Customers by Sales
export interface TopCustomerRow {
  rank: number;
  custNo: string;
  custName: string;
  totalSales: number;
  totalSalesFormatted: string;
}

export function getTopCustomers(fromDate = '2000-01-01', toDate = '2099-12-31', topN = 10): TopCustomerRow[] {
  const db = getDb();
  // Using v_sales_details_priced
  const query = `
    SELECT 
      c.custNo,
      c.custName,
      COALESCE(SUM(vsd.lineTotal), 0.0) as totalSales
    FROM SALES s
    JOIN CUSTOMER c ON c.custNo = s.custNo
    JOIN v_sales_details_priced vsd ON vsd.transNo = s.transNo
    WHERE s.salesDate BETWEEN ? AND ?
    GROUP BY c.custNo, c.custName
    HAVING totalSales > 0
    ORDER BY totalSales DESC
    LIMIT ?
  `;

  try {
    const rows = db.prepare(query).all(fromDate, toDate, topN) as any[];
    return rows.map((r, idx) => ({
      rank: idx + 1,
      custNo: String(r.custNo),
      custName: r.custName,
      totalSales: Number(r.totalSales),
      totalSalesFormatted: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(r.totalSales),
    }));
  } catch {
    return [];
  }
}

// 2. Product Master List (Current Price)
export interface ProductMasterRow {
  prodCode: string;
  description: string;
  unit: string;
  currentPrice: number | null;
  currentPriceFormatted: string;
}

export function getProductMasterList(): ProductMasterRow[] {
  const db = getDb();
  const query = `
    SELECT 
      p.prodCode,
      p.description,
      p.unit,
      (
        SELECT ph.unitPrice 
        FROM PRICEHIST ph 
        WHERE ph.prodCode = p.prodCode AND ph.effDate <= date('now')
        ORDER BY ph.effDate DESC 
        LIMIT 1
      ) as currentPrice
    FROM PRODUCT p
    ORDER BY p.prodCode ASC
  `;

  try {
    const rows = db.prepare(query).all() as any[];
    return rows.map((r) => ({
      prodCode: r.prodCode,
      description: r.description,
      unit: r.unit,
      currentPrice: r.currentPrice !== null ? Number(r.currentPrice) : null,
      currentPriceFormatted: r.currentPrice !== null 
        ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(r.currentPrice)
        : '—',
    }));
  } catch {
    return [];
  }
}

// 3. Top Products by Sales Amount
export interface TopProductRow {
  rank: number;
  prodCode: string;
  description: string;
  qtySold: number;
  salesAmount: number;
  salesAmountFormatted: string;
}

export function getTopProducts(fromDate = '2000-01-01', toDate = '2099-12-31', topN = 10): TopProductRow[] {
  const db = getDb();
  const query = `
    SELECT 
      vsd.prodCode,
      p.description,
      SUM(vsd.quantity) as qtySold,
      SUM(vsd.lineTotal) as salesAmount
    FROM v_sales_details_priced vsd
    JOIN PRODUCT p ON p.prodCode = vsd.prodCode
    WHERE vsd.salesDate BETWEEN ? AND ?
    GROUP BY vsd.prodCode, p.description
    ORDER BY salesAmount DESC
    LIMIT ?
  `;

  try {
    const rows = db.prepare(query).all(fromDate, toDate, topN) as any[];
    return rows.map((r, idx) => ({
      rank: idx + 1,
      prodCode: r.prodCode,
      description: r.description,
      qtySold: Number(r.qtySold),
      salesAmount: Number(r.salesAmount),
      salesAmountFormatted: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(r.salesAmount),
    }));
  } catch {
    return [];
  }
}

// 4. Active Employees (Not Separated)
export interface ActiveEmployeeRow {
  empNo: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthDate: string;
  hireDate: string;
}

export function getActiveEmployees(): ActiveEmployeeRow[] {
  const db = getDb();
  const query = `
    SELECT empNo, lastName, firstName, gender, birthDate, hireDate
    FROM EMPLOYEE
    WHERE sepDate IS NULL
    ORDER BY empNo ASC
  `;

  try {
    const rows = db.prepare(query).all() as any[];
    return rows.map((r) => ({
      empNo: String(r.empNo),
      lastName: r.lastName,
      firstName: r.firstName,
      gender: r.gender,
      birthDate: r.birthDate,
      hireDate: r.hireDate,
    }));
  } catch {
    return [];
  }
}

// 5. All Employees (Including Separated)
export interface AllEmployeeRow {
  empNo: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthDate: string;
  hireDate: string;
  sepDate: string | null;
  status: 'Active' | 'Separated';
}

export function getAllEmployeesReport(): AllEmployeeRow[] {
  const db = getDb();
  const query = `
    SELECT empNo, lastName, firstName, gender, birthDate, hireDate, sepDate
    FROM EMPLOYEE
    ORDER BY empNo ASC
  `;

  try {
    const rows = db.prepare(query).all() as any[];
    return rows.map((r) => ({
      empNo: String(r.empNo),
      lastName: r.lastName,
      firstName: r.firstName,
      gender: r.gender,
      birthDate: r.birthDate,
      hireDate: r.hireDate,
      sepDate: r.sepDate,
      status: r.sepDate ? 'Separated' : 'Active',
    }));
  } catch {
    return [];
  }
}

// 6. Employee Job History
export interface EmployeeJobHistoryRow {
  effDate: string;
  job: string;
  department: string;
  salary: number;
  salaryFormatted: string;
}

export function getEmployeeJobHistoryReport(empNo: string | number): EmployeeJobHistoryRow[] {
  const db = getDb();
  const query = `
    SELECT 
      jh.effDate,
      jh.jobCode || ' — ' || j.jobDesc as job,
      jh.deptCode || ' — ' || d.deptName as department,
      jh.salary
    FROM JOBHISTORY jh
    JOIN JOB j ON j.jobCode = jh.jobCode
    JOIN DEPARTMENT d ON d.deptCode = jh.deptCode
    WHERE jh.empNo = ?
    ORDER BY jh.effDate DESC
  `;

  try {
    const rows = db.prepare(query).all(empNo) as any[];
    return rows.map((r) => ({
      effDate: r.effDate,
      job: r.job,
      department: r.department,
      salary: Number(r.salary),
      salaryFormatted: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(r.salary),
    }));
  } catch {
    return [];
  }
}

// 7. Top Sales
export interface TopSaleRow {
  rank: number;
  transNo: string;
  date: string;
  customer: string;
  employee: string;
  total: number;
  totalFormatted: string;
}

export function getTopSales(fromDate = '2000-01-01', toDate = '2099-12-31', topN = 10): TopSaleRow[] {
  const db = getDb();
  const query = `
    SELECT 
      s.transNo,
      s.salesDate as date,
      c.custName as customer,
      e.firstName || ' ' || e.lastName as employee,
      COALESCE(SUM(vsd.lineTotal), 0.0) as total
    FROM SALES s
    JOIN CUSTOMER c ON c.custNo = s.custNo
    JOIN EMPLOYEE e ON e.empNo = s.empNo
    JOIN v_sales_details_priced vsd ON vsd.transNo = s.transNo
    WHERE s.salesDate BETWEEN ? AND ?
    GROUP BY s.transNo, s.salesDate, c.custName, e.firstName, e.lastName
    ORDER BY total DESC
    LIMIT ?
  `;

  try {
    const rows = db.prepare(query).all(fromDate, toDate, topN) as any[];
    return rows.map((r, idx) => ({
      rank: idx + 1,
      transNo: String(r.transNo),
      date: r.date,
      customer: r.customer,
      employee: r.employee,
      total: Number(r.total),
      totalFormatted: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(r.total),
    }));
  } catch {
    return [];
  }
}

export function getEmployeesListForDropdown(): Array<{ empNo: string; fullName: string }> {
  const db = getDb();
  try {
    return db.prepare("SELECT empNo, empNo || ' — ' || firstName || ' ' || lastName as fullName FROM EMPLOYEE ORDER BY empNo ASC").all() as any[];
  } catch {
    return [];
  }
}
