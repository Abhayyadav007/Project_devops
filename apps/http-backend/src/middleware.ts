import jwt from "jsonwebtoken";

import { NextFunction, Request, Response } from "express";

import { JWT_SECRET } from "@repo/backendcommon/config";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      teacherId?: number;
      adminId?: number;
      uppermanagementId?: number;
      validatorId?: number;
    }
  }
}

const extractBearerToken = (req: Request) => req.header("authorization")?.replace("Bearer ", "").trim();

export const studentAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string
    };
    if (decoded.role !== "student") {
      return res.status(403).json({
        message: "Access denied. Student only."
      });
    }
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({
      message: "Invalid or expired token "
    });
  }
};

export const TeacherAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      teacherId: number;
      role: string
    };
    if (decoded.role !== "teacher") {
      return res.status(403).json({
        message: "Access denied. Teacher only."
      });
    }
    req.teacherId = decoded.teacherId;
    next();
  } catch (e) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};


export const AdminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      adminId: number;
      role: string
    };
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only."
      });
    }
    req.adminId = decoded.adminId;
    next();
  } catch (e) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}


export const uppermanagementAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      uppermanagementId: number;
      role: string
    };
    if (decoded.role !== "uppermanagement") {
      return res.status(403).json({
        message: "Access denied. Upper management only."
      });
    }
    req.uppermanagementId = decoded.uppermanagementId;
    next();
  } catch (e) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}



export const ValidatorAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      validatorId?: number;
      ValidatorId?: number;
      role: string;
    };
    if (decoded.role !== "validator") {
      return res.status(403).json({
        message: "Access denied. Validator only."
      });
    }
    req.validatorId = decoded.validatorId ?? decoded.ValidatorId;
    if (!req.validatorId) {
      return res.status(401).json({
        message: "Invalid validator token"
      });
    }
    next();
  } catch (e) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

