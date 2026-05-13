# Frontend App — `apps/frontend`

## Overview

This document describes the requirements, architecture, and implementation instructions for the `frontend` Next.js application located at `apps/frontend` inside the Turborepo monorepo. This app is the primary user-facing interface for the school management platform. It handles authentication and role-based routing for all five user roles.

Reference `apps/http-backend` for all API endpoint paths, request/response shapes, role definitions, and auth logic. Do not guess or hardcode anything that differs from the backend.

---

## Location & Monorepo Integration

- App lives at: `apps/frontend`
- Package name in `package.json`: `@repo/frontend`
- Must be included in `pnpm-workspace.yaml` under the `apps/*` wildcard (already covered if wildcard exists)
- Must be included in `turbo.json` pipeline under `build`, `dev`, and `lint` tasks
- Reuse existing shared workspace packages — do not duplicate them:
  - `@repo/typescript-config` — shared TypeScript config
  - `@repo/ui` — shared UI components (if present)
  - `@repo/db` — do NOT import directly in frontend (backend only)

---

## Tech Stack

| Concern         | Choice                                                |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js (App Router)                                  |
| Language        | TypeScript (strict mode)                              |
| Styling         | Tailwind CSS                                          |
| Package Manager | pnpm                                                  |
| HTTP Client     | Native `fetch` with typed wrappers                    |
| Auth Storage    | `localStorage` (JWT token)                            |
| Env Variable    | `NEXT_PUBLIC_API_URL` pointing to `apps/http-backend` |

---

## First Screen Behavior

**The very first thing a user sees when they open the website must be the auth screen.**

- No landing page
- No hero section
- No marketing copy
- Route `/` renders the auth screen directly

The auth screen contains both Sign Up and Sign In modes toggled by a tab or switch component.

---

## Auth Screen Requirements

### Layout

- Centered card/box on a clean background
- App name or logo at the top of the card
- Tab switcher at the top of the card: **Sign In** | **Sign Up**
- Input fields below the tab
- Role dropdown below the input fields
- Submit button at the bottom of the card

### Sign In Fields

- Email (type: email, required)
- Password (type: password, required)
- Role dropdown (required)

### Sign Up Fields

- Full Name (type: text, required)
- Email (type: email, required)
- Password (type: password, required)
- Role dropdown (required)

### Role Dropdown

The dropdown must list exactly these five roles in this order:

```
Student
Teacher
Admin
Upper Management
Validator
```

The selected role must be sent in the request body to the backend. Reference `apps/http-backend` for the exact field name and accepted values.

### Submit Button

- Label changes dynamically: **Sign In** or **Sign Up** based on the active tab
- Shows a loading state while the API call is in flight
- Displays a clear inline error message on failure (e.g. wrong credentials, email already exists)

---

## API Integration

All requests must go to `process.env.NEXT_PUBLIC_API_URL`.

Reference `apps/http-backend` for:

- Exact endpoint paths for signup and signin
- Request body field names and types
- Response shape (especially where the JWT token and role are returned)

Store the returned JWT in `localStorage` under a consistent key (e.g. `auth_token`). Also store the role string so middleware can read it without decoding the JWT on every request.

---

## Role-Based Redirect After Auth

After a successful signin or signup, read the role from the API response and redirect the user to their dashboard:

| Role               | Redirect Path                 |
| ------------------ | ----------------------------- |
| `Student`          | `/dashboard/student`          |
| `Teacher`          | `/dashboard/teacher`          |
| `Admin`            | `/dashboard/admin`            |
| `Upper Management` | `/dashboard/upper-management` |
| `Validator`        | `/dashboard/validator`        |

Use `router.push()` from `next/navigation` for client-side redirect after auth.

---

## Middleware — `middleware.ts`

Place `middleware.ts` at the root of `apps/frontend` (next to `app/`).

### Rules

1. **Unauthenticated users** hitting any `/dashboard/*` route must be redirected to `/`
2. **Authenticated users** hitting `/` must be redirected to their role-specific dashboard (prevent seeing the auth screen again after login)
3. **Role mismatch** — an authenticated user trying to access another role's dashboard must be redirected to their own dashboard

### How to Read Auth State in Middleware

Since `localStorage` is not accessible in middleware (runs on the Edge), store the JWT and role in a **cookie** in addition to `localStorage`. Set a cookie named `auth_token` and `user_role` on successful auth from the client side so middleware can read them via `request.cookies`.

```ts
// Example pattern in middleware.ts
import { NextRequest, NextResponse } from "next/server";

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  Student: "/dashboard/student",
  Teacher: "/dashboard/teacher",
  Admin: "/dashboard/admin",
  "Upper Management": "/dashboard/upper-management",
  Validator: "/dashboard/validator",
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const role = request.cookies.get("user_role")?.value;
  const path = request.nextUrl.pathname;

  const isDashboard = path.startsWith("/dashboard");
  const isRoot = path === "/";

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isRoot && token && role) {
    const destination = ROLE_DASHBOARD_MAP[role] ?? "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isDashboard && role) {
    const allowedPath = ROLE_DASHBOARD_MAP[role];
    if (allowedPath && !path.startsWith(allowedPath)) {
      return NextResponse.redirect(new URL(allowedPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
```

---

## Dashboard Pages (Stubs)

Create stub dashboard pages for each role. These are placeholders — actual dashboard content will be built separately.

```
app/
  dashboard/
    student/
      page.tsx
    teacher/
      page.tsx
    admin/
      page.tsx
    upper-management/
      page.tsx
    validator/
      page.tsx
```

Each stub page should:

- Display the role name and a welcome message
- Include a **Sign Out** button that clears `localStorage` and the auth cookies, then redirects to `/`

---

## Folder Structure

```
apps/frontend/
  app/
    layout.tsx
    page.tsx                  ← Auth screen (Sign In / Sign Up)
    dashboard/
      student/page.tsx
      teacher/page.tsx
      admin/page.tsx
      upper-management/page.tsx
      validator/page.tsx
  components/
    auth/
      AuthCard.tsx            ← Main auth card wrapper
      SignInForm.tsx
      SignUpForm.tsx
      RoleDropdown.tsx
      TabSwitcher.tsx
  lib/
    api.ts                    ← Typed fetch wrappers for auth endpoints
    auth.ts                   ← Token/cookie helpers (set, get, clear)
    constants.ts              ← Role list, dashboard map, API base URL
  middleware.ts
  .env.local                  ← NEXT_PUBLIC_API_URL=http://localhost:3001
  next.config.ts
  tsconfig.json               ← extends @repo/typescript-config/nextjs.json
  tailwind.config.ts
  package.json
```

---

## Environment Variables

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Add `apps/frontend/.env.example` with the same keys but empty values for reference.

---

## `package.json` Scripts

```json
{
  "name": "@repo/frontend",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Key Constraints

- Do not use the Pages Router — App Router only
- Do not import `@repo/db` or any Prisma client in this app
- Do not hardcode API endpoint paths — always derive them from `NEXT_PUBLIC_API_URL` and the paths found in `apps/http-backend`
- Do not use any third-party auth library (Clerk, NextAuth, etc.) — implement auth manually using the backend JWT flow
- All TypeScript errors must be resolved — no `@ts-ignore` suppressions
- Tailwind class usage only — no inline `style` props except where absolutely necessary
