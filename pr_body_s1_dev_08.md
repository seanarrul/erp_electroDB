## Task
S1-DEV-08 (Sprint 1, Developer): Main page: sidebar and module tiles by role and rights, plus server-side permission check

## What changed
- Added main dashboard views and layouts (`src/app/(dashboard)/layout.tsx`, `page.tsx`, `dashboard/page.tsx`)
- Added dashboard home view and metric widgets (`src/components/home/*`)
- Added navigation components: Sidebar, Header, Global Search (`src/components/layout/*`)
- Added server-side permission checks enforcing role and per-action rights on module tiles and sidebar links
- Added data fetching and search routines (`src/lib/data/home.ts`, `src/lib/data/search.ts`, `src/app/actions/search.ts`)

## How to test
- Log in with different user roles (superadmin, admin, user)
- Verify module tiles and sidebar navigation accurately reflect assigned permissions
- Verify search functionality and home KPI metric displays

## Notes
Created retroactively from already-completed work, split out per sprint plan task S1-DEV-08.
