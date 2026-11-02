# Secure Authentication Storage & Credential Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure, server-isolated authentication and credential storage system with cryptographic salting and hashing (`scrypt`), separate from the canonical 10-table course database, enabling persistent, production-grade registration, login, and session validation that works seamlessly both offline and online.

**Architecture:** A dedicated, server-only credentials database (`auth.db`) is introduced completely isolated from the canonical `hope.db`. Passwords are protected using Node.js native `crypto.scryptSync` with unique 16-byte random cryptographic salts and verified using constant-time `crypto.timingSafeEqual` comparison. Authentication operations are sealed within Next.js Server Actions (`'use server'`), ensuring password hashes and salts never leak to client components or public bundles.

**Tech Stack:** Next.js 15 (Server Actions, HTTP-only cookies), Node.js native `crypto` (`scryptSync`, `randomBytes`, `timingSafeEqual`), Node.js `node:sqlite` (`DatabaseSync`), Zod validation, Supabase Auth fallback.

**Spec Reference:** `.agent/rules/hope.md` (Strict 10-Table Canonical Relational Schema Rule) and `docs/DATABASE_SPECIFICATION.md`.

---

## Global Constraints & Rule Synchronization

1. **Strict 10-Table Canonical Relational Schema Preservation (`.agent/rules/hope.md`)**:
   - The primary database (`hope.db`) and SQL seed export must remain **strictly 10 tables**: `DEPARTMENT`, `JOB`, `EMPLOYEE`, `JOBHISTORY`, `CUSTOMER`, `PRODUCT`, `PRICEHIST`, `SALES`, `SALESDETAIL`, `PAYMENT`.
   - **ZERO** additional authentication tables, surrogate columns, or password fields may be added to `hope.db` or the canonical SQL schema.
2. **Credential Isolation**:
   - Authentication records are stored in a dedicated, isolated database file (`auth.db`), decoupled from business and course evaluation data.
3. **Cryptographic Protection**:
   - Passwords must **never** be stored in plaintext.
   - Every password must be hashed using `scrypt` with a unique 128-bit cryptographic salt: `crypto.scryptSync(password, salt, 64)`.
   - Hash comparisons must use `crypto.timingSafeEqual` to prevent timing analysis attacks.
4. **Server-Only Execution Barrier**:
   - Authentication storage modules must use Node.js server-only barriers (`'use server'` or server-scoped imports) to ensure credentials cannot be imported into client-side React bundles.
5. **Seamless User Experience**:
   - Registration, login, session retention, role-based routing (`admin`, `sales`, `cashier`), and instant one-click demo logins must work normally and reliably.

---

## Review Focus

1. **Rule Compliance (10-Table Integrity):** Inspect `hope.db` table list before and after to verify that `hope.db` remains strictly 10 tables with zero extra tables or modified columns.
2. **Plaintext Password Exposure Prevention:** Verify that no raw password or hardcoded plaintext credential is stored in files, cookies, logs, or databases.
3. **Timing-Attack Resistance:** Verify that password verification uses `timingSafeEqual` and returns consistent rejection timing regardless of whether the email or password is invalid.
4. **Offline & Online Resilience:** Registration and login must work 100% reliably when offline (using `auth.db`) and seamlessly synchronize with Supabase Auth when credentials/cloud connectivity are configured.
5. **Session Continuity Across Server Restarts:** Newly registered users must be able to log out, close the browser, and log back in successfully without losing their account.

---

## File Structure & Responsibilities

| File | Responsibility |
| :--- | :--- |
| `src/lib/auth/store.ts` *(New)* | Server-only credential manager and `auth.db` interface (scrypt hashing, salting, user creation, password verification, demo account initialization). |
| `src/lib/auth/session.ts` *(New)* | Signed session cookie creation, parsing, encryption, and destruction. |
| `src/app/actions/auth.ts` *(Modify)* | Server actions for `loginAction`, `registerAction`, `demoLoginAction`, `getCurrentUser`, and `logoutAction` integrating with `store.ts`. |
| `src/app/login/page.tsx` *(Modify)* | Client login/registration view maintaining smooth error feedback and responsive UI. |
| `tests/auth-security.test.ts` *(New)* | Unit and integration test suite asserting scrypt hashing, salt uniqueness, timing-safe equality, and canonical 10-table schema untouched status. |

---

## Task Decomposition

### Task 1: Dedicated Server-Side Auth Storage Engine (`src/lib/auth/store.ts`)
**Files:**
- Create: `src/lib/auth/store.ts`
- Test: `scratch/test-auth-store.js`

**Requirements:**
- Initialize `auth.db` with an isolated schema:
  ```sql
  CREATE TABLE IF NOT EXISTS app_credentials (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales', 'cashier')),
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );
  ```
