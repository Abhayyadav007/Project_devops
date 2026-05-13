# Upper Management Frontend Dashboard — `apps/frontend-dashboard/upper-management`

## Overview

The Upper Management dashboard provides full CRUD authority over Admins, Teachers, and Students. Upper Management can send notifications to Admins and Teachers, chat with Admins, view salary records, and monitor institution-wide statistics.

After sign in via `apps/frontend`, an Upper Management user is redirected to `/dashboard/upper-management`.

---

## Authority

| Action                                        | Allowed |
| --------------------------------------------- | ------- |
| Create / Update / Delete Admin                | ✅      |
| Create / Update / Delete Teacher              | ✅      |
| Create / Update / Delete Student              | ✅      |
| Send notifications to Admin, Teacher, Student | ✅      |
| Chat with Admins                              | ✅      |
| View own salary slip                          | ✅      |
| View Admin / Teacher salary overviews         | ✅      |
| Manage Validators or other Upper Management   | ❌      |

---

## Sidebar Navigation

```
Dashboard (Overview)
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
├── Messages
│     └── Chat with Admins
├── Notifications
│     ├── Send Notification
│     └── Received Notifications (from Validators)
├── Groups
│     └── My Groups / Manage Groups
├── Salary Slips
│     └── My Salary Slips
├── Salary Overview
│     └── Admin & Teacher Salary Summary
└── Activity Feed
```

---

## Pages & Features

### Overview `/dashboard/upper-management`

- Institution stats: total Admins, Teachers, Students
- Recent activity cards
- Pending notifications badge
- Quick actions: Create Admin, Send Notification

### Admins `/dashboard/upper-management/admins`

- Paginated table: name, email, created date, status, actions (edit, delete)
- Create modal: Full Name, Email, Password
- Edit modal: Full Name, Email, Password (optional)
- Delete confirmation modal
- Salary Overview tab:
  - Table: admin name, month, amount, status (paid/pending)
  - Filter by month/year
  - Total disbursed summary card

### Teachers `/dashboard/upper-management/teachers`

- Same CRUD pattern as Admins
- Salary Overview tab included
- View teacher's assigned classes/subjects (read-only)

### Students `/dashboard/upper-management/students`

- Paginated table: name, email, CGPA, attendance %, enrollment date
- Create, Edit, Delete with confirmation
- No salary section

### Messages `/dashboard/upper-management/messages`

- Left panel: list of Admin conversations
- Right panel: chat window (real-time via WebSocket)
- Send text messages
- Message timestamps, read receipts
- Upper Management can only chat with Admins — no direct chat with Teachers or Students

### Notifications `/dashboard/upper-management/notifications`

#### Send Notification

- Compose form: Title, Body, Target Role (Admin / Teacher / Student / All), Send button
- Sent history: title, target role, sent at, status

#### Received Notifications

- Notifications received from Validators / Root Validator
- Mark as read, archive

### Groups `/dashboard/upper-management/groups`

- List groups Upper Management belongs to
- Create new group: name, description, add members (Admins only)
- View group chat (real-time via WebSocket)
- Leave / delete group

### Salary Slips `/dashboard/upper-management/salary-slips`

- My salary slips: filter by month/year
- Table: month, amount, status (paid/pending), download button
- Download as PDF

### Salary Overview `/dashboard/upper-management/salary-overview`

- Tabs: Admins | Teachers
- Table per tab: employee name, month, amount, status
- Bar chart: monthly salary disbursement (use recharts or chart.js)
- Filter by month/year

### Activity Feed `/dashboard/upper-management/activity`

- Real-time WebSocket feed scoped to their institution
- Events: admin/teacher/student account changes, notification events
- Filter by role or event type

---

## Charts & Data Visualisation

Use `recharts` or `chart.js` (already available in the monorepo if used in `dashboard-frontend`):

- **Salary Overview:** bar chart — monthly totals per role
- **Student Stats:** line chart — CGPA trend, attendance over semesters (read-only view)
- **Headcount:** pie/donut chart — Admin vs Teacher vs Student counts

---

## API Connections

All requests → `NEXT_PUBLIC_API_URL`
WebSocket (chat + notifications + activity) → `NEXT_PUBLIC_WS_URL` with JWT handshake

Verify all endpoint paths against `apps/http-backend` before implementing.

---

## Key Constraints

- Cannot access Validator or sub-Validator pages — middleware blocks it
- Cannot chat with Teachers or Students directly — only Admins
- Cannot view Validator salary data
- All TypeScript strict — no `@ts-ignore`
- No `@repo/db` imports
- Tailwind only
