# Sprint 1 Board

## Sprint Goal

Establish the system foundation, authentication, user management, and role-based access control for ElectronDB ERP.

---

# Sprint Roadmap

| Sprint | Modules |
|----------|----------|
| Sprint 1 | Authentication, User Management, Rights Management |
| Sprint 2 | Customer Management, Product Management, Price History |
| Sprint 3 | Human Resources |
| Sprint 4 | Sales and Reports |

---

# Sprint 1 User Stories

## User Registration

### Story
As a new user, I want to register an account so that I can request access to the system.

### Acceptance Criteria
- User can complete registration form.
- New accounts start as Pending.
- Registration data is stored in the database.
- Validation messages appear for invalid inputs.

---

## Login and Logout

### Story
As a user, I want to securely log in and log out of the system.

### Acceptance Criteria
- User can log in with valid credentials.
- Invalid login attempts are rejected.
- Blocked users cannot log in.
- User can log out successfully.

---

## Password Management

### Story
As a user, I want to set and reset my password securely.

### Acceptance Criteria
- User can create an initial password.
- User can request password reset.
- Expired reset tokens are rejected.
- Used reset tokens cannot be reused.

---

## User Management

### Story
As an administrator, I want to manage user accounts.

### Acceptance Criteria
- Add user.
- Edit user.
- Block and unblock user.
- Approve pending users.
- Admin cannot manage Superadmin accounts.

---

## Rights Management

### Story
As an administrator, I want to assign permissions to users.

### Acceptance Criteria
- Rights can be assigned per module.
- Rights changes are logged.
- All/None permission options available.
- Changes take effect immediately.

---

# Definition of Ready

- User story documented.
- Acceptance criteria defined.
- Dependencies identified.

---

# Definition of Done

- Feature implemented.
- Code reviewed.
- Tests passed.
- Documentation updated.
- Pull Request merged.

---

# Sprint Deliverables

- Authentication Module
- User Management Module
- Rights Management Module
- Dashboard and Navigation
