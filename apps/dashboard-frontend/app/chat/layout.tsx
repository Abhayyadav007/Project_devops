"use client";

import { type ReactNode, Suspense } from "react";
import AppSidebar from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";

function ChatShell({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AppSidebar />
      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ChatShell>{children}</ChatShell>
    </Suspense>
  );
}
