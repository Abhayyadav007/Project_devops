"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { ROLE_LABELS } from "@/lib/constants";
import { LayoutDashboard, Mail, Sun, Moon } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mail", href: "/chat", icon: Mail },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { role, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg)",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* User profile */}
      <div style={{ padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "var(--accent-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {role ? role.charAt(0).toUpperCase() : "?"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: 600,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {role ? ROLE_LABELS[role] : "User"}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              hope.international
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname.startsWith("/dashboard")
              : pathname.startsWith("/chat");

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                fontSize: "var(--font-size-md)",
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                color: isActive ? "var(--text)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-active)" : "transparent",
              }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Sign out */}
      <div style={{ padding: "0 8px 4px" }}>
        <button
          onClick={signOut}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "var(--radius)",
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Sign out
        </button>
      </div>

      {/* Theme toggle */}
      <div
        style={{
          padding: "8px 12px 16px",
          display: "flex",
          borderTop: "1px solid var(--border)",
        }}
      >
        <button
          onClick={theme === "light" ? undefined : toggle}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "6px 0",
            borderRadius: "var(--radius)",
            border: "none",
            background: theme === "light" ? "var(--bg-active)" : "transparent",
            color: theme === "light" ? "var(--text)" : "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Sun size={14} />
          Light
        </button>
        <button
          onClick={theme === "dark" ? undefined : toggle}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "6px 0",
            borderRadius: "var(--radius)",
            border: "none",
            background: theme === "dark" ? "var(--bg-active)" : "transparent",
            color: theme === "dark" ? "var(--text)" : "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Moon size={14} />
          Dark
        </button>
      </div>
    </aside>
  );
}
