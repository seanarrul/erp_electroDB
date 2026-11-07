## Task
S1-DEV-06 (Sprint 1, Developer): Superadmin: approve pending users and designate admins; block removing or disabling the last remaining superadmin

## What changed
- Added permissions and authorization helpers (`src/lib/permissions.ts`)
- Implemented user approval workflow for pending registrations
- Implemented admin designation logic restricted to superadmin
- Added guard preventing deletion or disabling of the last active superadmin

## How to test
- Review `approveUser` and role designation logic in `src/lib/permissions.ts`
- Verify guard logic ensuring at least one active superadmin account remains intact

## Notes
Created retroactively from already-completed work, split out per sprint plan task S1-DEV-06.
