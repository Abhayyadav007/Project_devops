# Sub-Validator Frontend App — `apps/frontend-dashboard/sub-validator`

## Overview

The Sub-Validator dashboard is a scoped version of the root Validator interface. Sub-Validators have full CRUD authority over Upper Management, Admins, Teachers, and Students — but cannot manage other Validators or access Validator-level settings.

This dashboard lives inside `apps/frontend-dashboard` as a role-specific section, not a separate Next.js app. After sign in via `apps/frontend`, a sub-validator is redirected to `/dashboard/sub-validator`.

---

## Authority

| Action                                    | Allowed |
| ----------------------------------------- | ------- |
| Create / Update / Delete Upper Management | ✅      |
| Create / Update / Delete Admin            | ✅      |
| Create / Update / Delete Teacher          | ✅      |
| Create / Update / Delete Student          | ✅      |
| View salary overviews for all roles       | ✅      |
| Send notifications to any role            | ✅      |
| Manage other Validators                   | ❌      |
| Delete Root Validator                     | ❌      |

---

## Sidebar Navigation

Reference `apps/dashboard-frontend` for sidebar style and structure.

```
Dashboard (Overview)
├── Upper Management
│     ├── All Upper Management
│     ├── Create New
│     └── Salary Overview
├── Admins
│     ├── All Admins
│     ├── Create New
│     └── Salary Overview
├── Teachers
│     ├── All Teachers
│     ├── Create New
│     └── Salary Overview
├── Students
│     ├── All Students
│     └── Create New
├── Notifications
│     └── Send Notification (broadcast to any role)
├── Groups
│     └── Manage Groups
├── Salary Slips
│     └── Generate / View Salary Slips (all roles)
└── Activity Feed (real-time via WebSocket)
```

---

## Pages & Features

### Overview `/dashboard/sub-validator`

- Total counts: Upper Management, Admins, Teachers, Students
- Recent activity cards
- Quick action buttons: Create Upper Management, Create Admin, Create Teacher, Create Student

### Upper Management `/dashboard/sub-validator/uppermanagement`

- Paginated table: name, email, created date, status, actions (edit, delete)
- Create modal: Full Name, Email, Password
- Edit modal: Full Name, Email, Password (optional)
- Delete confirmation modal
- Salary Overview tab: table of salary records, total disbursed, filters by month/year

### Admins `/dashboard/sub-validator/admins`

- Same pattern as Upper Management above
- Salary Overview included

### Teachers `/dashboard/sub-validator/teachers`

- Same pattern
- Salary Overview included

### Students `/dashboard/sub-validator/students`

- Paginated table: name, email, CGPA, attendance %, enrollment date, actions
- Create modal: Full Name, Email, Password, enrollment details
- Edit and Delete with confirmation
- No salary section for students

### Notifications `/dashboard/sub-validator/notifications`

- Compose notification: Title, Body, Target Role (dropdown: All, Upper Management, Admin, Teacher, Student), Send button
- Sent notifications history table: title, target, sent at, status

### Groups `/dashboard/sub-validator/groups`

- List of all groups across the platform
- Create group: name, members (multi-select by role), description
- View group members, delete group

### Salary Slips `/dashboard/sub-validator/salary-slips`

- Filter by role, month, year
- Table: employee name, role, month, amount, status (paid/pending)
- Generate slip button
- Download slip as PDF

### Activity Feed `/dashboard/sub-validator/activity`

- Real-time WebSocket feed
- Events: account created, updated, deleted, sign in, sign out, notification sent
- Filter by role or event type

---

## API Connections

All requests → `NEXT_PUBLIC_API_URL`
WebSocket → `NEXT_PUBLIC_WS_URL` with JWT handshake

Verify all endpoint paths against `apps/http-backend` before implementing.

---

## Key Constraints

- No access to `/dashboard/validators` — middleware blocks it
- Cannot delete root Validator — button never renders, backend rejects
- All TypeScript strict — no `@ts-ignore`
- No `@repo/db` imports
- Tailwind only
