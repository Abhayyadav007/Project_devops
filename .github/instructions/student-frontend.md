# Student Frontend Dashboard — `apps/frontend-dashboard/student`

## Overview

The Student dashboard is a personal academic portal. Students can view their CGPA, attendance, placement data, chat with Teachers, receive notifications, manage groups, and track their academic progress through rich charts and visualisations.

After sign in via `apps/frontend`, a Student is redirected to `/dashboard/student`.

---

## Authority

| Action                                                                    | Allowed |
| ------------------------------------------------------------------------- | ------- |
| Chat with assigned Teachers                                               | ✅      |
| Receive notifications from Teachers, Admins, Upper Management, Validators | ✅      |
| View own CGPA and academic records                                        | ✅      |
| View own attendance records                                               | ✅      |
| View placement data                                                       | ✅      |
| View mentor details                                                       | ✅      |
| Join / participate in groups                                              | ✅      |
| Create or manage other role accounts                                      | ❌      |
| View other students' data                                                 | ❌      |
| View salary data                                                          | ❌      |

---

## Sidebar Navigation

```
Dashboard (Overview)
├── CGPA
│     └── My Academic Performance
├── Attendance
│     └── My Attendance Records
├── Messages
│     └── Chat with Teachers
├── Notifications
│     └── Received Notifications
├── Groups
│     └── My Groups
├── Placement
│     └── Recent Placement Data
├── Mentor
│     └── My Mentor
├── Profile
│     └── My Profile / Update Password
└── Activity Feed
```

---

## Pages & Features

### Overview `/dashboard/student`

- Welcome card: student name, enrollment ID, semester
- Stats cards:
  - Current CGPA
  - Attendance % (current semester)
  - Unread messages count
  - Unread notifications count
- Quick links: View CGPA, View Attendance, Open Messages
- Recent placement highlights card (latest 3 placement records)
- Mentor card: mentor name, subject, contact button

### CGPA `/dashboard/student/cgpa`

This is the most data-rich page for students.

- **Current CGPA:** large prominent number display with grade label (e.g. A, B+)
- **Semester-wise CGPA table:**
  - Columns: Semester, Subjects, Credits, GPA, Cumulative CGPA
- **CGPA Trend Line Chart:** cumulative CGPA across all completed semesters (recharts `LineChart`)
- **Subject-wise Performance Bar Chart:** marks/grades per subject in current semester
- **Grade Distribution Pie Chart:** distribution of grades across all subjects
- **Credits Summary:** total credits earned vs total required for graduation
- Download academic transcript button (if backend supports PDF generation)

### Attendance `/dashboard/student/attendance`

- **Overall attendance %:** large prominent display, colour-coded (green ≥ 75%, yellow 60–74%, red < 60%)
- **Subject-wise attendance table:**
  - Columns: Subject, Teacher, Total Classes, Present, Absent, Late, Attendance %
  - Row colour coding based on attendance threshold
- **Monthly attendance bar chart:** present vs absent per month
- **Calendar heatmap:** colour-coded attendance per day (green = present, red = absent, grey = holiday/no class)
- **At-risk warning banner:** shown if overall attendance drops below 75%

### Messages `/dashboard/student/messages`

- Left panel: list of Teacher conversations
- Right panel: real-time chat window (WebSocket)
- Students can only chat with their assigned Teachers
- Message timestamps, read receipts
- Search within conversation

### Notifications `/dashboard/student/notifications`

- Received notifications from Teachers, Admins, Upper Management, Validators
- List: title, sender name + role, received at, read/unread
- Click to expand full message
- Mark as read, archive
- Filter by sender role or date

### Groups `/dashboard/student/groups`

- Groups the student belongs to (created by Teachers or Admins)
- Group chat (real-time WebSocket)
- View group members
- Cannot create groups — only join when added by Teacher/Admin

### Placement `/dashboard/student/placement`

- **Recent placement records table:**
  - Columns: Company, Role, Package (LPA), Batch Year, Students Placed, Date
  - Filter by year, domain
- **Placement stats cards:** highest package, average package, total placements this year
- **Package distribution bar chart:** number of students per salary range
- **Domain-wise placement pie chart:** IT, Finance, Core, Management etc.
- **Year-on-year placement trend line chart:** total placements per year
- Personal placement status card: applied, shortlisted, placed (if tracked in backend)

### Mentor `/dashboard/student/mentor`

- Mentor profile card: name, designation, subject/department, email, office hours
- Contact button → opens chat with mentor (if mentor is a Teacher, opens chat in Messages)
- Mentor's recent announcements / notes (if available in backend)
- Schedule meeting button (if scheduling model exists in backend)

### Profile `/dashboard/student/profile`

- View: name, email, enrollment ID, batch, department, semester, join date
- Update password form
- Upload profile photo (if backend supports it)

### Activity Feed `/dashboard/student/activity`

- Real-time WebSocket events relevant to student:
  - New message received
  - New notification received
  - Attendance marked by teacher
  - CGPA updated
- Scoped — students only see their own events

---

## Charts & Data Visualisation

All charts use `recharts` or `chart.js` — use whichever is already in the monorepo.

| Chart                          | Type                  | Location        |
| ------------------------------ | --------------------- | --------------- |
| CGPA trend                     | Line chart            | CGPA page       |
| Subject-wise performance       | Bar chart             | CGPA page       |
| Grade distribution             | Pie / Donut chart     | CGPA page       |
| Monthly attendance             | Bar chart             | Attendance page |
| Attendance calendar heatmap    | Custom grid / heatmap | Attendance page |
| Placement package distribution | Bar chart             | Placement page  |
| Domain-wise placement          | Pie chart             | Placement page  |
| Year-on-year placement trend   | Line chart            | Placement page  |

---

## API Connections

All requests → `NEXT_PUBLIC_API_URL`
WebSocket (chat + notifications + activity) → `NEXT_PUBLIC_WS_URL` with JWT handshake

Verify all endpoint paths against `apps/http-backend` before implementing.

---

## Key Constraints

- Cannot chat with Admins, Upper Management, or Validators
- Cannot view other students' CGPA, attendance, or records
- Cannot view any salary data
- Cannot create or manage any role accounts
- Groups are read/join only — cannot create groups
- All TypeScript strict — no `@ts-ignore`
- No `@repo/db` imports
- Tailwind only
