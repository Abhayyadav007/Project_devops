"use client";

import { useSyncExternalStore, useCallback } from "react";
import { getStoredToken, getStoredRole, clearSession, getUserIdFromToken } from "@/lib/auth";
import { AUTH_URL, type AuthRole } from "@/lib/constants";

/**
 * Read auth state from localStorage without triggering cascading setState.
 * Uses useSyncExternalStore to read synchronously on first render.
 */
function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAuthSnapshot() {
  const token = getStoredToken();
  const role = getStoredRole();
  if (!token || !role) return null;
  return JSON.stringify({ token, role, userId: getUserIdFromToken() });
}

function getServerSnapshot() {
  return null;
}

export function useAuth() {
  const raw = useSyncExternalStore(subscribeToStorage, getAuthSnapshot, getServerSnapshot);

  const parsed = raw ? JSON.parse(raw) as { token: string; role: AuthRole; userId: number | null } : null;

  const token = parsed?.token ?? null;
  const role = parsed?.role ?? null;
  const userId = parsed?.userId ?? null;
  const isLoading = typeof window === "undefined";

  // Redirect if not authenticated (client only)
  if (typeof window !== "undefined" && !parsed) {
    window.location.assign(AUTH_URL);
  }

  const signOut = useCallback(() => {
    clearSession();
    window.location.assign(AUTH_URL);
  }, []);

  return { token, role, userId, isLoading, signOut };
}
