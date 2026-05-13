export type AuthRole =
  | "validator"
  | "uppermanagement"
  | "admin"
  | "teacher"
  | "student";

export type AuthMode = "signin" | "signup";

export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export const AUTH_ROLE_OPTIONS: Array<{
  value: AuthRole;
  label: string;
  description: string;
}> = [
  {
    value: "validator",
    label: "Validator",
    description: "Creates upper management accounts.",
  },
  {
    value: "uppermanagement",
    label: "Upper management",
    description: "Creates admins for the hierarchy.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Creates teachers and students.",
  },
  {
    value: "teacher",
    label: "Teacher",
    description: "Instructional account.",
  },
  {
    value: "student",
    label: "Student",
    description: "Student account.",
  },
];

export const ROLE_LABELS: Record<AuthRole, string> = {
  validator: "Validator",
  uppermanagement: "Upper management",
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

export const SIGN_IN_IDENTIFIER_LABELS: Record<AuthRole, string> = {
  validator: "Validator ID",
  uppermanagement: "Upper management ID",
  admin: "Admin ID",
  teacher: "Teacher ID",
  student: "Student ID",
};

export const SIGN_IN_ENDPOINTS: Record<AuthRole, string> = {
  validator: "/validator/signin",
  uppermanagement: "/uppermanagement/signin",
  admin: "/admin/signin",
  teacher: "/teacher/signin",
  student: "/student/signin",
};

export const VALIDATOR_SIGNUP_DEFAULTS = {
  name: process.env.NEXT_PUBLIC_AUTHDASHBOARD_VALIDATOR_NAME ?? "Root Validator",
  userId: process.env.NEXT_PUBLIC_AUTHDASHBOARD_VALIDATOR_USER_ID ?? "10001",
  email:
    process.env.NEXT_PUBLIC_AUTHDASHBOARD_VALIDATOR_EMAIL ?? "root.validator@example.com",
  password:
    process.env.NEXT_PUBLIC_AUTHDASHBOARD_VALIDATOR_PASSWORD ?? "Validator@123",
};

export const DASHBOARD_REDIRECT_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3006";

export function getRoleLabel(role: AuthRole) {
  return ROLE_LABELS[role];
}

export function getSignInIdentifierLabel(role: AuthRole) {
  return SIGN_IN_IDENTIFIER_LABELS[role];
}

export function getEndpoint(mode: AuthMode, role: AuthRole) {
  return SIGN_IN_ENDPOINTS[role];
}
