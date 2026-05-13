export type AuthRole =
  | "validator"
  | "uppermanagement"
  | "admin"
  | "teacher"
  | "student";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3003";

export const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:3007";

export const ROLE_LABELS: Record<AuthRole, string> = {
  validator: "Validator",
  uppermanagement: "Upper Management",
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

export const ROLE_DESCRIPTIONS: Record<AuthRole, string> = {
  validator: "Root-level access. Creates upper management accounts.",
  uppermanagement: "Creates and manages admin accounts.",
  admin: "Creates and manages teachers and students.",
  teacher: "Instructional role with messaging capabilities.",
  student: "Student role with messaging capabilities.",
};

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const DASHBOARD_SIDEBAR_ITEMS: Record<AuthRole, SidebarItem[]> = {
  validator: [
    { id: "overview", label: "Overview", icon: "LayoutDashboard", href: "/dashboard" },
    { id: "create-um", label: "Create Upper Mgmt", icon: "UserPlus", href: "/dashboard/create" },
    { id: "manage-um", label: "Manage Upper Mgmt", icon: "Users", href: "/dashboard/manage" },
    { id: "password", label: "Change Password", icon: "Lock", href: "/dashboard/password" },
  ],
  uppermanagement: [
    { id: "overview", label: "Overview", icon: "LayoutDashboard", href: "/dashboard" },
    { id: "create-admin", label: "Create Admin", icon: "UserPlus", href: "/dashboard/create" },
    { id: "manage-admins", label: "Manage Admins", icon: "Users", href: "/dashboard/manage" },
    { id: "password", label: "Change Password", icon: "Lock", href: "/dashboard/password" },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: "LayoutDashboard", href: "/dashboard" },
    { id: "create-teacher", label: "Create Teacher", icon: "UserPlus", href: "/dashboard/create?type=teacher" },
    { id: "create-student", label: "Create Student", icon: "UserPlus", href: "/dashboard/create?type=student" },
    { id: "manage-teachers", label: "Manage Teachers", icon: "Users", href: "/dashboard/manage?type=teacher" },
    { id: "manage-students", label: "Manage Students", icon: "GraduationCap", href: "/dashboard/manage?type=student" },
    { id: "password", label: "Change Password", icon: "Lock", href: "/dashboard/password" },
  ],
  teacher: [
    { id: "overview", label: "Overview", icon: "LayoutDashboard", href: "/dashboard" },
    { id: "profile", label: "My Profile", icon: "User", href: "/dashboard/profile" },
    { id: "password", label: "Change Password", icon: "Lock", href: "/dashboard/password" },
  ],
  student: [
    { id: "overview", label: "Overview", icon: "LayoutDashboard", href: "/dashboard" },
    { id: "profile", label: "My Profile", icon: "User", href: "/dashboard/profile" },
    { id: "password", label: "Change Password", icon: "Lock", href: "/dashboard/password" },
  ],
};

export const CHAT_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "inbox", label: "Inbox", icon: "Inbox", href: "/chat" },
  { id: "sent", label: "Sent", icon: "Send", href: "/chat?view=sent" },
  { id: "starred", label: "Starred", icon: "Star", href: "/chat?view=starred" },
  { id: "drafts", label: "Drafts", icon: "FileText", href: "/chat?view=drafts" },
  { id: "trash", label: "Trash", icon: "Trash2", href: "/chat?view=trash" },
];

export const SIGNUP_ENDPOINTS: Partial<Record<AuthRole, string>> = {
  uppermanagement: "/uppermanagement/signup",
  admin: "/admin/signup",
  teacher: "/teacher/signup",
  student: "/student/signup",
};

export const CHANGE_PASSWORD_ENDPOINTS: Record<AuthRole, string> = {
  validator: "/validator/changepassword",
  uppermanagement: "/uppermanagement/changepassword",
  admin: "/admin/changepassword",
  teacher: "/teacher/changepassword",
  student: "/student/changepassword",
};

/** What entity type can each role create? */
export const ROLE_CAN_CREATE: Partial<Record<AuthRole, { label: string; roles: string[] }>> = {
  validator: { label: "Upper Management", roles: ["uppermanagement"] },
  uppermanagement: { label: "Admin", roles: ["admin"] },
  admin: { label: "Teacher / Student", roles: ["teacher", "student"] },
};
