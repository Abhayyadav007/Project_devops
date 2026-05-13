"use client";

import { useState, type FormEvent } from "react";
import { createEntity } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_CAN_CREATE, type AuthRole } from "@/lib/constants";

export default function CreateForm() {
  const { role } = useAuth();
  const canCreate = role ? ROLE_CAN_CREATE[role as AuthRole] : null;

  const [selectedType, setSelectedType] = useState<string>(canCreate?.roles[0] ?? "");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!canCreate || !role) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--font-size-base)" }}>
        Your role does not have permission to create accounts.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const parsedId = parseInt(userId, 10);
      if (!parsedId || parsedId <= 0) throw new Error("User ID must be a positive number.");

      const response = await createEntity({
        targetRole: selectedType,
        name: name.trim(),
        userId: parsedId,
        password,
        email: email.trim(),
      });
      setResult({ type: "success", message: response.message });
      setName(""); setUserId(""); setPassword(""); setEmail("");
    } catch (err) {
      setResult({ type: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "var(--font-size-base)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "var(--font-size-xs)",
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, marginBottom: 4 }}>
        Create Account
      </h1>
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
        Create a new {canCreate.label.toLowerCase()} account
      </p>

      {canCreate.roles.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {canCreate.roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedType(r)}
              style={{
                padding: "4px 14px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: selectedType === r ? "var(--accent)" : "var(--bg)",
                color: selectedType === r ? "var(--accent-text)" : "var(--text-secondary)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            marginBottom: 16,
            fontSize: "var(--font-size-sm)",
            border: `1px solid ${result.type === "success" ? "var(--success)" : "var(--error)"}`,
            color: result.type === "success" ? "var(--success)" : "var(--error)",
            background: "var(--bg)",
          }}
        >
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>User ID (numeric)</label>
          <input type="text" required value={userId} onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))} placeholder="Enter numeric ID" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" style={inputStyle} />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--accent)",
            color: "var(--accent-text)",
            fontSize: "var(--font-size-base)",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            marginTop: 4,
          }}
        >
          {loading ? "Creating..." : `Create ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
        </button>
      </form>
    </div>
  );
}
