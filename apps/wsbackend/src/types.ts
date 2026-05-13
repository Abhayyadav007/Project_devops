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

export interface ChatMessage {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  toRole: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface ConnectedUser {
  id: string;
  role: string;
  numericId: number;
}
