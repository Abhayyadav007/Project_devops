# Validator Frontend App — `apps/validator-frontend`

## MANDATORY — Read Before Starting

Before writing a single line of code you MUST:

1. Read `instructions/frontend.md` for shared monorepo conventions
2. Read `apps/http-backend/src/index.ts` for all mounted route prefixes
3. Read `packages/db/prisma/schema.prisma` for the exact Validator and role models
4. Read `packages/common/src/types.ts` for existing Zod schemas
5. Read `apps/ws-backend` source (once built) for WebSocket event names and payload shapes

Do not guess any API contract. Always derive it from the source files above.

---

## Overview

`apps/validator-frontend` is the **most privileged interface** in the entire platform. It is the exclusive entry point for the root Validator and any sub-validators they appoint.

Key responsibilities:

- The **only** signup in the entire system — no other role can self-register
- Full CRUD over every role: Upper Management, Admin, Teacher, Student, and sub-Validators
- Sub-validator management with scoped restrictions
- Real-time awareness via WebSocket for all role activity

---

## Location & Monorepo Integration

- App lives at: `apps/validator-frontend`
- Package name in `package.json`: `@repo/validator-frontend`
- Picked up by `apps/*` wildcard in `pnpm-workspace.yaml`
- Add to `turbo.json` pipeline under `build`, `dev`, `lint`, `type-check`
- Reuse shared packages:
  - `@repo/typescript-config` — TypeScript config
  - `@repo/common` — shared Zod types
  - `@repo/ui` — shared UI components (if present)
  - ❌ Never import `@repo/db` — backend only

---

## Tech Stack

| Concern          | Choice                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| Framework        | Next.js (App Router)                                                     |
| Language         | TypeScript (strict mode)                                                 |
| Styling          | Tailwind CSS                                                             |
| Package Manager  | pnpm                                                                     |
| HTTP Client      | Native `fetch` with typed wrappers                                       |
| WebSocket Client | Native `WebSocket` API with typed event wrappers                         |
| Auth Storage     | `localStorage` (JWT) + cookie (`auth_token`, `user_role`) for middleware |
| Env Variables    | See Environment Variables section below                                  |

---

## Authentication — Root Validator Login

### Critical Security Rule

The root Validator account credentials are **hardcoded exclusively in a `.env.local` file** that is:

- Listed in `.gitignore` — never committed to the repository
- Never referenced in any source file as a plain string
- Never logged, printed, or exposed in any API response
- Known only to the project owner

### How it works

The root Validator's `userId` and `password` live only in:

```
apps/validator-frontend/.env.local        ← your machine only, never committed
apps/http-backend/.env.local              ← your machine only, never committed
```

In `apps/http-backend/.env.local`:

```env
ROOT_VALIDATOR_ID=<choose_a_uuid_only_you_know>
ROOT_VALIDATOR_PASSWORD_HASH=<bcrypt_hash_of_your_password>
```

In `apps/validator-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3003
```

The `ROOT_VALIDATOR_ID` and `ROOT_VALIDATOR_PASSWORD_HASH` are loaded by the backend at startup and seeded into the database only if a Validator with that ID does not already exist. This seed runs once. No developer looking at the source code will ever see the actual credentials — they only exist in your local `.env.local` files.

### Generating the hash (run this once yourself, share with no one)

```bash
node -e "const b = require('bcrypt'); b.hash('YOUR_PASSWORD_HERE', 10).then(console.log)"
```

Paste the output into `ROOT_VALIDATOR_PASSWORD_HASH` in your backend `.env.local`.

### `.gitignore` rules to enforce (add to repo root `.gitignore`)

```
.env.local
.env*.local
*.env.local
```

---

## First Screen Behavior

The root URL `/` renders a **Sign In only** screen. There is no Sign Up option anywhere in this app — the root Validator account already exists via the seed, and sub-validators are created from within the dashboard, never from a public form.

The sign in screen:

- Has a single clean centered card
- Fields: `User ID` and `Password`
- No role dropdown — this app is Validator-only
- Submit button labeled **Sign In**
- Shows inline error on wrong credentials
- Shows loading state during the API call

After successful sign in, read the role and `isRootValidator` flag from the JWT response and redirect to `/dashboard`.

---

## Role Definitions & Hierarchy

```
Root Validator  (seeded, credentials in .env.local only)
    └── Sub-Validator(s)  (created by Root Validator)
            └── Upper Management
                    └── Admin
                            ├── Teacher
                            └── Student
```

All Validator accounts (root + sub) land on the same `/dashboard` after sign in.

---

## Dashboard — Pages & Routes

```
/                         Sign In screen
/dashboard                Overview / stats
/dashboard/validators     Sub-validator management (root only)
/dashboard/uppermanagement  Upper Management CRUD
/dashboard/admins         Admin CRUD
/dashboard/teachers       Teacher CRUD
/dashboard/students       Student CRUD
/dashboard/activity       Real-time activity feed (WebSocket)
```

