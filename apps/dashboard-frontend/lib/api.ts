import { API_BASE_URL, type AuthRole, CHANGE_PASSWORD_ENDPOINTS, SIGNUP_ENDPOINTS } from "./constants";
import { getStoredToken } from "./auth";
import type { EntityRecord, Message } from "./types";

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

/* ── Entity management (GET / DELETE) ── */

export async function getEntities(role: AuthRole, targetRole: string): Promise<EntityRecord[]> {
  let endpoint = "";
  if (role === "validator" && targetRole === "uppermanagement") endpoint = "/validator/uppermanagement";
  if (role === "uppermanagement" && targetRole === "admin") endpoint = "/uppermanagement/admin";
  if (role === "admin" && targetRole === "teacher") endpoint = "/admin/teacher";
  if (role === "admin" && targetRole === "student") endpoint = "/admin/student";

  if (!endpoint) throw new Error(`Invalid role/targetRole combination: ${role} -> ${targetRole}`);

  return request<EntityRecord[]>(endpoint, { method: "GET" });
}

export async function deleteEntity(role: AuthRole, targetRole: string, id: number) {
  let endpoint = "";
  if (role === "validator" && targetRole === "uppermanagement") endpoint = `/validator/uppermanagement/${id}`;
  if (role === "uppermanagement" && targetRole === "admin") endpoint = `/uppermanagement/admin/${id}`;
  if (role === "admin" && targetRole === "teacher") endpoint = `/admin/teacher/${id}`;
  if (role === "admin" && targetRole === "student") endpoint = `/admin/student/${id}`;

  if (!endpoint) throw new Error(`Invalid role/targetRole combination: ${role} -> ${targetRole}`);

  return request<{ message: string }>(endpoint, { method: "DELETE" });
}

/* ── Dashboard overview stats (dynamic) ── */

export async function getOverviewStats(role: AuthRole): Promise<{ label: string; value: number; change: string }[]> {
  // Fetch actual entity counts from the backend
  const stats: { label: string; value: number; change: string }[] = [];
  try {
    if (role === "validator") {
      const ums = await getEntities(role, "uppermanagement");
      stats.push({ label: "Upper Management", value: ums.length, change: `${ums.length} total` });
    } else if (role === "uppermanagement") {
      const admins = await getEntities(role, "admin");
      stats.push({ label: "Admins", value: admins.length, change: `${admins.length} total` });
    } else if (role === "admin") {
      const teachers = await getEntities(role, "teacher");
      const students = await getEntities(role, "student");
      stats.push({ label: "Teachers", value: teachers.length, change: `${teachers.length} total` });
      stats.push({ label: "Students", value: students.length, change: `${students.length} total` });
    }
  } catch {
    // If API is unreachable, return empty stats
  }
  return stats;
}

/* ── Messages ── */

export async function getMessages(role: AuthRole, folder: string): Promise<Message[]> {
  return request<Message[]>(`/${role}/messages?folder=${folder}`, { method: "GET" });
}

export async function sendMessage(role: AuthRole, data: { to: string; subject: string; body: string }) {
  return request<{ message: string }>(`/${role}/messages`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ── All users (for compose recipient lookup) ── */

export async function getAllUsers(role: AuthRole): Promise<EntityRecord[]> {
  return request<EntityRecord[]>(`/${role}/users`, { method: "GET" });
}

export { ApiError };
