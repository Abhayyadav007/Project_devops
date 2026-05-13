import { z } from "zod";

// Signin Schema

export const StudentSigninScheam = z.object({
  userId: z.number(),
  password: z.string().min(6)
})

export const TeacherSigininSchema = z.object({
  teacherId: z.number(),
  password: z.string().min(6)
})

export const AdminSigninSchema = z.object({
  adminId: z.number(),
  password: z.string().min(6)
})

export const uppermanagementSigninSchema = z.object({
  uppermanagementId: z.number(),
  password: z.string().min(6),
})


export const ValidatorSigninSchema = z.object({
  userId: z.number(),
  password: z.string().min(6),
})

//signup Schema 

export const CreateStudentSchema = z.object({
  name: z.string().min(1),
  userId: z.number(),
  password: z.string().min(6),
  email: z.email({ error: "Invalid email address" }),
})

export const CreateTeacherSchema = z.object({
  name: z.string().min(1),
  userId: z.number(),
  password: z.string().min(6),
  email: z.email("Invalid email address")
})

export const CreateAdminSchema = z.object({
  name: z.string().min(1),
  userId: z.number(),
  password: z.string().min(6),
  email: z.email({ error: "Invalid email address" }),
})

export const CreateUppermanagementSchema = z.object({
  name: z.string().min(1),
  userId: z.number(),
  password: z.string().min(6),
  email: z.email({ error: "Invalid email address" }),
})

export const ValidatorSchema = z.object({
  name: z.string().min(1),
  userId: z.number(),
  password: z.string().min(6),
  email: z.email({ error: "Invalid email address" }),
})


export const ChangepasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

