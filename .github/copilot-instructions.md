# Copilot Instructions for `hopeinternational`

## MANDATORY — Read Before Every Task

Before writing, editing, or scaffolding any code in this repository, you MUST:

1. Read this entire file first
2. Check the `instructions/` folder for a spec file matching the app you are working on
3. Read that spec file completely before writing a single line of code
4. If the task involves a dashboard role, also read the role-specific instruction file
5. Reference `apps/dashboard-frontend` as the visual and structural reference for all dashboard UIs
6. If no spec file exists for the app you are working on, stop and ask the user for requirements

**Do not proceed with any task until all steps above are complete.**

The instruction files are the source of truth for architecture, conventions, and requirements.
Anything not covered in the instruction files should follow the conventions described in this file.

---

## Instruction Files

**REQUIRED: Always read the relevant file from this table before touching any app or role.**
If a file is marked 🔜, do NOT guess or proceed — stop and ask the user for the spec.

### App-level specs

| App                                              | Instruction File                     | Status                 |
| ------------------------------------------------ | ------------------------------------ | ---------------------- |
| `apps/frontend` (auth + role routing)            | `instructions/frontend.md`           | ✅ Read before editing |
| `apps/validator-frontend` (root + sub-validator) | `instructions/validator-frontend.md` | ✅ Read before editing |
| `apps/frontend-dashboard` (all role dashboards)  | `instructions/frontend-dashboard.md` | ✅ Read before editing |
| `apps/ws-backend` (WebSocket server)             | `instructions/ws-backend.md`         | 🔜 Ask user first      |

### Role-level specs (inside `apps/frontend-dashboard`)

| Role                       | Instruction File                           | Status                 |
| -------------------------- | ------------------------------------------ | ---------------------- |
| Sub-Validator dashboard    | `instructions/sub-validator-frontend.md`   | ✅ Read before editing |
| Upper Management dashboard | `instructions/uppermanagement-frontend.md` | ✅ Read before editing |
| Admin dashboard            | `instructions/admin-frontend.md`           | ✅ Read before editing |
| Teacher dashboard          | `instructions/teacher-frontend.md`         | ✅ Read before editing |
| Student dashboard          | `instructions/student-frontend.md`         | ✅ Read before editing |

---

## Build, Test, and Lint Commands

This repository is a **pnpm workspace** managed by **Turborepo**.

- Install deps (root): `pnpm install`
- Build all workspaces: `pnpm build`
- Type-check all workspaces: `pnpm check-types`
- Lint all workspaces: `pnpm lint`
- Run all dev processes via Turbo: `pnpm dev`

Target a single workspace with `--filter`:

| Workspace                | Dev                                    | Build                                    | Lint                                    |
| ------------------------ | -------------------------------------- | ---------------------------------------- | --------------------------------------- |
| `http-backend`           | `pnpm --filter http-backend dev`       | `pnpm --filter http-backend build`       | —                                       |
| `wsbackend`              | `pnpm --filter wsbackend dev`          | `pnpm --filter wsbackend build`          | —                                       |
| `dashboard-frontend`     | `pnpm --filter dashboard-frontend dev` | —                                        | `pnpm --filter dashboard-frontend lint` |
| `frontend`               | `pnpm --filter frontend dev`           | `pnpm --filter frontend build`           | `pnpm --filter frontend lint`           |
| `validator-frontend`     | `pnpm --filter validator-frontend dev` | `pnpm --filter validator-frontend build` | `pnpm --filter validator-frontend lint` |
| `frontend-dashboard`     | `pnpm --filter frontend-dashboard dev` | `pnpm --filter frontend-dashboard build` | `pnpm --filter frontend-dashboard lint` |
| `ws-backend` _(planned)_ | `pnpm --filter ws-backend dev`         | `pnpm --filter ws-backend build`         | —                                       |
| `@repo/ui`               | —                                      | —                                        | `pnpm --filter @repo/ui lint`           |
| `@repo/ui` (types)       | —                                      | —                                        | `pnpm --filter @repo/ui check-types`    |

