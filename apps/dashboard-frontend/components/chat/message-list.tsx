"use client";

import { Star } from "lucide-react";
import type { MockMessage } from "@/lib/mock-data";

interface MessageListProps {
  messages: MockMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function MessageList({ messages, selectedId, onSelect }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
        No messages
      </div>
    );
  }

  return (
    <div>
      {messages.map((msg) => {
        const isSelected = selectedId === msg.id;
        return (
          <button
            key={msg.id}
            onClick={() => onSelect(msg.id)}
            style={{
              width: "100%",
              textAlign: "left",
              display: "block",
              padding: "10px 16px",
              borderBottom: "1px solid var(--border)",
              background: isSelected ? "var(--bg-active)" : "var(--bg)",
              border: "none",
              borderBlockEnd: "1px solid var(--border)",
              cursor: "pointer",
              color: "inherit",
              fontFamily: "inherit",
            }}
          >
            {/* Row 1: Name + Folder · Time */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: !msg.read ? 700 : 500,
                  color: "var(--text)",
                }}
              >
                {msg.from}
              </span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0, marginLeft: 8 }}>
                Inbox · {formatTimestamp(msg.timestamp)}
              </span>
            </div>

            {/* Row 2: Subject */}
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: !msg.read ? 600 : 400,
                color: "var(--text-secondary)",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {msg.subject}
              {msg.starred && <Star size={11} style={{ fill: "currentColor", flexShrink: 0 }} />}
            </div>

            {/* Row 3: Preview */}
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {msg.body.split("\n")[0]?.substring(0, 60)}...
            </div>
          </button>
        );
      })}
    </div>
  );
}
