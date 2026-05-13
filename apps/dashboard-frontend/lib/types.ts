/** Shared frontend types – no mock data */

export interface EntityRecord {
  id: number;
  name: string;
  email?: string;
  teacherId?: number;
  studentId?: number;
  adminId?: number;
  upperManagementId?: number;
  validatorId?: number;
  CreatedAt?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  toRole: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "drafts" | "trash";
}
