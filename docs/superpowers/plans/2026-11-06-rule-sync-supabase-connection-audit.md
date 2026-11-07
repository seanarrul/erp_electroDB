# [Rule-Sync] Database Architecture, UI Presentation & Supabase Connection Audit Plan

> **For agentic workers & evaluators:**  
> This specification documents the canonical data architecture of **Hope, Inc. ERP (ElectronDB / MONITORING • HOPEERP)**. It explains how database records are used, normalized, and presented across all 6 core modules, and establishes a non-destructive, audit-tracked implementation plan to test Supabase connectivity without violating the system's strict database preservation rules.

**Goal:** Establish an evaluation-ready data architecture summary and build a non-destructive Supabase connection test suite with automated schema parity audit logging.

**Architecture:** Read-only inspection engine querying local SQLite (`hope.db`) and remote Supabase PostgREST endpoints to verify 100% row and schema parity across all 10 canonical tables (928 records), outputting a tamper-evident audit report while maintaining zero-risk data preservation.

**Tech Stack:** Next.js 15, TypeScript, SQLite (`node:sqlite` DatabaseSync), Supabase JS SDK (`@supabase/ssr`), Tailwind CSS.

**Spec:** `HOPE_ERP_SYSTEM_GUIDELINES.md` & `AGENTS.md`

---

## Global Constraints

1. **Strict Data Preservation Mandate**: Zero data loss, zero modifications, zero additions, and zero data replication against active databases (`hope.db` with 928 rows, `auth.db` with 50 rows).
2. **Read-Only Probes**: All verification queries against Supabase must use `head: true` or read-only `SELECT` / `COUNT` statements. Never run `INSERT`, `UPDATE`, `DELETE`, `ALTER`, or `DROP`.
3. **Derived Data Not Stored**: In accordance with 3NF, totals in `SALES` and current prices in `PRODUCT` are calculated dynamically at query time using `PRICEHIST.effDate <= salesDate`.
4. **Role Projection**: Superadmin & Admin view full audit trails (`status`, `stamp`). Users see `Active` records only with `status` and `stamp` columns strictly omitted.
5. **Secrets Security**: Environment variables in `.env.local` must remain isolated and never committed to git or printed to logs.

---

## Review Focus

1. **Zero Database Alteration**: Ensure the connection test script cannot mutate or write records to either SQLite or Supabase.
2. **Sleeping / Paused Project Detection**: Handle dormant free-tier Supabase instances via an explicit 5-second timeout with graceful fallback to `hope.db`.
3. **Exact Row Parity Audit**: Ensure all 10 tables match the exact target counts (Total 928 rows: `EMPLOYEE: 32`, `JOB: 14`, `DEPARTMENT: 8`, `JOBHISTORY: 54`, `CUSTOMER: 82`, `PRODUCT: 57`, `PRICEHIST: 79`, `SALES: 124`, `SALESDETAIL: 313`, `PAYMENT: 165`).
4. **Data Privacy Compliance (RA 10173)**: Salary data in `JOBHISTORY` must remain protected under the `view_job_history` right.
5. **Cross-Report Reconciliation**: Mathematical equality across reports ($\sum \text{Top Products} \equiv \sum \text{Top Customers} \equiv \sum \text{Top Sales}$) must be verified.

---

### Task 1: Environment & Secrets Handshake

**Files:**
- Create: `scripts/test-supabase-connection.ts`
- Read: `.env.local` (read-only without logging values)

- [ ] Check for presence of `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Verify that URLs match valid HTTPS Supabase project patterns.
- [ ] Provide status feedback (`CONFIGURED` vs `CREDENTIALS_MISSING`) without leaking secrets.

---

### Task 2: Network Ping & Latency Verification

**Files:**
- Modify: `scripts/test-supabase-connection.ts`

- [ ] Execute an HTTPS `GET` against `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`.
- [ ] Measure and record network round-trip time in milliseconds (RTT).
- [ ] Catch and handle timeouts (> 5000ms) to identify paused or sleeping projects.

---

### Task 3: 10-Table Schema Parity & Row Count Audit

**Files:**
- Modify: `scripts/test-supabase-connection.ts`
- Reference: `hope.db`

- [ ] Query exact counts from local SQLite using `node:sqlite`.
- [ ] Query remote Supabase table row counts using `.select('*', { count: 'exact', head: true })`.
- [ ] Compare row counts across all 10 canonical tables:
  - `EMPLOYEE`: 32
  - `JOB`: 14
  - `DEPARTMENT`: 8
  - `JOBHISTORY`: 54
  - `CUSTOMER`: 82
  - `PRODUCT`: 57
  - `PRICEHIST`: 79
  - `SALES`: 124
  - `SALESDETAIL`: 313
  - `PAYMENT`: 165
- [ ] Assert that total row sum equals **928** with zero discrepancy.

---

### Task 4: Structured Audit Report Generation

**Files:**
- Create: `reports/supabase_connection_audit.json`

- [ ] Output a structured JSON audit artifact containing:
  - Timestamp (ISO 8601)
  - Connection status (`CONNECTED` / `OFFLINE` / `UNCONFIGURED`)
  - Latency (ms)
  - Table-by-table parity report
  - `zeroDataLossVerified: true` assertion.

---

### Task 5: Fallback & Resiliency Test

**Files:**
- Test: `src/lib/data/home.ts`
- Test: `src/lib/data/products.ts`

- [ ] Simulate disconnected/paused Supabase state.
- [ ] Verify that local application queries seamlessly fall back to `hope.db` without 500 errors.
- [ ] Verify `isSupabaseConnected: false` state is displayed cleanly in the UI.
