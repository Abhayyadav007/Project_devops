import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import { URL } from "url";
import { verifyToken } from "./auth.js";
import type { WSMessage, ChatMessage, ConnectedUser } from "./types.js";

const app = express();
const port = 3003;

app.get("/", (_, res) => {
  res.json({ status: "ok", service: "wsbackend", connections: connectedClients.size });
});

app.get("/health", (_, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

const server = app.listen(port, () => {
  console.log(`[wsbackend] Server running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

/* ── State ── */

interface ClientInfo {
  ws: WebSocket;
  user: ConnectedUser;
}

/** Map from user ID (e.g. "admin:1") to client info */
const connectedClients = new Map<string, ClientInfo>();

/** In-memory message store — keyed by recipient user ID */
const messageStore = new Map<string, ChatMessage[]>();

let messageIdCounter = 0;

/* ── Helpers ── */

function send(ws: WebSocket, msg: WSMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcastOnlineStatus(userId: string, role: string, online: boolean) {
  const type = online ? "user_online" : "user_offline";
  for (const [id, client] of connectedClients) {
    if (id !== userId) {
      send(client.ws, { type, payload: { userId, role } });
    }
  }
}

function storeMessage(recipientId: string, message: ChatMessage) {
  const existing = messageStore.get(recipientId) ?? [];
  existing.push(message);
  messageStore.set(recipientId, existing);
}

/* ── Connection Handler ── */

wss.on("connection", (ws, req) => {
  // Authenticate via query param
  let user: ConnectedUser | null = null;

  try {
    const url = new URL(req.url ?? "", `http://localhost:${port}`);
    const token = url.searchParams.get("token");

    if (token) {
      user = verifyToken(token);
    }
  } catch {
    // Invalid URL
  }

  if (!user) {
    send(ws, { type: "auth_error", payload: { message: "Invalid or missing token" } });
    ws.close(4001, "Unauthorized");
    return;
  }

  console.log(`[wsbackend] Client connected: ${user.id}`);

  // Register client
  const existingClient = connectedClients.get(user.id);
  if (existingClient) {
    existingClient.ws.close(4002, "Replaced by new connection");
  }

  connectedClients.set(user.id, { ws, user });

  // Send auth success
  send(ws, {
    type: "auth_success",
    payload: { userId: user.id, role: user.role, numericId: user.numericId },
  });

  // Send message history
  const history = messageStore.get(user.id) ?? [];
  send(ws, {
    type: "message_history",
    payload: { messages: history },
  });

  // Broadcast online status
  broadcastOnlineStatus(user.id, user.role, true);

  /* ── Message Handling ── */

  ws.on("message", (data) => {
    let msg: WSMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      send(ws, { type: "error", payload: { message: "Invalid JSON" } });
      return;
    }

    switch (msg.type) {
      case "send_message": {
        const { to, toRole, subject, body } = msg.payload as {
          to: string;
          toRole: string;
          subject: string;
          body: string;
        };

        if (!to || !subject || !body) {
          send(ws, { type: "error", payload: { message: "Missing required fields: to, subject, body" } });
          return;
        }

        const chatMessage: ChatMessage = {
          id: `msg-${++messageIdCounter}-${Date.now()}`,
          from: user!.id,
          fromRole: user!.role,
          to,
          toRole: toRole ?? "unknown",
          subject,
          body,
          timestamp: new Date().toISOString(),
        };

        // Store for recipient
        storeMessage(to, chatMessage);

        // Store for sender (sent folder)
        storeMessage(user!.id, chatMessage);

        // Deliver to recipient if online
        const recipientClient = connectedClients.get(to);
        if (recipientClient) {
          send(recipientClient.ws, {
            type: "new_message",
            payload: { message: chatMessage },
          });
        }

        // Acknowledge to sender
        send(ws, {
          type: "new_message",
          payload: { message: chatMessage, isSent: true },
        });

        console.log(`[wsbackend] Message from ${user!.id} to ${to}: ${subject}`);
        break;
      }

      default:
        send(ws, { type: "error", payload: { message: `Unknown message type: ${msg.type}` } });
    }
  });

  /* ── Disconnect ── */

  ws.on("close", () => {
    if (user) {
      console.log(`[wsbackend] Client disconnected: ${user.id}`);
      connectedClients.delete(user.id);
      broadcastOnlineStatus(user.id, user.role, false);
    }
  });

  ws.on("error", (err) => {
    console.error(`[wsbackend] WebSocket error for ${user?.id}:`, err.message);
  });
});

console.log(`[wsbackend] WebSocket server ready`);
