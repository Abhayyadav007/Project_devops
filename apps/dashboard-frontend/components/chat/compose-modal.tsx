"use client";

import { useState, type FormEvent } from "react";
import { X, Send } from "lucide-react";

interface ComposeModalProps {
  onClose: () => void;
}

export default function ComposeModal({ onClose }: ComposeModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setTimeout(() => onClose(), 800);
  }

  const inlineInput: React.CSSProperties = {
    flex: 1,
    background: "transparent",
    border: "none",
    padding: "8px 0",
    fontSize: "var(--font-size-base)",
    color: "var(--text)",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 16 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />

      {/* Modal */}
      <div
        className="animate-fade-in"
        style={{
          position: "relative",
          width: 480,
          maxWidth: "100%",
          borderRadius: "var(--radius) var(--radius) 0 0",
          border: "1px solid var(--border)",
          background: "var(--bg)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--accent)", color: "var(--accent-text)" }}>
          <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600 }}>New Message</span>
          <button onClick={onClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: "var(--accent-text)", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>

        {sent ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <span style={{ fontSize: "var(--font-size-base)", color: "var(--success)", fontWeight: 500 }}>✓ Message sent</span>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            <div style={{ borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}>
                <label style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", width: 32 }}>To</label>
                <input type="text" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient" style={inlineInput} />
              </div>
            </div>
            <div style={{ borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}>
                <label style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", width: 32 }}>Subj</label>
                <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={inlineInput} />
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={8}
                style={{
                  width: "100%",
                  resize: "none",
                  background: "transparent",
                  border: "none",
                  fontSize: "var(--font-size-base)",
                  color: "var(--text)",
                  outline: "none",
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
              <button
                type="submit"
                disabled={sending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--accent)",
                  color: "var(--accent-text)",
                  fontSize: "var(--font-size-base)",
                  fontWeight: 600,
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.6 : 1,
                }}
              >
                <Send size={12} />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
