import jwt from "jsonwebtoken";
import type { ConnectedUser } from "./types.js";

const JWT_SECRET = process.env.JWT_SECRET || "123123";

/**
 * Verify a JWT token and extract user identity.
 * Returns null if the token is invalid.
 */
export function verifyToken(token: string): ConnectedUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    const role = decoded.role as string | undefined;

    if (!role) return null;

    let numericId: number | undefined;

    switch (role) {
      case "validator":
        numericId = (decoded.validatorId ?? decoded.ValidatorId) as number | undefined;
        break;
      case "uppermanagement":
        numericId = decoded.uppermanagementId as number | undefined;
        break;
      case "admin":
        numericId = decoded.adminId as number | undefined;
        break;
      case "teacher":
        numericId = decoded.teacherId as number | undefined;
        break;
      case "student":
        numericId = decoded.userId as number | undefined;
        break;
      default:
        return null;
    }

    if (!numericId) return null;

    return {
      id: `${role}:${numericId}`,
      role,
      numericId,
    };
  } catch {
    return null;
  }
}
