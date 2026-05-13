import { Router, Request, Response } from "express";
import { CreateStudentSchema, StudentSigninScheam, ChangepasswordSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backendcommon/config";
import { AdminAuthMiddleware, studentAuthMiddleware } from "../middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const StudentRouter: Router = Router();

StudentRouter.post("/signup", AdminAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = CreateStudentSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  if (!req.adminId) {
    return res.status(401).json({ message: "Invalid admin token" });
  }

  const { name, userId, password } = parsedData.data;

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { studentId: userId }
    });

    if (existingStudent) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        name,
        studentId: userId,
        password: hashedPassword,
        createdByAdminId: req.adminId
      }
    });

    const token = jwt.sign(
      { userId: student.id, role: "student" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Student created successfully",
      token
    });
  } catch (error) {
    console.error("Student signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

StudentRouter.post("/signin", async (req: Request, res: Response) => {
  const parsedData = StudentSigninScheam.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  const { userId, password } = parsedData.data;

  try {
    const student = await prisma.student.findUnique({
      where: { studentId: userId }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: student.id, role: "student" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signin successful",
      token
    });
  } catch (error) {
    console.error("Student signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

StudentRouter.post("/changepassword", studentAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = ChangepasswordSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input"
    });
  }

  if (!req.userId) {
    return res.status(401).json({ message: "Invalid student token" });
  }

  const { oldPassword, newPassword } = parsedData.data;

  try {
    const student = await prisma.student.findUnique({
      where: { id: req.userId }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.student.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Student changepassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
/* ── Messages ── */
StudentRouter.get("/messages", studentAuthMiddleware, async (req: Request, res: Response) => {
  const folder = (req.query.folder as string) || "inbox";
  try {
    const s = await prisma.student.findUnique({ where: { id: req.userId } });
    if (!s) return res.status(404).json({ message: "Student not found" });

    let messages;
    if (folder === "sent") {
      messages = await prisma.message.findMany({ where: { senderRole: "student", senderId: s.id }, orderBy: { createdAt: "desc" } });
    } else if (folder === "starred") {
      messages = await prisma.message.findMany({ where: { OR: [{ recipientRole: "student", recipientId: s.id, starred: true }, { senderRole: "student", senderId: s.id, starred: true }] }, orderBy: { createdAt: "desc" } });
    } else {
      messages = await prisma.message.findMany({ where: { recipientRole: "student", recipientId: s.id }, orderBy: { createdAt: "desc" } });
    }

    res.json(messages.map((m) => ({ id: String(m.id), from: m.senderName, fromRole: m.senderRole, to: m.recipientName, toRole: m.recipientRole, subject: m.subject, body: m.body, timestamp: m.createdAt.toISOString(), read: m.read, starred: m.starred, folder: folder === "sent" ? "sent" : "inbox" })));
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

StudentRouter.post("/messages", studentAuthMiddleware, async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ message: "to, subject, and body are required" });
  try {
    const s = await prisma.student.findUnique({ where: { id: req.userId } });
    if (!s) return res.status(404).json({ message: "Student not found" });
    await prisma.message.create({ data: { senderRole: "student", senderId: s.id, senderName: s.name, recipientRole: "unknown", recipientId: 0, recipientName: to, subject, body } });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

/* ── Users ── */
StudentRouter.get("/users", studentAuthMiddleware, async (_req: Request, res: Response) => {
  res.json([]);
});

export default StudentRouter;
