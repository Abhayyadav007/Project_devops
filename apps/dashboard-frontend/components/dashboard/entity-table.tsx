"use client";

import { useAuth } from "@/hooks/use-auth";
import { getMockEntitiesForRole } from "@/lib/mock-data";
import { type AuthRole } from "@/lib/constants";
import { Search } from "lucide-react";
import { useState } from "react";

export default function EntityTable() {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  if (!role) return null;

  const { entities, label } = getMockEntitiesForRole(role as AuthRole);
  const filtered = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.uniqueId.toString().includes(search) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, marginBottom: 2 }}>
            Manage {label}
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
            {entities.length} accounts
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, or email..."
          style={{
            width: "100%",
            padding: "6px 12px 6px 30px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg)",
            color: "var(--text)",
            fontSize: "var(--font-size-base)",
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
              {["Name", "ID", "Email", "Status", "Created"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 16px",
                    textAlign: "left",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((entity) => (
              <tr key={entity.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--bg-active)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        color: "var(--text)",
                        flexShrink: 0,
                      }}
                    >
                      {entity.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: "var(--font-size-base)", fontWeight: 500 }}>{entity.name}</span>
                  </div>
                </td>
                <td style={{ padding: "8px 16px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                  {entity.uniqueId}
                </td>
                <td style={{ padding: "8px 16px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                  {entity.email}
                </td>
                <td style={{ padding: "8px 16px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 500,
                      color: entity.status === "active" ? "var(--success)" : "var(--text-muted)",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: entity.status === "active" ? "var(--success)" : "var(--text-muted)" }} />
                    {entity.status}
                  </span>
                </td>
                <td style={{ padding: "8px 16px", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                  {new Date(entity.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
            No results found.
          </div>
        )}
      </div>
    </div>
  );
}
