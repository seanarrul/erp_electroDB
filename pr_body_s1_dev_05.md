## Task
S1-DEV-05 (Sprint 1, Developer): User Management screen: user list, Add User, Edit User, Block/Unblock; Admin manages Users only and Superadmin accounts are hidden

## What changed
- Added User Management routing and views (`src/app/(dashboard)/user-management/page.tsx`, `src/app/(dashboard)/users/page.tsx`)
- Added User Management screen component (`src/components/users/UserManagementView.tsx`)
- Added Add User modal and Edit User modal (`src/components/users/AddUserModal.tsx`, `src/components/users/EditUserModal.tsx`)
- Added RoleBadge component (`src/components/ui/RoleBadge.tsx`)
- Supported block/unblock actions and isolation of superadmin accounts from standard admins

## How to test
- Navigate to `/users` or `/user-management` as an admin or superadmin
- Verify listing, searching, adding, and editing users
- Verify block/unblock user toggle
- Confirm superadmin accounts are hidden from standard admin views

## Notes
Created retroactively from already-completed work, split out per sprint plan task S1-DEV-05.
