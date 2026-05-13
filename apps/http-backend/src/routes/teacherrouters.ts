import { Router, Request, Response } from "express";
import { CreateTeacherSchema, TeacherSigininSchema, ChangepasswordSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backendcommon/config";
import { AdminAuthMiddleware, TeacherAuthMiddleware } from "../middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const TeacherRouter: Router = Router();

TeacherRouter.post("/signup", AdminAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = CreateTeacherSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  const { name, userId, password, email } = parsedData.data;
  if (!req.adminId) {
    return res.status(401).json({ message: "Invalid admin token" });
  }

  try {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { teacherId: userId }
    });

    if (existingTeacher) {
      return res.status(409).json({ message: "Teacher already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        name,
        teacherId: userId,
        password: hashedPassword,
        email,
        createdByAdminId: req.adminId
      }
    });

    const token = jwt.sign(
      { teacherId: teacher.id, role: "teacher" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Teacher created successfully",
      token
    });
  } catch (error) {
    console.error("Teacher signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

TeacherRouter.post("/signin", async (req: Request, res: Response) => {
  const parsedData = TeacherSigininSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  const { teacherId, password } = parsedData.data;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { teacherId }
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { teacherId: teacher.id, role: "teacher" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signin successful",
      token
    });
  } catch (error) {
    console.error("Teacher signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

TeacherRouter.post("/changepassword", TeacherAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = ChangepasswordSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input"
    });
  }

  const { oldPassword, newPassword } = parsedData.data;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.teacherId }
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, teacher.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.teacher.update({
      where: { id: req.teacherId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Teacher changepassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
/* ── Messages ── */
TeacherRouter.get("/messages", TeacherAuthMiddleware, async (req: Request, res: Response) => {
  const folder = (req.query.folder as string) || "inbox";
  try {
    const t = await prisma.teacher.findUnique({ where: { id: req.teacherId } });
    if (!t) return res.status(404).json({ message: "Teacher not found" });

    let messages;
    if (folder === "sent") {
      messages = await prisma.message.findMany({ where: { senderRole: "teacher", senderId: t.id }, orderBy: { createdAt: "desc" } });
    } else if (folder === "starred") {
      messages = await prisma.message.findMany({ where: { OR: [{ recipientRole: "teacher", recipientId: t.id, starred: true }, { senderRole: "teacher", senderId: t.id, starred: true }] }, orderBy: { createdAt: "desc" } });
    } else {
      messages = await prisma.message.findMany({ where: { recipientRole: "teacher", recipientId: t.id }, orderBy: { createdAt: "desc" } });
    }

    res.json(messages.map((m) => ({ id: String(m.id), from: m.senderName, fromRole: m.senderRole, to: m.recipientName, toRole: m.recipientRole, subject: m.subject, body: m.body, timestamp: m.createdAt.toISOString(), read: m.read, starred: m.starred, folder: folder === "sent" ? "sent" : "inbox" })));
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

TeacherRouter.post("/messages", TeacherAuthMiddleware, async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ message: "to, subject, and body are required" });
  try {
    const t = await prisma.teacher.findUnique({ where: { id: req.teacherId } });
    if (!t) return res.status(404).json({ message: "Teacher not found" });
    await prisma.message.create({ data: { senderRole: "teacher", senderId: t.id, senderName: t.name, recipientRole: "unknown", recipientId: 0, recipientName: to, subject, body } });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

/* ── Users ── */
TeacherRouter.get("/users", TeacherAuthMiddleware, async (_req: Request, res: Response) => {
  res.json([]);
});

export default TeacherRouter;
