"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AUTH_URL, type AuthRole } from "@/lib/constants";
import { Suspense } from "react";

const VALID_ROLES: AuthRole[] = ["validator", "uppermanagement", "admin", "teacher", "student"];

/**
 * Landing page that handles the auth handoff from Authdashboard.
 *
 * Flow:
 *  1. Authdashboard signs the user in and redirects here with ?token=...&role=...
 *  2. This page reads the query params, saves them to localStorage (this origin),
 *     strips the params from the URL, and redirects to /dashboard.
 *  3. On subsequent visits without params, it checks localStorage directly.
 */
function LandingHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const roleParam = searchParams.get("role");

    // If token and role arrive via query params, persist them locally
    if (tokenParam && roleParam && VALID_ROLES.includes(roleParam as AuthRole)) {
      localStorage.setItem("auth_token", tokenParam);
      localStorage.setItem("user_role", roleParam);
      // Clean the URL (remove sensitive token from address bar)
      router.replace("/dashboard");
      return;
    }

    // No query params — check existing localStorage session
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      window.location.assign(AUTH_URL);
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        <span className="text-sm text-[var(--color-text-muted)]">Loading...</span>
      </div>
    </div>
  );
}

export default function RootPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span className="text-sm text-[var(--color-text-muted)]">Loading...</span>
          </div>
        </div>
      }
    >
      <LandingHandler />
    </Suspense>
  );
}
