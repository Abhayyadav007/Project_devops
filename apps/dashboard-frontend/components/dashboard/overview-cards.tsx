"use client";

import { getMockStats } from "@/lib/mock-data";
import { ROLE_LABELS, type AuthRole } from "@/lib/constants";

interface OverviewCardsProps {
  role: AuthRole;
}

export default function OverviewCards({ role }: OverviewCardsProps) {
  const stats = getMockStats(role);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, marginBottom: 4 }}>
        Welcome back
      </h1>
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 24 }}>
        {ROLE_LABELS[role]} Overview
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "16px",
              background: "var(--bg-surface)",
            }}
          >
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 600, marginTop: 6, color: "var(--text)" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: 4 }}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
          Recent Activity
        </h2>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          {[
            { action: "Account created", detail: "New member added to the system", time: "2 hours ago" },
            { action: "Password changed", detail: "Security update completed", time: "1 day ago" },
            { action: "Login detected", detail: "New session from your device", time: "2 days ago" },
          ].map((activity, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderTop: i > 0 ? "1px solid var(--border)" : "none",
                fontSize: "var(--font-size-base)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)" }} />
                <div>
                  <div style={{ fontWeight: 500, color: "var(--text)" }}>{activity.action}</div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>{activity.detail}</div>
                </div>
              </div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
