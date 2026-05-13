# Teacher Frontend Dashboard — `apps/frontend-dashboard/teacher`

## Overview

The Teacher dashboard is a personal workspace for managing classes, communicating with students, chatting with Admins, receiving notifications from Upper Management and Validators, and tracking salary and personal records.

After sign in via `apps/frontend`, a Teacher is redirected to `/dashboard/teacher`.

---

## Authority

| Action                                                     | Allowed |
| ---------------------------------------------------------- | ------- |
| Chat with Students                                         | ✅      |
| Chat with Admins                                           | ✅      |
| Receive notifications from Upper Management and Validators | ✅      |
| View own salary slips                                      | ✅      |
| View and manage assigned classes / subjects                | ✅      |
| View student attendance and CGPA (for their classes only)  | ✅      |
| Mark student attendance                                    | ✅      |
| Create / Delete other roles                                | ❌      |
| View other teachers' data                                  | ❌      |

---

## Sidebar Navigation

```
Dashboard (Overview)
├── My Classes
│     ├── Class List
│     └── Student Roster per Class
├── Attendance
│     └── Mark / View Attendance
├── Students
│     └── My Students (assigned classes only)
├── Messages
│     ├── Chat with Students
│     └── Chat with Admins
├── Notifications
│     └── Received (from Upper Management / Validators)
├── Groups
│     └── My Groups
├── Salary Slips
│     └── My Salary Slips
├── Profile
│     └── My Profile / Update Password
└── Activity Feed
```

---

## Pages & Features

### Overview `/dashboard/teacher`

- Welcome card: teacher name, assigned subjects/classes
- Stats cards: total assigned students, classes today, pending attendance
- Unread messages badge
- Unread notifications badge
- Upcoming schedule (if schedule model exists in backend)

### My Classes `/dashboard/teacher/classes`

- List of assigned classes/subjects
- Click a class → view enrolled students: name, email, CGPA, attendance %
- Class details: subject name, schedule, room (if available in schema)

### Attendance `/dashboard/teacher/attendance`

- Select class → date → mark each student Present / Absent / Late
- Submit attendance (POST to backend)
- View past attendance records per class
- Attendance summary chart per class: present % over time (line chart)

### Students `/dashboard/teacher/students`

- View students assigned to teacher's classes only
- Student profile card: name, CGPA, attendance %, enrolled courses
- CGPA trend line chart per student (read-only)
- Cannot edit student records — read only

### Messages `/dashboard/teacher/messages`

- Tabbed interface: **Students** | **Admins**
- Left panel: conversation list filtered by selected tab
- Right panel: real-time chat (WebSocket)
- Send text messages, timestamps, read receipts
- Teachers can chat with their assigned Students and with Admins
- Cannot chat with Upper Management or Validators directly

### Notifications `/dashboard/teacher/notifications`

- Received notifications from Upper Management and Validators
- List: title, sender role, received at, read/unread status
- Click to expand full message
- Mark as read, archive
- Filter by sender role or date

### Groups `/dashboard/teacher/groups`

- Groups the teacher belongs to
- Create group with students or other teachers (if allowed by backend)
- Group chat (real-time WebSocket)
- Leave group

### Salary Slips `/dashboard/teacher/salary-slips`

- My salary slips: filter by month/year
- Table: month, gross amount, deductions, net amount, status (paid/pending)
- Download slip as PDF
- Salary trend line chart: net salary over last 12 months

### Profile `/dashboard/teacher/profile`

- View: name, email, employee ID, subjects, join date
- Update password form
- Upload profile photo (if backend supports it)

### Activity Feed `/dashboard/teacher/activity`

- Real-time WebSocket events relevant to teacher:
  - New notification received
  - New message received
  - Attendance submission confirmation
- Scoped — teachers only see their own events

---

## Charts & Data Visualisation

- **Attendance per class:** line chart — present % over time per class
- **Student CGPA:** line chart — per student CGPA over semesters (read-only view)
- **Salary trend:** line chart — net salary over last 12 months
- **Class attendance summary:** bar chart — present vs absent vs late per class

---

## API Connections

All requests → `NEXT_PUBLIC_API_URL`
WebSocket (chat + notifications + activity) → `NEXT_PUBLIC_WS_URL` with JWT handshake

Verify all endpoint paths against `apps/http-backend` before implementing.

---

## Key Constraints

- Cannot chat with Upper Management or Validators
- Cannot view or edit other teachers' data
- Cannot view students outside their assigned classes
- Cannot create, update, or delete any role accounts
- All TypeScript strict — no `@ts-ignore`
- No `@repo/db` imports
- Tailwind only
