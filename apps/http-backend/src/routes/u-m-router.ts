import { Router, Request, Response } from "express";
import { CreateUppermanagementSchema, uppermanagementSigninSchema, ChangepasswordSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backendcommon/config";
import { ValidatorAuthMiddleware, uppermanagementAuthMiddleware } from "../middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UpperManagementRouter: Router = Router();

UpperManagementRouter.post("/signup", ValidatorAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = CreateUppermanagementSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  if (!req.validatorId) {
    return res.status(401).json({ message: "Invalid validator token" });
  }

  const { name, userId, password, email } = parsedData.data;

  try {
    const existingUpperManagement = await prisma.upperManagement.findUnique({
      where: { upperManagementId: userId }
    });

    if (existingUpperManagement) {
      return res.status(409).json({ message: "Upper management already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const upperManagement = await prisma.upperManagement.create({
      data: {
        name,
        upperManagementId: userId,
        password: hashedPassword,
        email,
        createdByValidatorId: req.validatorId
      }
    });

    const token = jwt.sign(
      { uppermanagementId: upperManagement.id, role: "uppermanagement" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Upper management created successfully",
      token
    });
  } catch (error) {
    console.error("Upper management signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

UpperManagementRouter.post("/signin", async (req: Request, res: Response) => {
  const parsedData = uppermanagementSigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  const { uppermanagementId, password } = parsedData.data;

  try {
    const upperManagement = await prisma.upperManagement.findUnique({
      where: { upperManagementId: uppermanagementId }
    });

    if (!upperManagement) {
      return res.status(404).json({ message: "Upper management not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, upperManagement.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { uppermanagementId: upperManagement.id, role: "uppermanagement" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signin successful",
      token
    });
  } catch (error) {
    console.error("Upper management signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

UpperManagementRouter.post("/changepassword", uppermanagementAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = ChangepasswordSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input"
    });
  }

  if (!req.uppermanagementId) {
    return res.status(401).json({ message: "Invalid upper management token" });
  }

  const { oldPassword, newPassword } = parsedData.data;

  try {
    const upperManagement = await prisma.upperManagement.findUnique({
      where: { id: req.uppermanagementId }
    });

    if (!upperManagement) {
      return res.status(404).json({ message: "Upper management not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, upperManagement.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.upperManagement.update({
      where: { id: req.uppermanagementId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Upper management changepassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

UpperManagementRouter.get("/admin", uppermanagementAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      where: { createdByUpperManagementId: req.uppermanagementId },
      select: { id: true, name: true, adminId: true, email: true, CreatedAt: true }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins" });
  }
});

UpperManagementRouter.delete("/admin/:id", uppermanagementAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.admin.delete({ where: { id, createdByUpperManagementId: req.uppermanagementId } });
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin" });
  }
});
/* ── All users (for compose recipient lookup) ── */
UpperManagementRouter.get("/users", uppermanagementAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      where: { createdByUpperManagementId: req.uppermanagementId },
      select: { id: true, name: true, adminId: true, email: true, CreatedAt: true }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});
/* ── Messages ── */
UpperManagementRouter.get("/messages", uppermanagementAuthMiddleware, async (req: Request, res: Response) => {
  const folder = (req.query.folder as string) || "inbox";
  try {
    const um = await prisma.upperManagement.findUnique({ where: { id: req.uppermanagementId } });
    if (!um) return res.status(404).json({ message: "Upper Management not found" });

    let messages;
    if (folder === "sent") {
      messages = await prisma.message.findMany({ where: { senderRole: "uppermanagement", senderId: um.id }, orderBy: { createdAt: "desc" } });
    } else if (folder === "starred") {
      messages = await prisma.message.findMany({ where: { OR: [{ recipientRole: "uppermanagement", recipientId: um.id, starred: true }, { senderRole: "uppermanagement", senderId: um.id, starred: true }] }, orderBy: { createdAt: "desc" } });
    } else {
      messages = await prisma.message.findMany({ where: { recipientRole: "uppermanagement", recipientId: um.id }, orderBy: { createdAt: "desc" } });
    }

    res.json(messages.map((m) => ({ id: String(m.id), from: m.senderName, fromRole: m.senderRole, to: m.recipientName, toRole: m.recipientRole, subject: m.subject, body: m.body, timestamp: m.createdAt.toISOString(), read: m.read, starred: m.starred, folder: folder === "sent" ? "sent" : "inbox" })));
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

UpperManagementRouter.post("/messages", uppermanagementAuthMiddleware, async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ message: "to, subject, and body are required" });
  try {
    const um = await prisma.upperManagement.findUnique({ where: { id: req.uppermanagementId } });
    if (!um) return res.status(404).json({ message: "Upper Management not found" });
    await prisma.message.create({ data: { senderRole: "uppermanagement", senderId: um.id, senderName: um.name, recipientRole: "unknown", recipientId: 0, recipientName: to, subject, body } });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

export default UpperManagementRouter;
