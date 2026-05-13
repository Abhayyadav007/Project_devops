import { API_BASE_URL, type AuthRole, CHANGE_PASSWORD_ENDPOINTS, SIGNUP_ENDPOINTS } from "./constants";
import { getStoredToken } from "./auth";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, `Unable to reach API at ${API_BASE_URL}. Is the backend running?`);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (body as { message?: string })?.message ?? `Request failed (${response.status})`,
    );
  }

  return body as T;
}

/* ── Signup (create subordinate) ── */

interface SignupInput {
  targetRole: string;
  name: string;
  userId: number;
  password: string;
  email: string;
}

export async function createEntity(input: SignupInput) {
  const endpoint = SIGNUP_ENDPOINTS[input.targetRole as AuthRole];
  if (!endpoint) throw new Error(`No signup endpoint for role: ${input.targetRole}`);

  return request<{ message: string; token: string }>(endpoint, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      userId: input.userId,
      password: input.password,
      email: input.email,
    }),
  });
}

/* ── Change Password ── */

export async function changePassword(role: AuthRole, oldPassword: string, newPassword: string) {
  const endpoint = CHANGE_PASSWORD_ENDPOINTS[role];
  return request<{ message: string }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export { ApiError };
