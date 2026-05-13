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

export default UpperManagementRouter;
