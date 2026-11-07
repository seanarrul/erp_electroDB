## Task
S1-DEV-03 (Sprint 1, Developer): Login and logout with session handling; password hashing and set-password on first login; blocked users cannot sign in

## What changed
- Added login layout and page (`src/app/login/layout.tsx`, `src/app/login/page.tsx`)
- Added auth server actions (`src/app/actions/auth.ts`) for login, logout, password setting, and session cookies
- Added route guard middleware (`src/middleware.ts`) enforcing authenticated sessions and blocked user guards

## How to test
- Navigate to `/login` and verify login and password setup forms
- Test login with valid, invalid, and blocked user credentials
- Verify session cookies are set and cleared on logout

## Notes
Created retroactively from already-completed work, split out per sprint plan task S1-DEV-03.