Tests:

- There is currently **no real automated test suite** configured in this repo.
- `@repo/db` and `@repo/backendcommon` include placeholder `test` scripts that intentionally exit with error.
- Single-test command: not available yet (no test runner configured).

---

## Port Assignments

Never use a port already assigned to another app in this monorepo.

| App                                                 | Port |
| --------------------------------------------------- | ---- |
| `apps/frontend`                                     | 3000 |
| `apps/dashboard-frontend` _(legacy reference only)_ | 3001 |
| `apps/http-backend`                                 | 3002 |
| `apps/ws-backend` _(planned)_                       | 3003 |
| `apps/validator-frontend`                           | 3004 |
| `apps/frontend-dashboard`                           | 3005 |

---

## High-Level Architecture

### Monorepo layout

```
apps/
  http-backend/          Express REST API — auth, user management, all role routes
  wsbackend/             Legacy WebSocket server (exists, being superseded)
  dashboard-frontend/    Legacy Next.js dashboard — VISUAL REFERENCE ONLY, do not extend
  frontend/              Next.js auth app — sign in / sign up, role-based redirect
  validator-frontend/    Next.js app — root validator + sub-validator interface
  frontend-dashboard/    Next.js app — all role dashboards (sub-validator through student)
  ws-backend/            Dedicated WebSocket server (planned)

packages/
  db/                    Prisma schema + generated client — @repo/db/client
  common/                Shared Zod schemas + WebSocket event types — @repo/common/types
  backendcommon/         Shared backend config (JWT secret) — @repo/backendcommon
  ui/                    Shared UI components — @repo/ui
```

### Role hierarchy

```
Root Validator        (seeded via .env.local — credentials never in source code)
  └── Sub-Validator   (created by Root Validator only)
        └── Upper Management  (created by Validator or Sub-Validator)
              └── Admin       (created by Upper Management or above)
                    ├── Teacher   (created by Admin or above)
                    └── Student   (created by Admin or above)
```

### App responsibilities

| App                       | Responsibility                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `apps/frontend`           | Sign in / sign up screen for all roles. Redirects to correct dashboard after auth.   |
| `apps/validator-frontend` | Exclusive interface for Root Validator and Sub-Validators. Full CRUD over all roles. |
| `apps/frontend-dashboard` | Unified dashboard for Sub-Validator, Upper Management, Admin, Teacher, Student.      |
| `apps/http-backend`       | REST API. All auth, CRUD, notifications, salary, attendance, CGPA endpoints.         |
| `apps/ws-backend`         | Real-time events — chat messages, notifications, activity feed. JWT-authenticated.   |
| `apps/dashboard-frontend` | **Legacy visual reference only.** Do not extend or add features to this app.         |

### Auth & redirect flow

```
User opens apps/frontend
  → Sees Sign In / Sign Up screen
  → Selects role from dropdown, submits credentials
  → apps/frontend calls apps/http-backend auth endpoint
  → On success: JWT stored in localStorage + cookies (auth_token, user_role)
  → Redirect based on role:

      validator         → apps/validator-frontend  (port 3004)
      sub-validator     → apps/frontend-dashboard/dashboard/sub-validator
      upper-management  → apps/frontend-dashboard/dashboard/upper-management
      admin             → apps/frontend-dashboard/dashboard/admin
      teacher           → apps/frontend-dashboard/dashboard/teacher
      student           → apps/frontend-dashboard/dashboard/student
```

### Sign up rules

- **Only the Root Validator can sign up via the public form** — all other role accounts are created internally by the role above them
- The Root Validator account is seeded by the backend on startup from `.env.local` — it is never created through any UI
- Sub-Validators are created inside `apps/validator-frontend` by the Root Validator only
- Upper Management is created by Validator / Sub-Validator
- Admins are created by Upper Management or above
- Teachers and Students are created by Admin or above

