# Secure Local Auth Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current plaintext hardcoded demo credentials with a local SQLite auth database (`auth.db`) that stores bcrypt-hashed passwords, persists registered accounts across server restarts, and keeps the existing login/register/sign-in UI working exactly as-is.

**Architecture:** A separate `auth.db` SQLite database (gitignored, never pushed) stores a single `staff_accounts` table with email, bcrypt-hashed password, full name, and role. The three demo accounts are seeded on first run with hashed passwords. `registerAction` inserts new rows into this table. `loginAction` reads from it and verifies with bcrypt. No Supabase dependency for local dev. The existing cookie-based session mechanism (`hope_demo_role`, `hope_demo_email`, `hope_demo_name`) is kept unchanged — only the credential source changes.

**Tech Stack:** Node.js `node:sqlite` (DatabaseSync), `bcryptjs` (pure-JS bcrypt — zero native compilation, works on Vercel), Next.js Server Actions, existing cookie session.

**Spec:** User request — "fix where password is saved — saved into secured place and accessible through codebase only, working like normal login sign-in and register."

## Global Constraints

- `hope.db` must not be modified — strict 10-table canonical schema per `.agent/rules/hope.md`.
- `auth.db` is gitignored (already in `.gitignore`) — credentials never reach GitHub.
- No new npm dependencies beyond `bcryptjs` (and its `@types/bcryptjs` devDep).
- Demo accounts (`admin@hope.demo`, `sales@hope.demo`, `cashier@hope.demo`) must continue working with password `demo`.
- Existing login page UI (`src/app/login/page.tsx`) requires zero visual changes.
- Session cookies (`hope_demo_role`, `hope_demo_email`, `hope_demo_name`) stay as-is.
- `npm run dev` and Vercel deployment must not break.

## Review Focus

1. **Duplicate email registration** — A second `registerAction` call with the same email should return an error, not insert a duplicate row. Task 2 tests this.
2. **Wrong password on valid email** — `loginAction` with correct email but wrong password must return `"Invalid email or password."`, not crash or leak whether the email exists. Task 3 tests this.
3. **SQL injection in email/name fields** — bcryptjs handles password safely, but email and fullName flow into SQL. Parameterized queries prevent injection. Task 2 step assertions use a `'; DROP TABLE` email to verify.
4. **Empty auth.db on fresh clone** — A developer cloning the repo has no `auth.db`. The `ensureAuthDb()` function must create the file, table, and seed rows automatically on the first request. Task 1 tests this.
5. **Case-insensitive email matching** — `Admin@Hope.Demo` must match `admin@hope.demo`. Task 3 tests this.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/auth-db.ts` | **Create.** Opens/creates `auth.db`, ensures `staff_accounts` table exists, seeds demo rows, exports `getAuthDb()` and `ensureAuthDb()`. |
| `src/app/actions/auth.ts` | **Modify.** Replace `DEMO_USERS` hardcoded map with `auth.db` lookups via bcrypt. `loginAction` → hash-verify. `registerAction` → insert hashed row. `demoLoginAction` → unchanged (cookie-only, no password). |
| `package.json` | **Modify.** Add `bcryptjs` dependency and `@types/bcryptjs` devDependency. |

---

### Task 1: Auth Database Module (`src/lib/auth-db.ts`)

**Files:**
- Create: `src/lib/auth-db.ts`
- Modify: `package.json` (add `bcryptjs`, `@types/bcryptjs`)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `ensureAuthDb(): void` — creates `auth.db` file, `staff_accounts` table, and seeds demo accounts if they don't exist.
  - `getAuthDb(): DatabaseSync` — returns an open handle to `auth.db`.
  - `findAccountByEmail(email: string): { id: number; email: string; passwordHash: string; fullName: string; role: string } | undefined`
  - `insertAccount(email: string, passwordHash: string, fullName: string, role: string): void`
  - `emailExists(email: string): boolean`

- [ ] **Step 1: Install bcryptjs**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Verify install succeeded**

Run: `node -e "require('bcryptjs')"`
Expected: exits 0, no output.

- [ ] **Step 3: Create `src/lib/auth-db.ts`**

The module must:
1. Import `DatabaseSync` from `node:sqlite`, `path`, and `bcryptjs`.
2. `getAuthDb()` opens `auth.db` from `process.cwd()`.
3. `ensureAuthDb()` creates `staff_accounts` table:
   ```sql
   CREATE TABLE IF NOT EXISTS staff_accounts (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     email TEXT NOT NULL UNIQUE COLLATE NOCASE,
     passwordHash TEXT NOT NULL,
     fullName TEXT NOT NULL,
     role TEXT NOT NULL CHECK(role IN ('admin','sales','cashier')),
     createdAt TEXT NOT NULL DEFAULT (datetime('now'))
   )
   ```
4. After table creation, check if `admin@hope.demo` exists. If not, insert three demo rows with `bcryptjs.hashSync('demo', 10)` for each.
5. `findAccountByEmail(email)` uses a parameterized `SELECT` with `LOWER(email) = LOWER(?)`.
6. `insertAccount(email, passwordHash, fullName, role)` uses a parameterized `INSERT`.
7. `emailExists(email)` uses a parameterized `SELECT 1` with `LOWER(email) = LOWER(?)`.

- [ ] **Step 4: Manually verify module loads**

Run: `node -e "const m = require('./src/lib/auth-db'); m.ensureAuthDb(); const a = m.findAccountByEmail('admin@hope.demo'); console.log(a ? 'FOUND admin' : 'NOT FOUND');"`
Expected: prints `FOUND admin` and creates `auth.db` file in project root.

- [ ] **Step 5: Verify `auth.db` is gitignored**

Run: `git status --short auth.db`
Expected: no output (file is ignored by `.gitignore` line `auth.db`).

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth-db.ts package.json package-lock.json
git commit -m "feat: add auth-db module with bcrypt-hashed local credential storage"
```

