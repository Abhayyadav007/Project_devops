"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CHAT_SIDEBAR_ITEMS } from "@/lib/constants";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import { Inbox, Send, Star, FileText, Trash2, PenSquare } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Inbox, Send, Star, FileText, Trash2,
};

function getCountForView(view: string): number {
  switch (view) {
    case "inbox": return MOCK_MESSAGES.filter((m) => m.folder === "inbox").length;
    case "sent": return MOCK_MESSAGES.filter((m) => m.folder === "sent").length;
    case "starred": return MOCK_MESSAGES.filter((m) => m.starred).length;
    case "drafts": return MOCK_MESSAGES.filter((m) => m.folder === "drafts").length;
    case "trash": return MOCK_MESSAGES.filter((m) => m.folder === "trash").length;
    default: return 0;
  }
}

function getUnreadCount(view: string): number {
  if (view === "inbox") return MOCK_MESSAGES.filter((m) => m.folder === "inbox" && !m.read).length;
  return 0;
}

interface ChatSidebarProps {
  onCompose: () => void;
}

export default function ChatSidebar({ onCompose }: ChatSidebarProps) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") ?? "inbox";

  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        height: "calc(100vh - 48px)",
        position: "sticky",
        top: 48,
        overflowY: "auto",
        padding: "8px 0",
      }}
    >
      {/* Compose */}
      <div style={{ padding: "4px 8px 8px" }}>
        <button
          onClick={onCompose}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 20,
            border: "none",
            background: "var(--accent)",
            color: "var(--accent-text)",
            fontSize: "var(--font-size-base)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <PenSquare size={14} />
          Compose
        </button>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 8px" }}>
        {CHAT_SIDEBAR_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? Inbox;
          const viewId = item.id;
          const isActive =
            viewId === "inbox"
              ? !searchParams.has("view") || currentView === "inbox"
              : currentView === viewId;
          const count = getCountForView(viewId);
          const unread = getUnreadCount(viewId);

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                fontSize: "var(--font-size-base)",
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-active)" : "transparent",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={16} />
                {item.label}
              </span>
              {unread > 0 ? (
                <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--accent)" }}>
                  {unread}
                </span>
              ) : count > 0 ? (
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
