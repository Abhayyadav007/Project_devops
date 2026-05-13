# Admin Frontend Dashboard — `apps/frontend-dashboard/admin`

## Overview

The Admin dashboard provides full CRUD authority over Teachers and Students. Admins can chat with Upper Management, send notifications to Teachers and Students, manage groups, view salary data, and monitor department-level statistics.

After sign in via `apps/frontend`, an Admin is redirected to `/dashboard/admin`.

---

## Authority

| Action                                                     | Allowed |
| ---------------------------------------------------------- | ------- |
| Create / Update / Delete Teacher                           | ✅      |
| Create / Update / Delete Student                           | ✅      |
| Chat with Upper Management                                 | ✅      |
| Send notifications to Teachers and Students                | ✅      |
| Receive notifications from Upper Management and Validators | ✅      |
| View own salary slip                                       | ✅      |
| View Teacher salary overview                               | ✅      |
| Manage Upper Management or other Admins                    | ❌      |

---

## Sidebar Navigation

```
Dashboard (Overview)
├── Teachers
│     ├── All Teachers
│     ├── Create New
│     └── Salary Overview
├── Students
│     ├── All Students
│     └── Create New
├── Messages
│     └── Chat with Upper Management
├── Notifications
│     ├── Send Notification (to Teachers / Students)
│     └── Received Notifications (from Upper Management / Validators)
├── Groups
│     └── My Groups / Manage Groups
├── Salary Slips
│     └── My Salary Slips
├── Salary Overview
│     └── Teacher Salary Summary
└── Activity Feed
```

---

## Pages & Features

### Overview `/dashboard/admin`

- Stats cards: total Teachers, total Students
- Recent activity
- Pending notifications badge
- Quick actions: Create Teacher, Create Student, Send Notification

### Teachers `/dashboard/admin/teachers`

- Paginated table: name, email, subjects, created date, status, actions (edit, delete)
- Create modal: Full Name, Email, Password, Subject(s)
- Edit modal: Full Name, Email, Password (optional), Subject(s)
- Delete confirmation modal
- Salary Overview tab:
  - Table: teacher name, month, amount, status (paid/pending)
  - Filter by month/year
  - Total disbursed summary card
  - Bar chart: monthly teacher salary disbursement

### Students `/dashboard/admin/students`

- Paginated table: name, email, CGPA, attendance %, enrollment date, actions
- Create modal: Full Name, Email, Password, enrollment details
- Edit, Delete with confirmation
- View student profile: CGPA chart, attendance chart (read-only for admin)

### Messages `/dashboard/admin/messages`

- Left panel: list of Upper Management contacts
- Right panel: real-time chat window (WebSocket)
- Admin can only chat with Upper Management — not with Teachers or Students directly
- Message timestamps, read receipts
- Search messages

### Notifications `/dashboard/admin/notifications`

#### Send Notification

- Compose: Title, Body, Target (Teacher / Student / All Teachers / All Students / Specific person)
- Sent history table

#### Received Notifications

- From Upper Management and Validators
- Mark as read, archive, filter by sender role

### Groups `/dashboard/admin/groups`

- Groups Admin belongs to
- Create group: name, description, add members (Teachers, Students)
- Group chat (real-time WebSocket)
- Leave / delete group (if owner)

### Salary Slips `/dashboard/admin/salary-slips`

- My salary slips: filter by month/year
- Table: month, amount, status, download PDF button

### Salary Overview `/dashboard/admin/salary-overview`

- Teacher salary summary
- Table: teacher name, month, amount, status
- Bar chart: monthly totals
- Filter by month/year

### Activity Feed `/dashboard/admin/activity`

- Real-time WebSocket events scoped to Admin's department
- Events: teacher/student changes, notification events, group activity
- Filter by type

---

## Charts & Data Visualisation

- **Teacher Salary Overview:** bar chart — monthly disbursement totals
- **Student Stats (read-only):** CGPA distribution chart, attendance overview
- **Headcount:** card counters — Teachers vs Students

---

## API Connections

All requests → `NEXT_PUBLIC_API_URL`
WebSocket (chat + notifications + activity) → `NEXT_PUBLIC_WS_URL` with JWT handshake

Verify all endpoint paths against `apps/http-backend` before implementing.

---

## Key Constraints

- Cannot access Validator, Sub-Validator, or Upper Management pages
- Cannot chat with Teachers or Students — only Upper Management
- Cannot view Upper Management or Validator salary data
- All TypeScript strict — no `@ts-ignore`
- No `@repo/db` imports
- Tailwind only
