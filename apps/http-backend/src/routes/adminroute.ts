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

export default AdminRouter;