- Implement cryptographic functions:
  - `hashPassword(password: string): { hash: string; salt: string }`
  - `verifyPassword(password: string, storedHash: string, salt: string): boolean`
  - `createCredential(email, password, fullName, role): Promise<AuthUser>`
  - `authenticateCredential(email, password): Promise<AuthUser | null>`
  - `getCredentialByEmail(email): AuthUser | null`
  - `initDefaultDemoCredentials()`: Pre-seeds salted & hashed demo accounts (`admin@hope.demo`, `sales@hope.demo`, `cashier@hope.demo`) without plaintext exposure.

- [ ] **Step 1.1:** Write unit test in scratch script to verify `hashPassword` produces unique hashes for identical passwords (due to random salts).
- [ ] **Step 1.2:** Write unit test in scratch script to verify `verifyPassword` returns `true` for correct password and `false` for incorrect password.
- [ ] **Step 1.3:** Implement `src/lib/auth/store.ts` with `node:crypto` and `DatabaseSync('auth.db')`.
- [ ] **Step 1.4:** Execute scratch test script and verify all hashing, salting, and storage assertions pass.

---

### Task 2: Refactor Server Actions (`src/app/actions/auth.ts`)
**Files:**
- Modify: `src/app/actions/auth.ts`
- Test: `scratch/test-auth-actions.js`

**Requirements:**
- Update `registerAction`:
  - Validate form fields (`fullName`, `email`, `password`, `role`) with Zod.
  - Call `store.createCredential(...)` to hash and persist in `auth.db`.
  - Also call Supabase `auth.signUp` if Supabase credentials are valid.
  - Set secure HTTP-only cookies (`hope_demo_role`, `hope_demo_email`, `hope_demo_name`).
  - Redirect to `/`.
- Update `loginAction`:
  - Remove hardcoded plaintext passwords in `DEMO_USERS`.
  - Validate email and password against `store.authenticateCredential(email, password)`.
  - If valid, set secure HTTP-only session cookies and redirect to `/`.
  - If invalid, return user-facing error message `"Invalid email or password."`.
- Update `demoLoginAction`:
  - Authenticate against initialized demo credentials in `store`.
- Update `getCurrentUser`:
  - Read session cookies and verify identity against `auth.db` / Supabase.
- Update `logoutAction`:
  - Clear all session cookies and call `supabase.auth.signOut()` if active.

- [ ] **Step 2.1:** Remove plaintext password dictionary from `src/app/actions/auth.ts`.
- [ ] **Step 2.2:** Connect `loginAction` and `registerAction` to `src/lib/auth/store.ts`.
- [ ] **Step 2.3:** Test full registration $\rightarrow$ logout $\rightarrow$ re-login cycle with scratch script.
- [ ] **Step 2.4:** Verify demo one-click login remains 100% functional for grading and defense evaluation.

---

### Task 3: 10-Table Canonical Database Rule Integrity Verification
**Files:**
- Verify: `hope.db`
- Verify: `database/03_seed_data.sql`
- Verify: `database/hope_erd_master_setup.sql`

**Requirements:**
- Ensure `hope.db` contains **only and strictly** the 10 canonical tables:
  1. `DEPARTMENT`
  2. `JOB`
  3. `EMPLOYEE`
  4. `JOBHISTORY`
  5. `CUSTOMER`
  6. `PRODUCT`
  7. `PRICEHIST`
  8. `SALES`
  9. `SALESDETAIL`
  10. `PAYMENT`
- Verify that `auth.db` is completely separate and does not bleed into the course ERD or database dump.
- Add `auth.db` to `.gitignore` so credential databases are never committed to public git repositories, while ensuring auto-seeding creates `auth.db` on any fresh clone automatically.

- [ ] **Step 3.1:** Run database schema verification script to confirm `hope.db` has exactly 10 tables and 0 extra columns.
- [ ] **Step 3.2:** Verify `.gitignore` includes `auth.db` and any local credential artifacts.
- [ ] **Step 3.3:** Verify that a fresh run on a machine without `auth.db` automatically initializes demo credentials on startup.

---

### Task 4: End-to-End User Experience & Verification
**Files:**
- Test: Live HTTP endpoints (`/login`, `/`, `/sales`, `/customers`, etc.)

**Requirements:**
- Test 1: Staff account registration on `/login` with full name, email, password, and role.
- Test 2: Logout and verify redirection to `/login`.
- Test 3: Sign in with the registered email and password $\rightarrow$ verify 200 OK and redirect to dashboard.
- Test 4: Sign in with an incorrect password $\rightarrow$ verify clean error prompt `"Invalid email or password."`.
- Test 5: One-click demo login buttons for Admin, Sales Rep, and Cashier $\rightarrow$ verify instant authenticated entry.

- [ ] **Step 4.1:** Perform end-to-end API and browser tests for all 5 scenarios.
- [ ] **Step 4.2:** Confirm zero regression across existing modules (`/sales`, `/customers`, `/products`, `/employees`).
- [ ] **Step 4.3:** Commit plan and implementation with clear Git commit history.
