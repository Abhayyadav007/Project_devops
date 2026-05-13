"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/constants";

export default function ProfilePage() {
  const { role, userId } = useAuth();
  if (!role) return null;

  const rows = [
    { label: "Role", value: ROLE_LABELS[role] },
    { label: "Description", value: ROLE_DESCRIPTIONS[role] },
    { label: "User ID", value: userId?.toString() ?? "—" },
    { label: "Session", value: "Active" },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, marginBottom: 4 }}>
        My Profile
      </h1>
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
        Account information
      </p>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius)",
              background: "var(--accent)",
              color: "var(--accent-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--font-size-md)",
              fontWeight: 700,
            }}
          >
            {role.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>{ROLE_LABELS[role]}</div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>{ROLE_DESCRIPTIONS[role]}</div>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
            <span style={{ width: 100, fontSize: "var(--font-size-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              {row.label}
            </span>
            <span style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--text)" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
