"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { ROLE_LABELS } from "@/lib/constants";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { role, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  const isChat = pathname.startsWith("/chat");
  const isDashboard = pathname.startsWith("/dashboard") || pathname === "/";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontSize: "var(--font-size-base)",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "var(--accent)",
              color: "var(--accent-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--font-size-sm)",
              fontWeight: 700,
            }}
          >
            H
          </div>
          <span style={{ fontWeight: 600, fontSize: "var(--font-size-md)" }}>
            Hope International
          </span>
        </Link>

        <nav style={{ display: "flex", gap: 2 }}>
          <Link
            href="/dashboard"
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius)",
              fontSize: "var(--font-size-base)",
              fontWeight: 500,
              textDecoration: "none",
              color: isDashboard ? "var(--accent)" : "var(--text-secondary)",
              background: isDashboard ? "var(--bg-active)" : "transparent",
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/chat"
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius)",
              fontSize: "var(--font-size-base)",
              fontWeight: 500,
              textDecoration: "none",
              color: isChat ? "var(--accent)" : "var(--text-secondary)",
              background: isChat ? "var(--bg-active)" : "transparent",
            }}
          >
            Chat
          </Link>
        </nav>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {role && (
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}
          >
            {ROLE_LABELS[role]}
          </span>
        )}

        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--bg-active)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            color: "var(--text)",
            textTransform: "uppercase",
          }}
        >
          {role ? role[0] : "?"}
        </div>

        <button
          onClick={signOut}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
