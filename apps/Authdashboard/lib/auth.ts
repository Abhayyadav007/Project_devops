import type { AuthRole } from "./constants";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_ROLE_KEY = "user_role";
const AUTH_MAX_AGE = 60 * 60 * 24 * 7;

export function persistAuthSession(token: string, role: AuthRole) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_ROLE_KEY, role);

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_MAX_AGE}; SameSite=Lax${secureFlag}`;
  document.cookie = `user_role=${encodeURIComponent(role)}; Path=/; Max-Age=${AUTH_MAX_AGE}; SameSite=Lax${secureFlag}`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  document.cookie = "auth_token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "user_role=; Path=/; Max-Age=0; SameSite=Lax";
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
}
