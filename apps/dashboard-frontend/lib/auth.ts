import type { AuthRole } from "./constants";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_ROLE_KEY = "user_role";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredRole(): AuthRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(AUTH_ROLE_KEY);
  if (!role) return null;
  return role as AuthRole;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  document.cookie = "auth_token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "user_role=; Path=/; Max-Age=0; SameSite=Lax";
}

export function isAuthenticated(): boolean {
  return !!getStoredToken() && !!getStoredRole();
}

/** Decode JWT payload (no verification — just for display) */
export function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserIdFromToken(): number | null {
  const token = getStoredToken();
  const role = getStoredRole();
  if (!token || !role) return null;
  const payload = decodeTokenPayload(token);
  if (!payload) return null;

  switch (role) {
    case "validator":
      return (payload.validatorId ?? payload.ValidatorId ?? null) as number | null;
    case "uppermanagement":
      return (payload.uppermanagementId ?? null) as number | null;
    case "admin":
      return (payload.adminId ?? null) as number | null;
    case "teacher":
      return (payload.teacherId ?? null) as number | null;
    case "student":
      return (payload.userId ?? null) as number | null;
    default:
      return null;
  }
}
