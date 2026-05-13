"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { changePassword } from "@/lib/api";

export default function ChangePassword() {
  const { role } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setResult({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setResult({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await changePassword(role!, oldPassword, newPassword);
      setResult({ type: "success", message: response.message });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
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
        Change Password
      </h1>
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: 20 }}>
        Update your account password
      </p>

      {result && (
        <div style={{
          padding: "8px 12px",
          borderRadius: "var(--radius-sm)",
          marginBottom: 16,
          fontSize: "var(--font-size-sm)",
          border: `1px solid ${result.type === "success" ? "var(--success)" : "var(--error)"}`,
          color: result.type === "success" ? "var(--success)" : "var(--error)",
        }}>
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Current Password</label>
          <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>New Password</label>
          <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm Password</label>
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" style={inputStyle} />
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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