---

## Middleware — `middleware.ts`

Place at the root of `apps/validator-frontend` next to `app/`.

### Rules

1. Unauthenticated users hitting any `/dashboard/*` → redirect to `/`
2. Authenticated validator hitting `/` → redirect to `/dashboard`
3. Sub-validators hitting `/dashboard/validators` → redirect to `/dashboard` with an `unauthorized=true` query param — only the root validator can manage sub-validators
4. Any non-validator role token hitting this app → redirect to `/` and clear cookies

```ts
// middleware.ts pattern
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const role = request.cookies.get("user_role")?.value;
  const isRoot = request.cookies.get("is_root_validator")?.value === "true";
  const path = request.nextUrl.pathname;

  const isDashboard = path.startsWith("/dashboard");
  const isRoot_path = path === "/dashboard/validators";
  const isSignIn = path === "/";

  // Block non-validators entirely
  if (token && role !== "validator") {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.delete("auth_token");
    res.cookies.delete("user_role");
    res.cookies.delete("is_root_validator");
    return res;
  }

  // Unauthenticated → sign in
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Already signed in → dashboard
  if (isSignIn && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Sub-validator trying to access root-only page
  if (isRoot_path && !isRoot) {
    return NextResponse.redirect(
      new URL("/dashboard?unauthorized=true", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
```

---

## Feature Specifications

### 1. Sign In

- `POST` to `NEXT_PUBLIC_API_URL/validator/signin` (verify exact path in `apps/http-backend`)
- On success: store JWT in `localStorage` as `auth_token`, set cookies `auth_token`, `user_role=validator`, `is_root_validator=true/false`
- On failure: show inline error message, never expose backend error details to UI

---

### 2. Sub-Validator Management — `/dashboard/validators`

**Visible and accessible only to the root Validator.**

#### Create Sub-Validator

- Fields: Full Name, Email, Password
- `POST` to `NEXT_PUBLIC_API_URL/validator/create-sub-validator`
- Sub-validators are stored with a flag `isRoot: false` in the database
- Root validator has `isRoot: true` — this flag is set at seed time and is immutable

#### List Sub-Validators

- `GET` to `NEXT_PUBLIC_API_URL/validator/sub-validators`
- Display: name, email, created date, status (active/inactive)

#### Update Sub-Validator

- Fields: Full Name, Email, Password (optional)
- `PATCH` to `NEXT_PUBLIC_API_URL/validator/sub-validators/:id`

#### Delete Sub-Validator

- `DELETE` to `NEXT_PUBLIC_API_URL/validator/sub-validators/:id`
- **Hard rule enforced on both frontend and backend:** the root Validator's ID cannot be passed to this endpoint. The delete button must never render next to the root Validator entry. The backend must also reject any delete request targeting the root Validator ID.
- Show a confirmation modal before deleting

---

### 3. Upper Management CRUD — `/dashboard/uppermanagement`

Both root and sub-validators can perform all operations.

#### Create

- Fields: Full Name, Email, Password
- `POST` to `NEXT_PUBLIC_API_URL/uppermanagement/create` (verify exact path in backend)

#### List

- `GET` to `NEXT_PUBLIC_API_URL/uppermanagement/all`
- Table with: name, email, created date, actions (edit, delete)

#### Update

- Fields: Full Name, Email, Password (optional)
- `PATCH` to `NEXT_PUBLIC_API_URL/uppermanagement/:id`

#### Delete

- `DELETE` to `NEXT_PUBLIC_API_URL/uppermanagement/:id`
- Confirmation modal before deleting

---

### 4. Admin CRUD — `/dashboard/admins`

Same pattern as Upper Management.

- Create: `POST` to `NEXT_PUBLIC_API_URL/admin/create`
- List: `GET` to `NEXT_PUBLIC_API_URL/admin/all`
- Update: `PATCH` to `NEXT_PUBLIC_API_URL/admin/:id`
- Delete: `DELETE` to `NEXT_PUBLIC_API_URL/admin/:id`

---

### 5. Teacher CRUD — `/dashboard/teachers`

Same pattern.

- Create: `POST` to `NEXT_PUBLIC_API_URL/teacher/create`
- List: `GET` to `NEXT_PUBLIC_API_URL/teacher/all`
- Update: `PATCH` to `NEXT_PUBLIC_API_URL/teacher/:id`
- Delete: `DELETE` to `NEXT_PUBLIC_API_URL/teacher/:id`

---

### 6. Student CRUD — `/dashboard/students`

Same pattern.

- Create: `POST` to `NEXT_PUBLIC_API_URL/student/create`
- List: `GET` to `NEXT_PUBLIC_API_URL/student/all`
- Update: `PATCH` to `NEXT_PUBLIC_API_URL/student/:id`
- Delete: `DELETE` to `NEXT_PUBLIC_API_URL/student/:id`

