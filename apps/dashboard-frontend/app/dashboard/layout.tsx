"use client";

import { type ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { DASHBOARD_SIDEBAR_ITEMS, type AuthRole } from "@/lib/constants";
import {
  LayoutDashboard, UserPlus, Users, Lock, User, GraduationCap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, UserPlus, Users, Lock, User, GraduationCap,
};

function DashboardSubNav() {
  const pathname = usePathname();
  const { role } = useAuth();
  if (!role) return null;

  const items = DASHBOARD_SIDEBAR_ITEMS[role as AuthRole] ?? [];

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        padding: "16px 0",
      }}
    >
      <div style={{ padding: "0 12px 12px", fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text)" }}>
        Dashboard
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 8px" }}>
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 12px",
                borderRadius: "var(--radius)",
                fontSize: "var(--font-size-base)",
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                color: isActive ? "var(--text)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-active)" : "transparent",
              }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AppSidebar />
      <Suspense>
        <DashboardSubNav />
      </Suspense>
      <main style={{ flex: 1, padding: "24px 28px", overflowX: "auto" }}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
