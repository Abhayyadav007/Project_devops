"use client";

import { Star } from "lucide-react";
import type { MockMessage } from "@/lib/mock-data";
import { useState, useCallback } from "react";

interface MessageDetailProps {
  message: MockMessage;
}

interface ThreadMessage {
  from: string;
  body: string;
  starred: boolean;
  isReply?: boolean;
}

export default function MessageDetail({ message }: MessageDetailProps) {
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState<ThreadMessage[]>([]);
  const [sending, setSending] = useState(false);

  // Base thread from the message
  const baseThread: ThreadMessage[] = [
    { from: message.from, body: message.body, starred: message.starred },
  ];

  const thread = [...baseThread, ...replies];

  const handleSendReply = useCallback(() => {
    if (!reply.trim()) return;
    setSending(true);

    // Simulate send delay
    setTimeout(() => {
      setReplies((prev) => [
        ...prev,
        { from: "You", body: reply.trim(), starred: false, isReply: true },
      ]);
      setReply("");
      setSending(false);
    }, 400);
  }, [reply]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  }, [handleSendReply]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--text)" }}>
              {message.from}
            </span>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
              {message.from.toLowerCase().replace(/\s/g, "")}@email.com
            </span>
          </div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginTop: 2 }}>
            {message.subject}
          </div>
        </div>
        <Star size={16} style={{ color: message.starred ? "var(--text)" : "var(--text-muted)", fill: message.starred ? "var(--text)" : "none", cursor: "pointer" }} />
      </div>

      {/* Conversation thread */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {thread.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 20px",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: msg.from === "You" ? "var(--accent)" : "var(--bg-active)",
                color: msg.from === "You" ? "var(--accent-text)" : "var(--text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {msg.from.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                {msg.from}
              </div>
              <div style={{ fontSize: "var(--font-size-base)", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {msg.body}
              </div>
            </div>
            <Star
              size={14}
              style={{
                color: msg.starred ? "var(--text)" : "var(--border)",
                fill: msg.starred ? "var(--text)" : "none",
                flexShrink: 0,
                marginTop: 4,
                cursor: "pointer",
              }}
            />
          </div>
        ))}
      </div>

      {/* Reply area */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px" }}>
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginBottom: 8 }}>
          To: {message.from.toLowerCase().replace(/\s/g, "")}@email.com
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type Message... (Enter to send, Shift+Enter for new line)"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "none",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: "var(--font-size-base)",
              fontFamily: "inherit",
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
            }}
          />
          {/* Action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 8px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {["📎", "🖼️", "🔗"].map((icon, i) => (
                <button
                  key={i}
                  title={["Attach", "Image", "Link"][i]}
                  style={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 14,
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              onClick={handleSendReply}
              disabled={!reply.trim() || sending}
              style={{
                padding: "5px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: reply.trim() ? "#4285f4" : "var(--bg-active)",
                color: reply.trim() ? "#fff" : "var(--text-muted)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                cursor: reply.trim() && !sending ? "pointer" : "not-allowed",
              }}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