> **Note:** Always verify exact endpoint paths and request body field names against `apps/http-backend` before implementing. The paths listed above are best-guess based on the existing route structure — treat them as placeholders, not gospel.

---

### 7. Real-Time Activity Feed — `/dashboard/activity`

Connect to `NEXT_PUBLIC_WS_URL` after sign in using the JWT as a handshake token.

```ts
// Pattern — adapt to actual ws-backend event names
const socket = new WebSocket(
  `${process.env.NEXT_PUBLIC_WS_URL}?token=${localStorage.getItem("auth_token")}`,
);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle typed events — define types in @repo/common
};
```

Display a live feed of:

- New role accounts created
- Role updates
- Deletions
- Sign in / sign out events (if ws-backend emits them)

> **Note:** WebSocket event names and payload shapes must be defined in `packages/common/src/types.ts` and must match what `apps/ws-backend` emits. Do not hardcode event name strings in this app.

---

## Shared Dashboard Layout

All `/dashboard/*` pages share a common layout with:

- **Sidebar navigation** with links to all sections
  - Overview
  - Sub-Validators _(root only — hide this item for sub-validators)_
  - Upper Management
  - Admins
  - Teachers
  - Students
  - Activity Feed
- **Top bar** showing: logged-in user name, role badge (`Root Validator` or `Sub-Validator`), Sign Out button
- **Sign Out** clears `localStorage`, deletes cookies (`auth_token`, `user_role`, `is_root_validator`), redirects to `/`

---

## Folder Structure

```
apps/validator-frontend/
  app/
    layout.tsx
    page.tsx                          ← Sign In screen
    dashboard/
      layout.tsx                      ← Shared sidebar + topbar
      page.tsx                        ← Overview / stats
      validators/
        page.tsx                      ← Sub-validator management (root only)
      uppermanagement/
        page.tsx
      admins/
        page.tsx
      teachers/
        page.tsx
      students/
        page.tsx
      activity/
        page.tsx                      ← WebSocket activity feed
  components/
    auth/
      SignInForm.tsx
    layout/
      Sidebar.tsx
      Topbar.tsx
    roles/
      RoleTable.tsx                   ← Reusable CRUD table for all roles
      CreateRoleModal.tsx
      EditRoleModal.tsx
      DeleteConfirmModal.tsx
    validators/
      SubValidatorTable.tsx
      CreateSubValidatorModal.tsx
    activity/
      ActivityFeed.tsx
      ActivityItem.tsx
  lib/
    api.ts                            ← Typed fetch wrappers for all endpoints
    ws.ts                             ← WebSocket connection + typed event handler
    auth.ts                           ← Token/cookie helpers (set, get, clear)
    constants.ts                      ← API base URL, WS URL, role list
  middleware.ts
  .env.local                          ← NEVER commit — your eyes only
  .env.example                        ← Committed — keys only, no values
  next.config.ts
  tsconfig.json                       ← extends @repo/typescript-config/nextjs.json
  tailwind.config.ts
  package.json
```

---

## Environment Variables

`apps/validator-frontend/.env.local` — **never committed**:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3003
```

`apps/validator-frontend/.env.example` — **committed, no real values**:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
```

`apps/http-backend/.env.local` — **never committed**, root validator seed:

```env
ROOT_VALIDATOR_ID=
ROOT_VALIDATOR_PASSWORD_HASH=
DATABASE_URL=
JWT_SECRET=
```

---

## `package.json`

```json
{
  "name": "@repo/validator-frontend",
  "scripts": {
    "dev": "next dev --port 3004",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Security Rules — Non-Negotiable

These must be enforced on **both** frontend and backend. The frontend is a convenience guard; the backend is the real enforcement.

1. **Root Validator credentials never appear in source code** — only in `.env.local` files that are gitignored
2. **Root Validator cannot be deleted** — no delete button renders for root, backend rejects the request regardless
3. **Root Validator `isRoot` flag is immutable** — no UI or API call can change it after seeding
4. **Sub-validators cannot promote themselves** — no endpoint or UI exposes an `isRoot` toggle
5. **Sub-validators cannot access `/dashboard/validators`** — blocked in middleware and the sidebar link is hidden
6. **JWT must be verified on every protected API call** — never trust role from the frontend alone
7. **Credentials must never be logged** — no `console.log`, no error messages that echo passwords or IDs
8. **`.env.local` files must be in `.gitignore`** — verify this before first commit

---

## Key Constraints

- App Router only — no Pages Router
- No third-party auth library (Clerk, NextAuth, etc.) — JWT flow via `apps/http-backend` only
- No `@repo/db` imports in this app
- All TypeScript errors must be resolved — no `@ts-ignore`
- All API paths must be verified against `apps/http-backend` source — do not assume
- All WebSocket event names must be verified against `apps/ws-backend` source and defined in `packages/common`
- Tailwind classes only — no inline `style` props unless absolutely necessary
- Port for this app: `3004` — does not conflict with `frontend` (3000), `http-backend` (3002), `ws-backend` (3003)
