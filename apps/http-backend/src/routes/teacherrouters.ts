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

export default TeacherRouter;
