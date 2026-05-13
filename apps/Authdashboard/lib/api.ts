import {
  AUTH_API_BASE_URL,
  type AuthMode,
  type AuthRole,
  getEndpoint,
} from "./constants";

export interface AuthResponse {
  message: string;
  token: string;
}

export interface ApiErrorDetails {
  message?: string;
  errors?: unknown;
}

export class ApiError extends Error {
  status: number;
  details: ApiErrorDetails | null;

  constructor(status: number, message: string, details: ApiErrorDetails | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildSignInBody(role: AuthRole, identifier: number, password: string) {
  switch (role) {
    case "uppermanagement":
      return { uppermanagementId: identifier, password };
    case "admin":
      return { adminId: identifier, password };
    case "teacher":
      return { teacherId: identifier, password };
    case "validator":
    case "student":
      return { userId: identifier, password };
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}

async function requestJSON<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      `Unable to reach the API at ${AUTH_API_BASE_URL}. Is the HTTP backend running?`,
      null,
    );
  }

  const body = (await response.json().catch(() => null)) as ApiErrorDetails | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message ?? `Request failed with status ${response.status}`,
      body,
    );
  }

  return body as T;
}

export async function signIn(input: {
  role: AuthRole;
  identifier: number;
  password: string;
}) {
  const body = buildSignInBody(input.role, input.identifier, input.password);
  return requestJSON<AuthResponse>(getEndpoint("signin", input.role), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function isAuthMode(value: string): value is AuthMode {
  return value === "signin" || value === "signup";
}
