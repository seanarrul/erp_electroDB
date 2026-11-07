## Task
S1-DEV-07 (Sprint 1, Developer): Rights dialog: admin/superadmin assign per-action rights by module (Customer, Product, Human Resources, Sales, Reports) with module checkbox and All/None; log every rights change in audit_log

## What changed
- Added Rights modal component (`src/components/users/RightsModal.tsx`)
- Supported assigning per-action rights across Customer, Product, Human Resources, Sales, and Reports
- Added module-level select/deselect and global All/None controls
- Integrated audit logging for every assigned permission change

## How to test
- Open Rights modal for a user in the User Management screen
- Toggle per-action checkboxes or use module bulk check/uncheck
- Save changes and verify audit logs capture the update

## Notes
Created retroactively from already-completed work, split out per sprint plan task S1-DEV-07.
