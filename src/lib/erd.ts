// ========================================================================
// HOPE Group4: CANONICAL ERD METADATA & RENDERING SPECIFICATION
// File: src/lib/erd.ts
//
// 100% ACCURATE TO HopeDB_audit.sql.txt & canonical coursework database (hope.db).
// STRICT 10 TABLES (37 domain columns + audit columns) & 9 FOREIGN KEY RELATIONSHIPS.
// ========================================================================

import type { UserRole } from '@/lib/types';

export type ErdModuleId = 'employees' | 'products' | 'customers' | 'sales';

export interface ErdColumn {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  nullable?: boolean;
  description?: string;
}

export interface ErdTable {
  name: string;
  moduleId: ErdModuleId;
  moduleName: string;
  description: string;
  businessUsage: string;
  columns: ErdColumn[];
}

export interface ErdRelationship {
  id: string;
  fromTable: string;
  toTable: string;
  fromCardinality: '1' | '0..1';
  toCardinality: '0..*' | '1..*';
  label: string;
  businessMeaning: string;
  fkColumns: string[];
}

export interface ErdTableGeometry {
  tableName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ErdModule {
  id: ErdModuleId;
  order: number;
  name: string;
  tintVar: string;
  tintBg: string;
  tintBorder: string;
  textDark: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  href: string;
  roles: UserRole[];
  tables: string[];
  mainList: string;
  detail: string;
  workflowSummary: string;
}

// ------------------------------------------------------------------------
// STRICT 10 CANONICAL TABLES (Accurate to hope.db & HopeDB_audit.sql)
// ------------------------------------------------------------------------
export const ERD_TABLES: Record<string, ErdTable> = {
  DEPARTMENT: {
    name: 'DEPARTMENT',
    moduleId: 'employees',
    moduleName: 'Employees & Organization',
    description: 'Internal organizational units and retail sales branches.',
    businessUsage: 'Categorizes staff members into operational branches (Sales Branch 1, IT, Admin, etc.) for performance tracking.',
    columns: [
      { name: 'deptCode', type: 'VARCHAR(3)', isPk: true, description: 'Unique department code (10, 20... 80)' },
      { name: 'deptName', type: 'VARCHAR(20)', description: 'Official organizational unit name' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag (0 = Active, 1 = Deleted)' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification timestamp & user' },
    ],
  },
  JOB: {
    name: 'JOB',
    moduleId: 'employees',
    moduleName: 'Employees & Organization',
    description: 'Standardized company positions, titles, and professional roles.',
    businessUsage: 'Defines corporate hierarchy and role compensation brackets (AD1, MGR, PR2, SA1, etc.).',
    columns: [
      { name: 'jobCode', type: 'VARCHAR(4)', isPk: true, description: 'Standardized job role code' },
      { name: 'jobDesc', type: 'VARCHAR(20)', description: 'Official position title description' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  EMPLOYEE: {
    name: 'EMPLOYEE',
    moduleId: 'employees',
    moduleName: 'Employees & Organization',
    description: 'Permanent employee master directory with lifecycle biographical data.',
    businessUsage: 'Tracks staff hire dates, tenure, separation dates, and links sales representatives to invoices.',
    columns: [
      { name: 'empNo', type: 'VARCHAR(5)', isPk: true, description: 'Unique employee ID (00001 - 00063)' },
      { name: 'lastName', type: 'VARCHAR(15)', description: 'Employee family surname' },
      { name: 'firstName', type: 'VARCHAR(15)', description: 'Employee given name' },
      { name: 'gender', type: 'CHAR(1)', description: 'M = Male, F = Female' },
      { name: 'birthDate', type: 'DATE', description: 'Date of birth' },
      { name: 'hireDate', type: 'DATE', description: 'Employment commencement date' },
      { name: 'sepDate', type: 'DATE', nullable: true, description: 'Separation/resignation date (if applicable)' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  JOBHISTORY: {
    name: 'JOBHISTORY',
    moduleId: 'employees',
    moduleName: 'Employees & Organization',
    description: 'Chronological appointment record tracking salary, title promotions, and transfers.',
    businessUsage: 'Maintains complete promotion records and historical compensation changes over time.',
    columns: [
      { name: 'empNo', type: 'VARCHAR(5)', isPk: true, isFk: true, fkTarget: 'EMPLOYEE.empNo', description: 'Foreign key to EMPLOYEE' },
      { name: 'jobCode', type: 'VARCHAR(4)', isPk: true, isFk: true, fkTarget: 'JOB.jobCode', description: 'Foreign key to JOB' },
      { name: 'effDate', type: 'DATE', isPk: true, description: 'Effective start date of appointment' },
      { name: 'salary', type: 'DECIMAL(10,2)', description: 'Monthly base salary compensation' },
      { name: 'deptCode', type: 'VARCHAR(4)', isFk: true, fkTarget: 'DEPARTMENT.deptCode', description: 'Assigned department branch' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  CUSTOMER: {
    name: 'CUSTOMER',
    moduleId: 'customers',
    moduleName: 'Customers & Payments',
    description: 'Customer profiles, delivery addresses, and approved credit payment terms.',
    businessUsage: 'Manages client accounts, shipping destinations, and default payment terms (COD, 15D, 30D).',
    columns: [
      { name: 'custNo', type: 'VARCHAR(5)', isPk: true, description: 'Unique customer code (C0001 - C0082)' },
      { name: 'custName', type: 'VARCHAR(20)', description: 'Business or individual client name' },
      { name: 'address', type: 'VARCHAR(50)', description: 'Primary billing and shipping address' },
      { name: 'payterm', type: 'VARCHAR(3)', description: 'Payment terms code (COD, 15D, 30D)' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  PRODUCT: {
    name: 'PRODUCT',
    moduleId: 'products',
    moduleName: 'Products & Pricing',
    description: 'Hardware merchandise catalog and packaging packaging units.',
    businessUsage: 'Product master for 14 hardware families (storage, notebooks, mice, projectors, networking, etc.).',
    columns: [
      { name: 'prodCode', type: 'VARCHAR(6)', isPk: true, description: 'Prefix-based SKU code (AD0001, NB0001)' },
      { name: 'description', type: 'VARCHAR(30)', description: 'Hardware model and brand description' },
      { name: 'unit', type: 'VARCHAR(3)', description: 'Standard unit of issue (ea, pc)' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  PRICEHIST: {
    name: 'PRICEHIST',
    moduleId: 'products',
    moduleName: 'Products & Pricing',
    description: 'Temporal schedule of effective unit prices over historical timeline.',
    businessUsage: 'Guarantees accurate historical pricing: invoice line amounts compute unit price effective on the sale date.',
    columns: [
      { name: 'effDate', type: 'DATE', isPk: true, description: 'Effective start date of pricing' },
      { name: 'prodCode', type: 'VARCHAR(6)', isPk: true, isFk: true, fkTarget: 'PRODUCT.prodCode', description: 'Target catalog product' },
      { name: 'unitPrice', type: 'DECIMAL(10,2)', description: 'Selling unit price (PHP)' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  SALES: {
    name: 'SALES',
    moduleId: 'sales',
    moduleName: 'Sales & Invoicing',
    description: 'Sales transactions connecting dates, billed clients, and sales representatives.',
    businessUsage: 'Central commercial transaction record generating the official sales invoice.',
    columns: [
      { name: 'transNo', type: 'VARCHAR(8)', isPk: true, description: 'Invoice number (TR000001 - TR000124)' },
      { name: 'salesDate', type: 'DATE', description: 'Official transaction sales date' },
      { name: 'custNo', type: 'VARCHAR(5)', isFk: true, fkTarget: 'CUSTOMER.custNo', description: 'Billed customer account' },
      { name: 'empNo', type: 'VARCHAR(5)', isFk: true, fkTarget: 'EMPLOYEE.empNo', description: 'Handling sales representative' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  SALESDETAIL: {
    name: 'SALESDETAIL',
    moduleId: 'sales',
    moduleName: 'Sales & Invoicing',
    description: 'Itemized line items recording dispatched products and quantities sold.',
    businessUsage: 'Composite junction table connecting transactions to products sold; derives total order revenue.',
    columns: [
      { name: 'transNo', type: 'VARCHAR(8)', isPk: true, isFk: true, fkTarget: 'SALES.transNo', description: 'Parent sales transaction' },
      { name: 'prodCode', type: 'VARCHAR(6)', isPk: true, isFk: true, fkTarget: 'PRODUCT.prodCode', description: 'Purchased product SKU' },
      { name: 'quantity', type: 'DECIMAL(10,2)', description: 'Number of units ordered' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
  PAYMENT: {
    name: 'PAYMENT',
    moduleId: 'customers',
    moduleName: 'Customers & Payments',
    description: 'Official receipts (OR) issued for monetary payments toward specific invoices.',
    businessUsage: 'Tracks customer cash/remittance receipts against sales invoices to settle account balances.',
    columns: [
      { name: 'ORNo', type: 'VARCHAR(8)', isPk: true, description: 'Official receipt number (OR000001 - OR000165)' },
      { name: 'payDate', type: 'DATE', description: 'Payment remittance date' },
      { name: 'amount', type: 'DECIMAL(10,2)', description: 'Remitted payment amount (PHP)' },
      { name: 'transNo', type: 'VARCHAR(8)', isFk: true, fkTarget: 'SALES.transNo', description: 'Paid sales transaction' },
      { name: 'is_deleted', type: 'BOOLEAN', description: 'Soft delete flag' },
      { name: 'stamp', type: 'VARCHAR(60)', description: 'Audit modification stamp' },
    ],
  },
};

// ------------------------------------------------------------------------
// STRICT 9 CANONICAL RELATIONSHIPS
// ------------------------------------------------------------------------
export const ERD_RELATIONSHIPS: ErdRelationship[] = [
  {
    id: 'rel_dept_jobhistory',
    fromTable: 'DEPARTMENT',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Assigned Dept',
    businessMeaning: 'One department assigns staff positions to zero or many job history entries.',
    fkColumns: ['deptCode'],
  },
  {
    id: 'rel_job_jobhistory',
    fromTable: 'JOB',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Position Held',
    businessMeaning: 'One job title is appointed to zero or many job history records.',
    fkColumns: ['jobCode'],
  },
  {
    id: 'rel_emp_jobhistory',
    fromTable: 'EMPLOYEE',
    toTable: 'JOBHISTORY',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'Career History',
    businessMeaning: 'Each employee has one or more chronological job appointments.',
    fkColumns: ['empNo'],
  },
  {
    id: 'rel_emp_sales',
    fromTable: 'EMPLOYEE',
    toTable: 'SALES',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Sales Rep Handled',
    businessMeaning: 'An employee acts as the assigned representative for zero or many sales orders.',
    fkColumns: ['empNo'],
  },
  {
    id: 'rel_cust_sales',
    fromTable: 'CUSTOMER',
    toTable: 'SALES',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Customer Orders',
    businessMeaning: 'A customer account places zero or many sales orders.',
    fkColumns: ['custNo'],
  },
  {
    id: 'rel_sales_salesdetail',
    fromTable: 'SALES',
    toTable: 'SALESDETAIL',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'Contains Line Items',
    businessMeaning: 'A sales invoice must contain one or more itemized product line items.',
    fkColumns: ['transNo'],
  },
  {
    id: 'rel_prod_salesdetail',
    fromTable: 'PRODUCT',
    toTable: 'SALESDETAIL',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Purchased SKU',
    businessMeaning: 'A catalog product appears in zero or many sales detail line items.',
    fkColumns: ['prodCode'],
  },
  {
    id: 'rel_prod_pricehist',
    fromTable: 'PRODUCT',
    toTable: 'PRICEHIST',
    fromCardinality: '1',
    toCardinality: '1..*',
    label: 'Price Schedule',
    businessMeaning: 'A product has one or more effective unit prices over its lifecycle.',
    fkColumns: ['prodCode'],
  },
  {
    id: 'rel_sales_payment',
    fromTable: 'SALES',
    toTable: 'PAYMENT',
    fromCardinality: '1',
    toCardinality: '0..*',
    label: 'Payment Receipts',
    businessMeaning: 'A sales invoice receives zero or many official payment receipts.',
    fkColumns: ['transNo'],
  },
];

// ------------------------------------------------------------------------
// SPACIOUS PRESENTATION GEOMETRY (1380 x 740 Canvas)
// Generous gaps prevent overlapping text, clipped labels, or cramped crow's feet
// ------------------------------------------------------------------------
export const ERD_GEOMETRY: Record<string, ErdTableGeometry> = {
  // Left Zone: Human Resources
  DEPARTMENT:  { tableName: 'DEPARTMENT',  x: 40,   y: 40,  width: 210, height: 96 },
  JOB:         { tableName: 'JOB',         x: 40,   y: 175, width: 210, height: 96 },
  EMPLOYEE:    { tableName: 'EMPLOYEE',    x: 40,   y: 320, width: 210, height: 216 },
  JOBHISTORY:  { tableName: 'JOBHISTORY',  x: 350,  y: 105, width: 230, height: 168 },

  // Center Zone: Commercial Orders & Receipts
  CUSTOMER:    { tableName: 'CUSTOMER',    x: 680,  y: 40,  width: 210, height: 144 },
  SALES:       { tableName: 'SALES',       x: 680,  y: 310, width: 210, height: 144 },
  PAYMENT:     { tableName: 'PAYMENT',     x: 680,  y: 560, width: 210, height: 144 },

  // Right Zone: Product Catalog & Pricing
  SALESDETAIL: { tableName: 'SALESDETAIL', x: 960,  y: 310, width: 200, height: 122 },
  PRICEHIST:   { tableName: 'PRICEHIST',   x: 1210, y: 50,  width: 200, height: 122 },
  PRODUCT:     { tableName: 'PRODUCT',     x: 1210, y: 310, width: 200, height: 122 },
};

// ------------------------------------------------------------------------
// FOUR CORE BUSINESS MODULES
// ------------------------------------------------------------------------
export const ERD_MODULES: ErdModule[] = [
  {
    id: 'employees',
    order: 1,
    name: 'Employees & Organization',
    tintVar: '--module-employees',
    tintBg: '#DBEAFE',
    tintBorder: '#3B82F6',
    textDark: '#1E3A8A',
    badgeBg: '#EFF6FF',
    badgeBorder: '#93C5FD',
    badgeText: '#1D4ED8',
    href: '/employees',
    roles: ['admin'],
    tables: ['DEPARTMENT', 'JOB', 'EMPLOYEE', 'JOBHISTORY'],
    mainList: 'Staff directory, active status, tenure, and compensation',
    detail: 'Staff lifecycle, promotions & department assignments',
    workflowSummary: 'Tracks personnel hiring, assigned roles, department transfers, and salary advancement through historical appointments.',
  },
  {
    id: 'sales',
    order: 2,
    name: 'Sales & Invoicing',
    tintVar: '--module-sales',
    tintBg: '#FEE2E2',
    tintBorder: '#EF4444',
    textDark: '#7F1D1D',
    badgeBg: '#FEF2F2',
    badgeBorder: '#FCA5A5',
    badgeText: '#B91C1C',
    href: '/sales',
    roles: ['admin', 'sales', 'cashier'],
    tables: ['SALES', 'SALESDETAIL'],
    mainList: 'Invoices with sales representative, customer, and itemized lines',
    detail: 'Commercial invoices & dispatched line items',
    workflowSummary: 'Records customer sales orders, links the handling sales representative, and itemizes product quantities dispatched.',
  },
  {
    id: 'products',
    order: 3,
    name: 'Products & Pricing',
    tintVar: '--module-products',
    tintBg: '#DCFCE7',
    tintBorder: '#22C55E',
    textDark: '#14532D',
    badgeBg: '#F0FDF4',
    badgeBorder: '#86EFAC',
    badgeText: '#15803D',
    href: '/products',
    roles: ['admin', 'sales', 'cashier'],
    tables: ['PRODUCT', 'PRICEHIST'],
    mainList: 'Hardware product catalog with point-in-time price history',
    detail: 'Hardware catalog SKUs & temporal price schedule',
    workflowSummary: 'Maintains catalog hardware SKUs and point-in-time unit price schedules, ensuring past transactions retain their historical prices.',
  },
  {
    id: 'customers',
    order: 4,
    name: 'Customers & Payments',
    tintVar: '--module-customers',
    tintBg: '#FEF9C3',
    tintBorder: '#EAB308',
    textDark: '#713F12',
    badgeBg: '#FEFCE8',
    badgeBorder: '#FDE047',
    badgeText: '#A16207',
    href: '/customers',
    roles: ['admin', 'sales', 'cashier'],
    tables: ['CUSTOMER', 'PAYMENT'],
    mainList: 'Customer profiles, agreed credit terms, and official receipts',
    detail: 'Customer accounts & official receipt payments',
    workflowSummary: 'Manages customer account credit terms and records official receipts (OR) to settle invoice balances.',
  },
];
