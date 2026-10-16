import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, { error: "Name cannot be empty" })
  .min(2, { error: "Name must be at least 2 characters" })
  .max(50, { error: "Name must be 50 characters or less" });

const emailSchema = z
  .string()
  .trim()
  .min(1, { error: "Email cannot be empty" })
  .toLowerCase()
  .pipe(z.email({ error: "Invalid email format" }));

const passwordSchema = z
  .string()
  .min(1, { error: "Password is required" })
  .min(8, { error: "Password must be at least 8 characters" });

const roleSchema = z.enum(["user", "admin"]);

export const createAdminUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.optional(),
});

export const updateAdminUserSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    role: roleSchema.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.email !== undefined ||
      data.role !== undefined,
    { error: "Nothing to update" },
  );
