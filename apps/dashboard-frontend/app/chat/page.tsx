"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MessageList from "@/components/chat/message-list";
import MessageDetail from "@/components/chat/message-detail";
import ComposeModal from "@/components/chat/compose-modal";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import { PenSquare, ChevronDown } from "lucide-react";

const FOLDERS = ["inbox", "sent", "starred", "drafts", "trash"] as const;

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") ?? "inbox";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [composing, setComposing] = useState(false);

  const messages = useMemo(() => {
    switch (view) {
      case "sent": return MOCK_MESSAGES.filter((m) => m.folder === "sent");
      case "starred": return MOCK_MESSAGES.filter((m) => m.starred);
      case "drafts": return MOCK_MESSAGES.filter((m) => m.folder === "drafts");
      case "trash": return MOCK_MESSAGES.filter((m) => m.folder === "trash");
      default: return MOCK_MESSAGES.filter((m) => m.folder === "inbox");
    }
  }, [view]);

  // Auto-select first message when messages change or no selection
  const effectiveSelectedId = selectedId && messages.find((m) => m.id === selectedId) ? selectedId : messages[0]?.id ?? null;

  const selectedMessage = effectiveSelectedId
    ? MOCK_MESSAGES.find((m) => m.id === effectiveSelectedId) ?? null
    : null;

  const handleFolderChange = useCallback((folder: string) => {
    router.push(folder === "inbox" ? "/chat" : `/chat?view=${folder}`);
    setDropdownOpen(false);
    setSelectedId(null);
  }, [router]);

  return (
    <>
      {/* ── Middle panel: message list ── */}
      <div
        style={{
          width: 340,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: "var(--bg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: "var(--text)" }}>
            Email
          </span>
        </div>

        {/* Inbox dropdown + Compose */}
        <div
          style={{
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
            position: "relative",
          }}
        >
          {/* Dropdown trigger */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "var(--font-size-base)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{view}</span>
              <ChevronDown size={14} style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <>
                <div onClick={() => setDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    zIndex: 20,
                    minWidth: 140,
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    background: "var(--bg)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                  }}
                >
                  {FOLDERS.map((folder) => (
                    <button
                      key={folder}
                      onClick={() => handleFolderChange(folder)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 14px",
                        border: "none",
                        background: folder === view ? "var(--bg-active)" : "var(--bg)",
                        color: folder === view ? "var(--text)" : "var(--text-secondary)",
                        fontSize: "var(--font-size-base)",
                        fontWeight: folder === view ? 600 : 400,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        fontFamily: "inherit",
                      }}
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Compose button */}
          <button
            onClick={() => setComposing(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "#4285f4",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <PenSquare size={16} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <MessageList
            messages={messages}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* ── Right panel: message detail ── */}
      <div style={{ flex: 1, height: "100vh", overflow: "hidden" }}>
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
            Select a message to read
          </div>
        )}
      </div>

      {/* Compose modal */}
      {composing && <ComposeModal onClose={() => setComposing(false)} />}
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