### WebSocket flow

```
Client signs in → stores JWT
Client connects to apps/ws-backend with JWT as query param (?token=...)
apps/ws-backend verifies JWT using @repo/backendcommon secret
All event names and payload shapes defined in packages/common/src/types.ts
Frontend components subscribe to typed events — no hardcoded event name strings
```

### Chat permissions

| Role                      | Can chat with                               |
| ------------------------- | ------------------------------------------- |
| Upper Management          | Admins only                                 |
| Admin                     | Upper Management only                       |
| Teacher                   | Students (assigned) + Admins                |
| Student                   | Teachers (assigned) only                    |
| Validator / Sub-Validator | Uses validator-frontend — no direct chat UI |

### Notification permissions

| Sender                         | Can notify                   |
| ------------------------------ | ---------------------------- |
| Root Validator / Sub-Validator | All roles                    |
| Upper Management               | Admin, Teacher, Student      |
| Admin                          | Teacher, Student             |
| Teacher                        | Their assigned Students only |
| Student                        | ❌ Cannot send notifications |

---

## Backend Auth & Data Flow

- All request payloads validated via Zod schemas from `@repo/common/types` using `safeParse`
- Passwords hashed with `bcrypt`
- JWTs issued in route handlers, verified by role-specific middleware in `apps/http-backend/src/middleware.ts`
- Route modules mounted in `apps/http-backend/src/index.ts`:
  - `/validator`
  - `/uppermanagement`
  - `/admin`
  - `/teacher`
  - `/student`
- **Always verify exact endpoint paths and request body field names against `apps/http-backend` source before implementing any API call.** Never assume or guess endpoint shapes.

---

## Prisma Domain Model

- Schema lives at: `packages/db/prisma/schema.prisma`
- Role hierarchy encoded in schema: Validator → UpperManagement → Admin → (Teacher, Student)
- Client constructed in `packages/db/src/index.ts` using `@prisma/adapter-pg` and `DATABASE_URL`
- **Always read `schema.prisma` before writing any Prisma query** — naming is mixed:
  - camelCase fields: `teacherId`, `studentId`, `adminId`
  - Legacy Pascal/mixed fields: `TeacherId` in `Mail`, `CreatedAt`, `UpdatedAt`
  - Do not guess field names — always derive from the schema file

---

## Dashboard Visual Reference — `apps/dashboard-frontend`

`apps/dashboard-frontend` is the **visual and structural reference** for all dashboard UIs.

When building any page in `apps/frontend-dashboard` or `apps/validator-frontend`, reference `apps/dashboard-frontend` for:

- Sidebar layout, width, item grouping, collapse behaviour, active link highlighting
- Topbar: user avatar, role badge, notifications bell, sign out button placement
- Stats card style: icon, label, value, trend indicator
- Data table style: pagination, column headers, action buttons (edit, delete)
- Modal style: create/edit form modal, delete confirmation modal with role name
- Colour palette, border radius, shadow depth, spacing scale
- Chart configuration: which library, chart sizing, colour scheme (match exactly)
- Loading spinners, empty state illustrations, error banners

**Do not copy code verbatim from `apps/dashboard-frontend`.** Build new apps from scratch with the same look and feel. The reference is for design consistency, not code reuse.

---

## Key Conventions

### Shared schema package for all validation

Define and extend all payload schemas in `packages/common/src/types.ts`. Consume in backend routes via `safeParse`. WebSocket event type definitions also live here — both `apps/ws-backend` and all frontend apps import from `@repo/common/types` for event names and payload shapes.

### Role-protected creation hierarchy

Account creation is strictly top-down. No role can create accounts at or above its own level. This is enforced by backend middleware — do not implement any bypass in frontend code.

### Root Validator credential security — non-negotiable

