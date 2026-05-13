import { Router, Request, Response } from "express";
import { ValidatorSchema, ValidatorSigninSchema, ChangepasswordSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backendcommon/config";
import { ValidatorAuthMiddleware } from "../middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const ValidatorRouter: Router = Router();

function isBcryptHash(value: string) {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
}

ValidatorRouter.post('/signup', async (req: Request, res: Response) => {
  const parsedData = ValidatorSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(401).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }
  const { name, userId, password, email } = parsedData.data;

  try {
    const existingValidator = await prisma.validator.findFirst({
      where: {
        OR: [{ validatorId: userId }, { email }],
      },
    });
    if (existingValidator) {
      return res.status(409).json({ message: "Validator already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const validator = await prisma.validator.create({
      data: {
        name,
        validatorId: userId,
        password: hashedPassword,
        email
      }
    });
    const token = jwt.sign({
      validatorId: validator.id, role: 'validator'
    }, JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.status(201).json({
      message: "Validator created Successfully",
      token
    });
  } catch (error) {
    console.error("Validator signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

ValidatorRouter.post("/signin", async (req: Request, res: Response) => {
  const parsedData = ValidatorSigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedData.error
    });
  }

  const { userId, password } = parsedData.data;

  try {
    const validator = await prisma.validator.findUnique({
      where: { validatorId: userId }
    });

    if (!validator) {
      return res.status(404).json({ message: "Validator not found" });
    }

    const isPasswordValid = isBcryptHash(validator.password)
      ? await bcrypt.compare(password, validator.password)
      : validator.password === password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!isBcryptHash(validator.password)) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.validator.update({
        where: { id: validator.id },
        data: { password: hashedPassword },
      });
    }

    const token = jwt.sign(
      { validatorId: validator.id, role: "validator" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signin successful",
      token
    });
  } catch (error) {
    console.error("Validator signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

ValidatorRouter.post("/changepassword", ValidatorAuthMiddleware, async (req: Request, res: Response) => {
  const parsedData = ChangepasswordSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid Input"
    });
  }

  if (!req.validatorId) {
    return res.status(401).json({ message: "Invalid validator token" });
  }

  const { oldPassword, newPassword } = parsedData.data;

  try {
    const validator = await prisma.validator.findUnique({
      where: { id: req.validatorId }
    });

    if (!validator) {
      return res.status(404).json({ message: "Validator not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, validator.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.validator.update({
      where: { id: req.validatorId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Validator changepassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default ValidatorRouter;
