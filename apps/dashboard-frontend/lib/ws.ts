import { WS_BASE_URL } from "./constants";
import { getStoredToken } from "./auth";

export type WSMessageType =
  | "authenticate"
  | "auth_success"
  | "auth_error"
  | "send_message"
  | "new_message"
  | "message_history"
  | "user_online"
  | "user_offline"
  | "error";

export interface WSMessage {
  type: WSMessageType;
  payload: Record<string, unknown>;
}

export type WSEventHandler = (msg: WSMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<WSMessageType, WSEventHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const token = getStoredToken();
    if (!token) return;

    try {
      this.ws = new WebSocket(`${WS_BASE_URL}?token=${encodeURIComponent(token)}`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          const typeHandlers = this.handlers.get(msg.type);
          if (typeHandlers) {
            typeHandlers.forEach((handler) => handler(msg));
          }
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        // onclose will fire after this
      };
    } catch {
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(msg: WSMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  on(type: WSMessageType, handler: WSEventHandler) {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }

  off(type: WSMessageType, handler: WSEventHandler) {
    const existing = this.handlers.get(type) ?? [];
    this.handlers.set(type, existing.filter((h) => h !== handler));
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

let clientInstance: WebSocketClient | null = null;

export function getWSClient(): WebSocketClient {
  if (!clientInstance) {
    clientInstance = new WebSocketClient();
  }
  return clientInstance;
}