---

### Task 2: Wire Register Action to auth.db

**Files:**
- Modify: `src/app/actions/auth.ts` — `registerAction` function

**Interfaces:**
- Consumes: `ensureAuthDb()`, `emailExists(email)`, `insertAccount(email, hash, name, role)` from Task 1
- Produces: `registerAction(formData: FormData)` — unchanged signature, now persists to `auth.db`

- [ ] **Step 1: Update `registerAction` in `src/app/actions/auth.ts`**

Replace the current body (which only sets cookies and optionally calls Supabase) with:
1. Call `ensureAuthDb()`.
2. Validate `fullName`, `email`, `password` (existing validation stays).
3. Call `emailExists(email)` — if true, return `{ error: 'An account with this email already exists.' }`.
4. Hash password: `const hash = await bcrypt.hash(password, 10)`.
5. Call `insertAccount(email, hash, fullName, role)`.
6. Set the three session cookies (same as current code).
7. `redirect('/')`.

- [ ] **Step 2: Test registration manually**

1. Start dev server: `npm run dev`.
2. Open `/login`, switch to Register tab.
3. Register with `test@example.com` / `Test User` / `test123` / `admin`.
4. Verify redirect to `/` and dashboard shows "Test User".
5. Verify `auth.db` contains the new row:
   ```bash
   node -e "const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync('auth.db'); console.log(db.prepare('SELECT id,email,fullName,role FROM staff_accounts').all())"
   ```
   Expected: shows the 3 demo rows + `test@example.com`.

- [ ] **Step 3: Test duplicate email rejection**

1. Attempt to register `test@example.com` again.
2. Expected: error message `"An account with this email already exists."`.

- [ ] **Step 4: Commit**

```bash
git add src/app/actions/auth.ts
git commit -m "feat: registerAction persists accounts to auth.db with bcrypt"
```

---

### Task 3: Wire Login Action to auth.db

**Files:**
- Modify: `src/app/actions/auth.ts` — `loginAction` function, remove `DEMO_USERS` constant

**Interfaces:**
- Consumes: `ensureAuthDb()`, `findAccountByEmail(email)` from Task 1, `bcrypt.compare` from `bcryptjs`
- Produces: `loginAction(formData: FormData)` — unchanged signature, now verifies against `auth.db`

- [ ] **Step 1: Update `loginAction` in `src/app/actions/auth.ts`**

Replace the current body with:
1. Call `ensureAuthDb()`.
2. Extract and validate `email` and `password` from formData (existing validation).
3. Call `findAccountByEmail(email)` — if `undefined`, return `{ error: 'Invalid email or password.' }`.
4. `const valid = await bcrypt.compare(password, account.passwordHash)` — if `!valid`, return `{ error: 'Invalid email or password.' }`.
5. Set the three session cookies with `account.role`, `account.email`, `account.fullName`.
6. `redirect('/')`.

Remove the `DEMO_USERS` constant from the top of the file — it is no longer needed.

- [ ] **Step 2: Test demo login still works**

1. Restart dev server.
2. Sign in with `admin@hope.demo` / `demo`.
3. Expected: redirect to `/`, dashboard shows "Maria Santos (Admin)".
4. Sign out, sign in with `sales@hope.demo` / `demo`.
5. Expected: redirect to `/`, dashboard shows "Juan Reyes (Sales Rep)".

- [ ] **Step 3: Test wrong password rejection**

1. Sign in with `admin@hope.demo` / `wrongpassword`.
2. Expected: error `"Invalid email or password."`.

- [ ] **Step 4: Test case-insensitive email**

1. Sign in with `Admin@Hope.Demo` / `demo`.
2. Expected: successful login (same as `admin@hope.demo`).

- [ ] **Step 5: Test registered account login**

1. If `test@example.com` was registered in Task 2, sign in with `test@example.com` / `test123`.
2. Expected: redirect to `/`, dashboard shows "Test User".

- [ ] **Step 6: Remove Supabase auth fallback from loginAction (optional cleanup)**

The Supabase `signInWithPassword` fallback can remain as dead code (it only fires when Supabase env vars are configured). No functional change needed.

- [ ] **Step 7: Commit**

```bash
git add src/app/actions/auth.ts
git commit -m "feat: loginAction verifies credentials against auth.db with bcrypt"
```

---

### Task 4: Verify Full Flow, TypeScript, and Push

**Files:**
- No new files. Verification only.

**Interfaces:**
- Consumes: all prior tasks
- Produces: clean commit pushed to `origin/main` and `collab/main`

- [ ] **Step 1: TypeScript compilation check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Route health check**

Run: `node scripts/verify-frontend-routes.js`
Expected: all routes return 200.

- [ ] **Step 3: Full login cycle smoke test**

1. Delete `auth.db` to simulate fresh clone.
2. Restart dev server.
3. Sign in with `admin@hope.demo` / `demo` → dashboard loads.
4. Sign out → login page.
5. Register `fresh@test.com` / `Fresh User` / `fresh1` / `cashier` → dashboard loads as cashier.
6. Sign out → sign in with `fresh@test.com` / `fresh1` → dashboard loads.

- [ ] **Step 4: Verify auth.db is not tracked**

Run: `git status`
Expected: `auth.db` does not appear in untracked or staged files.

- [ ] **Step 5: Push to both remotes**

```bash
git push origin main
git push collab main
git push collab main:JeptahIldefonso-Branch
```

- [ ] **Step 6: Commit summary tag**

If any fixups were needed during verification, squash into a single commit:
```bash
git commit -m "chore: verify secure auth flow end-to-end"
```
