"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DASHBOARD_SIDEBAR_ITEMS, type AuthRole } from "@/lib/constants";
import {
  LayoutDashboard, UserPlus, Users, Lock, User, GraduationCap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, UserPlus, Users, Lock, User, GraduationCap,
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  if (!role) return null;

  const items = DASHBOARD_SIDEBAR_ITEMS[role as AuthRole] ?? [];
  const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        height: "calc(100vh - 48px)",
        position: "sticky",
        top: 48,
        overflowY: "auto",
        padding: "8px 0",
      }}
    >
      <div style={{ padding: "8px 8px 4px 12px" }}>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Menu
        </span>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 8px" }}>
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : currentPath.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                fontSize: "var(--font-size-base)",
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-active)" : "transparent",
              }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
