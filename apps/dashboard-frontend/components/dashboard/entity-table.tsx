"use client";

import { useAuth } from "@/hooks/use-auth";
import { type EntityRecord } from "@/lib/types";
import { getEntities, deleteEntity } from "@/lib/api";
import { ROLE_CAN_CREATE, type AuthRole } from "@/lib/constants";
import { Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function EntityTable() {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [search, setSearch] = useState("");
  const [entities, setEntities] = useState<EntityRecord[]>([]);

  // Determine target role based on URL ?type=... or defaults
  const targetRole = role ? (typeParam || ROLE_CAN_CREATE[role as AuthRole]?.roles[0] || "") : "";
  const label = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);

  useEffect(() => {
    async function fetchData() {
      if (!role || !targetRole) return;
      try {
        const data = await getEntities(role as AuthRole, targetRole);
        setEntities(data);
      } catch (err) {
        console.error("Failed to fetch entities", err);
      }
    }
    fetchData();
  }, [role, targetRole]);

  if (!role) return null;

  const filtered = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.teacherId || e.studentId || e.adminId || e.upperManagementId || e.validatorId || "").toString().includes(search) ||
      (e.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm(`Are you sure you want to delete this ${targetRole}?`)) {
      try {
        await deleteEntity(role as AuthRole, targetRole, id);
        setEntities((prev) => prev.filter((entity) => entity.id !== id));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete account";
        alert(message);
      }
    }
  };

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
              {["Name", "ID", "Email", "Status", "Created", "Actions"].map((h) => (
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
                  {entity.teacherId || entity.studentId || entity.adminId || entity.upperManagementId || entity.validatorId || "N/A"}
                </td>
                <td style={{ padding: "8px 16px", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                  {entity.email || "N/A"}
                </td>
                <td style={{ padding: "8px 16px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 500,
                      color: "var(--success)",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)" }} />
                    Active
                  </span>
                </td>
                <td style={{ padding: "8px 16px", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                  {entity.CreatedAt || entity.createdAt
                    ? new Date(entity.CreatedAt || entity.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td style={{ padding: "8px 16px" }}>
                  <button
                    onClick={() => handleDelete(entity.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: "transparent",
                      color: "var(--error)",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    title="Delete Account"
                  >
                    <Trash2 size={16} />
                  </button>
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

