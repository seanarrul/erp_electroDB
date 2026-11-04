# HOPE ERD: Database Chronological Migration Guide

This directory contains the canonical relational database schema, integrity triggers, analytical views, security policies, and domain seed files for the **HOPE Group 4 Sales and Payments Monitoring System**.

---

## 1. Master All-In-One Setup Scripts

For quick deployment without running 28 individual migrations, use either of the master scripts:

- **[`hope_erd_master_setup.sql`](./hope_erd_master_setup.sql)**: Complete all-in-one setup script (Schema + Views + Assignment compatibility views + Full Coursework seed dataset). Recommended for fresh SQLite/PostgreSQL resets.
- **[`hope_erd_supabase_setup.sql`](./hope_erd_supabase_setup.sql)**: Production Supabase setup with Row-Level Security (RLS) and Role-Based Access Control (Admin, Sales, Cashier).

---

## 2. Chronological Migration Sequence (01 – 28)

Run these scripts in exact numerical order when setting up or migrating the database step-by-step:

### Phase 1: Core Foundation (01 – 04)
| Step | File | Purpose |
| :---: | :--- | :--- |
| **01** | [`01_strict_schema.sql`](./01_strict_schema.sql) | DDL creating the core 10 3NF tables with Primary Keys, Foreign Keys, and Check Constraints. |
| **02** | [`02_triggers_and_rpc.sql`](./02_triggers_and_rpc.sql) | Data integrity triggers (backdated price prevention, transfer validation) and atomic `create_sale` RPC. |
| **03** | [`03_views.sql`](./03_views.sql) | Analytical and reporting views (`v_sales_summary`, `v_sales_details_priced`, `v_customer_receivables`, etc.). |
| **04** | [`04_rls_and_roles.sql`](./04_rls_and_roles.sql) | Row-Level Security policies and role authorization for Admin, Sales, and Cashier. |

### Phase 2: Base Seeds, Cleanups & Analytics (05 – 09)
| Step | File | Purpose |
| :---: | :--- | :--- |
| **05** | [`05_realistic_seed_data.sql`](./05_realistic_seed_data.sql) | Realistic PC hardware seed data with rolling dates for live dashboards and charts. |
| **06** | [`06_revoke_anon_and_cleanup_track_order.sql`](./06_revoke_anon_and_cleanup_track_order.sql) | Revokes anonymous database access and cleans up obsolete order-tracking objects. |
| **07** | [`07_remove_debt_objects.sql`](./07_remove_debt_objects.sql) | Deprecates outdated debt objects and standardizes receivables calculations. |
| **08** | [`08_demo_data.sql`](./08_demo_data.sql) | 12-month operational dataset with 142 sales, 88.7% collection rate, and payment integrity. |
| **09** | [`09_overview_period_analytics.sql`](./09_overview_period_analytics.sql) | RPC functions for periodic analytics (sales velocity, month-over-month growth). |

### Phase 3: Domain Module Migrations (10 – 25)

#### Employee Domain (10 – 13)
| Step | File | Purpose |
| :---: | :--- | :--- |
| **10** | [`10_employee_constraints.sql`](./10_employee_constraints.sql) | Salary check constraints, separation date rules, and job history immutability. |
| **11** | [`11_employee_functions.sql`](./11_employee_functions.sql) | Admin RPC procedures: `create_employee`, `add_job_record`, `separate_employee`. |
| **12** | [`12_employee_policies_and_views.sql`](./12_employee_policies_and_views.sql) | Employee directory view and assignments view. |
| **13** | [`13_employee_seed.sql`](./13_employee_seed.sql) | Personnel seed records (Employees 101–110) covering promotions, transfers, and departments. |

#### Product Domain (14 – 17)
| Step | File | Purpose |
| :---: | :--- | :--- |
| **14** | [`14_product_constraints.sql`](./14_product_constraints.sql) | Price invariants, product code regex constraints, and unit modification locks. |
| **15** | [`15_product_functions.sql`](./15_product_functions.sql) | Admin RPC procedures: `create_product`, `add_price_record`, `correct_price_record`. |
| **16** | [`16_product_policies_and_views.sql`](./16_product_policies_and_views.sql) | `v_product_overview` and `v_price_history` views. |
| **17** | [`17_product_seed.sql`](./17_product_seed.sql) | 15 PC hardware product lines across 10 component families with historical prices. |

#### Customer Domain (18 – 21)
| Step | File | Purpose |
| :---: | :--- | :--- |
| **18** | [`18_customer_constraints.sql`](./18_customer_constraints.sql) | Customer constraints, payment term validation (`COD`, `NET 15`, `NET 30`, `NET 60`). |
| **19** | [`19_customer_functions.sql`](./19_customer_functions.sql) | Customer CRUD procedures and `record_payment_receipt` RPC. |
| **20** | [`20_customer_policies_and_views.sql`](./20_customer_policies_and_views.sql) | `v_customer_overview` and `v_customer_payments` views. |
| **21** | [`21_customer_seed.sql`](./21_customer_seed.sql) | Enterprise customer seed profiles with varied addresses and credit terms. |

#### Sales Domain (22 – 25)
| Step | File | Purpose |
| :---: | :--- | :--- |
| **22** | [`22_sales_constraints_indexes.sql`](./22_sales_constraints_indexes.sql) | Performance indexes and constraints on `SALES` and `SALESDETAIL`. |
| **23** | [`23_sales_create_function.sql`](./23_sales_create_function.sql) | Production atomic sale creation procedure with row-locking and item validation. |
| **24** | [`24_sales_views_policies.sql`](./24_sales_views_policies.sql) | `v_sale_lines` and sales detail views with security invoker permissions. |
| **25** | [`25_sales_seed.sql`](./25_sales_seed.sql) | Sales transactions linked to active employees and registered customers. |

### Phase 4: System Architecture Cleanups (26 – 28)
| Step | File | Purpose |
| :---: | :--- | :--- |
| **26** | [`26_remove_warranty_objects.sql`](./26_remove_warranty_objects.sql) | Removes deprecated warranty objects to adhere strictly to the 10 canonical ERD tables. |
| **27** | [`27_home_summary_rpc.sql`](./27_home_summary_rpc.sql) | Optimized `get_home_summary()` RPC aggregating table counts, KPIs, and recents in 1 trip. |
| **28** | [`28_remove_reports_objects.sql`](./28_remove_reports_objects.sql) | Final schema cleanup removing standalone report tables in favor of dynamic views. |

---

## 3. Archive (`/database/archive`)

Contains legacy baseline drafts that were superseded during development:
- **`01_schema.sql`**: Early unconstrained schema draft (superseded by `01_strict_schema.sql`).
- **`02_views.sql`**: Early view definitions (superseded by `03_views.sql`).
- **`03_seed_data.sql`**: Raw 10-table SQL insert dump from `PartialHOPEDB.sql` (now integrated into `hope_erd_master_setup.sql`).
