## Task
S1-DEV-02 (Sprint 1, Developer): Register user form and API (new users start as pending)

## What changed
- Added SQLite authentication database helper (`src/lib/auth-db.ts`)
- Added bcrypt password hashing, credential verification, and account creation
- Supported pending state and initial roles for newly registered accounts

## How to test
- Inspect `src/lib/auth-db.ts` methods `insertAccount`, `hashPassword`, and `findAccountByEmail`
- Verify database schema initialization for auth accounts

## Notes
Created retroactively from already-completed work, split out per sprint plan task S1-DEV-02.
