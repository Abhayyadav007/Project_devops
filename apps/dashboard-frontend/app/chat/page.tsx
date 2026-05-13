"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MessageList from "@/components/chat/message-list";
import MessageDetail from "@/components/chat/message-detail";
import ComposeModal from "@/components/chat/compose-modal";
import type { Message } from "@/lib/types";
import { getMessages } from "@/lib/api";
import { PenSquare, ChevronDown, Users, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_CAN_CREATE, type AuthRole } from "@/lib/constants";

const FOLDERS = ["inbox", "sent", "starred", "drafts", "trash"] as const;

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role } = useAuth();
  const canCreateGroup = role ? !!ROLE_CAN_CREATE[role as AuthRole] : false;

  const view = searchParams.get("view") ?? "inbox";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!role) return;
    setLoading(true);
    try {
      const data = await getMessages(role as AuthRole, view);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [role, view]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-select first message when messages change or no selection
  const effectiveSelectedId = selectedId && messages.find((m) => m.id === selectedId) ? selectedId : messages[0]?.id ?? null;

  const selectedMessage = effectiveSelectedId
    ? messages.find((m) => m.id === effectiveSelectedId) ?? null
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

          {/* Actions: Create Group + Compose */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {canCreateGroup && (
              <button
                onClick={() => setCreatingGroup(true)}
                title="Create Group"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Users size={16} />
              </button>
            )}
            <button
              onClick={() => setComposing(true)}
              title="Compose"
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
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
              Loading messages...
            </div>
          ) : (
            <MessageList
              messages={messages}
              selectedId={effectiveSelectedId}
              onSelect={setSelectedId}
            />
          )}
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
      {composing && <ComposeModal onClose={() => setComposing(false)} onSent={fetchMessages} />}

      {/* Create Group modal */}
      {creatingGroup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={() => setCreatingGroup(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
          <div
            className="animate-fade-in"
            style={{
              position: "relative",
              width: 400,
              maxWidth: "100%",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Create New Group</span>
              <button onClick={() => setCreatingGroup(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase" }}>Group Name</label>
                <input type="text" placeholder="e.g. Science Class Fall 2026" style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg)", color: "var(--text)", fontSize: "var(--font-size-base)", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase" }}>Add Members (Emails)</label>
                <textarea rows={3} placeholder="Comma separated emails..." style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg)", color: "var(--text)", fontSize: "var(--font-size-base)", outline: "none", resize: "none" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setCreatingGroup(false)} style={{ padding: "6px 16px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "var(--accent-text)", fontSize: "var(--font-size-base)", fontWeight: 600, cursor: "pointer" }}>
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