- Credentials exist only in `.env.local` files on the project owner's machine
- `.env.local` is gitignored — never committed under any circumstances
- Source code never contains the actual credential values — only the env var key names
- Root Validator `isRoot: true` flag is set at seed time and is permanently immutable
- No UI in any app renders a delete button for the Root Validator entry
- Backend rejects any delete request targeting the Root Validator ID regardless of what the frontend sends
- Sub-Validators cannot access the validators management page — blocked in middleware and sidebar

### JWT payload convention

Token contains: `role` + a role-specific ID field:

- `validatorId` — Validator / Sub-Validator
- `uppermanagementId` — Upper Management
- `adminId` — Admin
- `teacherId` — Teacher
- `userId` — Student

Frontend middleware reads `user_role` and `auth_token` cookies.
`apps/ws-backend` verifies the full JWT using the secret from `@repo/backendcommon`.

### Import style in backend TypeScript

Backend files use ESM with `.js` extensions in relative imports (NodeNext output compatibility). Apply the same convention to `apps/ws-backend` when building it.

### HTTP client — native fetch only

All frontend apps use native `fetch` with typed wrappers in `lib/api.ts`. Do not introduce Axios, ky, or any other HTTP client without explicit discussion.

### Known port/prefix mismatch

Legacy `apps/dashboard-frontend` uses base URL `http://localhost:3001/api` which does not match the current backend port (`3002`) or route prefixes (no `/api` prefix). Always set `NEXT_PUBLIC_API_URL` correctly in each app's `.env.local`. Do not copy the legacy URL.

### Never import `@repo/db` in any frontend app

Prisma client is strictly backend-only. All frontend apps communicate exclusively via:

- REST API → `apps/http-backend`
- WebSocket → `apps/ws-backend`

### No third-party auth libraries

Do not use Clerk, NextAuth, Auth.js, Passport, or any equivalent. Auth is implemented manually via the JWT flow from `apps/http-backend`.

### TypeScript strict mode everywhere

All apps and packages use strict TypeScript. Zero `@ts-ignore` suppressions. Avoid `any` — if unavoidable, leave an explicit comment explaining why.

### Tailwind CSS only

No inline `style` props, no CSS modules, no styled-components, no Emotion. Use Tailwind utility classes exclusively. Exception: dynamically computed values that cannot be expressed as Tailwind classes (e.g. chart colours) may use inline styles with a comment.

### Next.js App Router only

No Pages Router in any new app. All routing via the App Router with `app/` directory.

### Next.js version caveat

`apps/dashboard-frontend/CLAUDE.md` documents breaking changes in the Next.js version used in this monorepo. Consult `node_modules/next/dist/docs/` and heed all deprecation warnings when editing any Next.js app. Apply the same caution to `apps/frontend`, `apps/validator-frontend`, and `apps/frontend-dashboard`.

---

## Adding a New App — Checklist

When scaffolding any new app, complete every step in order:

1. Place the app under `apps/`
2. Set `"name"` in `package.json` to `@repo/<app-name>`
3. Extend `@repo/typescript-config` in `tsconfig.json`
4. Add scripts: `dev`, `build`, `lint`, `type-check`
5. Assign a port that does not conflict with the Port Assignments table
6. Confirm the app is covered by the `apps/*` wildcard in `pnpm-workspace.yaml`
7. Add `dev` and `build` entries to the `turbo.json` pipeline
8. Create `instructions/<app-name>.md` with the full spec **before writing any code**
9. Register the instruction file in the App-level specs table above with ✅ status
10. Add the app to the Monorepo layout and Port Assignments sections above
11. Add `--filter` dev/build/lint commands to the Build commands table above

## Adding a New Instruction File — Checklist

When a new role or planned app gets a spec:

1. Create `instructions/<name>.md` with the complete spec
2. Register it in the correct table above with ✅ status
3. Update the architecture sections if it introduces a new app or role
4. Add port and filter command entries if it introduces a new app

# Development Guidelines

- Use 21st.dev MCP for all development tasks
- Follow RESTful API standards
- Include proper error handling
- Write TypeScript with strict mode
