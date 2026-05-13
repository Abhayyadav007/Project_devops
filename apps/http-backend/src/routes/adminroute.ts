import { Router, Request, Response } from "express";
import { CreateAdminSchema, AdminSigninSchema, ChangepasswordSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backendcommon/config";
import { AdminAuthMiddleware, uppermanagementAuthMiddleware } from "../middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const AdminRouter: Router = Router();

AdminRouter.post("/signup", uppermanagementAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = CreateAdminSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  if (!req.uppermanagementId) {
    return res.status(401).json({ message: "Invalid upper management token" });
  }

  const { name, userId, password, email } = parsedData.data;

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { adminId: userId }
    });

    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        name,
        adminId: userId,
        password: hashedPassword,
        email,
        createdByUpperManagementId: req.uppermanagementId
      }
    });

    const token = jwt.sign(
      { adminId: admin.id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Admin created successfully",
      token
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

AdminRouter.post("/signin", async (req: Request, res: Response) => {
  const parsedData = AdminSigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  const { adminId, password } = parsedData.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { adminId }
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin.id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signin successful",
      token
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

AdminRouter.post("/changepassword", AdminAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = ChangepasswordSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input"
    });
  }

  if (!req.adminId) {
    return res.status(401).json({ message: "Invalid admin token" });
  }

  const { oldPassword, newPassword } = parsedData.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId }
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: req.adminId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Admin changepassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

AdminRouter.get("/teacher", AdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { createdByAdminId: req.adminId },
      select: { id: true, name: true, teacherId: true, email: true, CreatedAt: true }
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teachers" });
  }
});

AdminRouter.delete("/teacher/:id", AdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.teacher.delete({ where: { id, createdByAdminId: req.adminId } });
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting teacher" });
  }
});

AdminRouter.get("/student", AdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      where: { createdByAdminId: req.adminId },
      select: { id: true, name: true, studentId: true, CreatedAt: true }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

AdminRouter.delete("/student/:id", AdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.student.delete({ where: { id, createdByAdminId: req.adminId } });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student" });
  }
});
/* ── All users (for compose recipient lookup) ── */
AdminRouter.get("/users", AdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { createdByAdminId: req.adminId },
      select: { id: true, name: true, teacherId: true, email: true, CreatedAt: true }
    });
    const students = await prisma.student.findMany({
      where: { createdByAdminId: req.adminId },
      select: { id: true, name: true, studentId: true, CreatedAt: true }
    });
    res.json([...teachers, ...students]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});
/* ── Messages ── */
AdminRouter.get("/messages", AdminAuthMiddleware, async (req: Request, res: Response) => {
  const folder = (req.query.folder as string) || "inbox";
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    let messages;
    if (folder === "sent") {
      messages = await prisma.message.findMany({
        where: { senderRole: "admin", senderId: admin.id },
        orderBy: { createdAt: "desc" },
      });
    } else if (folder === "starred") {
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { recipientRole: "admin", recipientId: admin.id, starred: true },
            { senderRole: "admin", senderId: admin.id, starred: true },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // inbox
      messages = await prisma.message.findMany({
        where: { recipientRole: "admin", recipientId: admin.id },
        orderBy: { createdAt: "desc" },
      });
    }

    res.json(messages.map((m) => ({
      id: String(m.id),
      from: m.senderName,
      fromRole: m.senderRole,
      to: m.recipientName,
      toRole: m.recipientRole,
      subject: m.subject,
      body: m.body,
      timestamp: m.createdAt.toISOString(),
      read: m.read,
      starred: m.starred,
      folder: folder === "sent" ? "sent" : "inbox",
    })));
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

AdminRouter.post("/messages", AdminAuthMiddleware, async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ message: "to, subject, and body are required" });
  }
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await prisma.message.create({
      data: {
        senderRole: "admin",
        senderId: admin.id,
        senderName: admin.name,
        recipientRole: "unknown",
        recipientId: 0,
        recipientName: to,
        subject,
        body,
      },
    });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
});

export default AdminRouter;
