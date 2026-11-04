# HOPE ERD: Database Architecture & Migration Guide

This directory follows the standard database architecture pattern separating **schema migrations**, **seed datasets**, **master setup scripts**, and **historical archives**.

```
database/
├── migrations/                  # DDL, constraints, views, and functions (Chronological)
│   ├── 01_create_strict_schema.sql
│   ├── 02_create_triggers_and_rpc.sql
│   ├── 03_create_analytical_views.sql
│   ├── 04_create_rls_and_roles.sql
│   ├── 05_revoke_anon_and_cleanup.sql
│   ├── 06_remove_debt_objects.sql
│   ├── 07_overview_period_analytics.sql
│   ├── 08_employee_constraints.sql
│   ├── 09_employee_functions.sql
│   ├── 10_employee_policies_and_views.sql
│   ├── 11_product_constraints.sql
│   ├── 12_product_functions.sql
│   ├── 13_product_policies_and_views.sql
│   ├── 14_customer_constraints.sql
│   ├── 15_customer_functions.sql
│   ├── 16_customer_policies_and_views.sql
│   ├── 17_sales_constraints_indexes.sql
│   ├── 18_sales_create_function.sql
│   ├── 19_sales_views_policies.sql
│   ├── 20_remove_warranty_objects.sql
│   ├── 21_home_summary_rpc.sql
│   └── 22_remove_reports_objects.sql
│
├── seeds/                       # Seed data to populate database
│   ├── 01_coursework_official_seed.sql
│   ├── 02_realistic_hardware_seed.sql
│   ├── 03_demo_operational_seed.sql
│   ├── 04_employee_seed.sql
│   ├── 05_product_seed.sql
│   ├── 06_customer_seed.sql
│   └── 07_sales_seed.sql
│
├── archive/                     # Historical draft baselines
│   ├── 01_schema.sql
│   └── 02_views.sql
│
├── hope_erd_master_setup.sql    # Complete all-in-one local/PostgreSQL setup
└── hope_erd_supabase_setup.sql  # Production Supabase setup with RLS & Roles
```

---

## 1. Migrations (`database/migrations/`)

All DDL definitions, constraints, triggers, and RPC functions are numbered chronologically in exact dependency order:

| File | Purpose |
| :--- | :--- |
| `01_create_strict_schema.sql` | Core 10-table 3NF schema DDL with Primary Keys, Foreign Keys, and Check Constraints. |
| `02_create_triggers_and_rpc.sql` | Integrity triggers (backdate prevention) and atomic `create_sale` RPC. |
| `03_create_analytical_views.sql` | Analytical views (`v_sales_summary`, `v_customer_receivables`, etc.). |
| `04_create_rls_and_roles.sql` | Row-Level Security policies and role authorization for Admin, Sales, and Cashier. |
| `05_revoke_anon_and_cleanup.sql` | Revokes anonymous access and cleans up obsolete order-tracking objects. |
| `06_remove_debt_objects.sql` | Deprecates debt views and standardizes receivables calculations. |
| `07_overview_period_analytics.sql` | RPC functions for periodic analytics (sales velocity, growth). |
| `08_employee_constraints.sql` | Salary constraints, separation date rules, and job history immutability. |
| `09_employee_functions.sql` | Admin RPC procedures: `create_employee`, `add_job_record`, `separate_employee`. |
| `10_employee_policies_and_views.sql` | Employee directory view and assignments view. |
| `11_product_constraints.sql` | Price invariants, product code regex constraints, unit modification locks. |
| `12_product_functions.sql` | Admin RPC procedures: `create_product`, `add_price_record`, `correct_price_record`. |
| `13_product_policies_and_views.sql` | `v_product_overview` and `v_price_history` views. |
| `14_customer_constraints.sql` | Customer constraints, payment term validation (`COD`, `NET 15`, `NET 30`, `NET 60`). |
| `15_customer_functions.sql` | Customer CRUD procedures and `record_payment_receipt` RPC. |
| `16_customer_policies_and_views.sql` | `v_customer_overview` and `v_customer_payments` views. |
| `17_sales_constraints_indexes.sql` | Performance indexes and constraints on `SALES` and `SALESDETAIL`. |
| `18_sales_create_function.sql` | Atomic sale creation procedure with row-locking and item validation. |
| `19_sales_views_policies.sql` | `v_sale_lines` and sales detail views with security invoker permissions. |
| `20_remove_warranty_objects.sql` | Removes deprecated warranty objects to adhere strictly to the 10 canonical ERD tables. |
| `21_home_summary_rpc.sql` | Optimized single-trip dashboard telemetry RPC. |
| `22_remove_reports_objects.sql` | Schema cleanup removing standalone report tables in favor of dynamic views. |

---

## 2. Seeds (`database/seeds/`)

Data scripts used to populate the database for local development, coursework verification, and testing:

| File | Purpose |
| :--- | :--- |
| `01_coursework_official_seed.sql` | Official 10-table coursework dataset exported from `PartialHOPEDB.sql`. |
| `02_realistic_hardware_seed.sql` | Realistic PC hardware seed data with rolling dates for live dashboards. |
| `03_demo_operational_seed.sql` | 12-month operational dataset (142 sales, 88.7% paid, payment integrity). |
| `04_employee_seed.sql` | Personnel 101–110 records covering promotions, transfers, and departments. |
| `05_product_seed.sql` | 15 PC hardware product lines across 10 component families with historical prices. |
| `06_customer_seed.sql` | Enterprise customer profiles with varied addresses and credit terms. |
| `07_sales_seed.sql` | Sales transactions linked to active employees and registered customers. |

---

## 3. Master Standalone Scripts

- **`hope_erd_master_setup.sql`**: Complete all-in-one local/Postgres script (Schema + Views + Coursework Data).
- **`hope_erd_supabase_setup.sql`**: Cloud Supabase deployment script with full role permissions.
