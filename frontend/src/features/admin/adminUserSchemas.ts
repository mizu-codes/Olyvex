import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, { error: "Name is required" })
  .pipe(
    z
      .string()
      .min(2, { error: "Name must be at least 2 characters" })
      .max(50, { error: "Name must be 50 characters or less" }),
  );

const emailSchema = z
  .string()
  .trim()
  .min(1, { error: "Email is required" })
  .pipe(
    z.email({
      error: "Enter a valid email address",
    }),
  );

const roleSchema = z.enum(["user", "admin"]);

const passwordSchema = z
  .string()
  .min(1, { error: "Password is required" })
  .pipe(
    z.string().min(8, {
      error: "Password must be at least 8 characters",
    }),
  );

export const createAdminUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

export type CreateAdminUserFormValues = z.infer<typeof createAdminUserSchema>;

export const updateAdminUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: roleSchema,
});

export type UpdateAdminUserFormValues = z.infer<typeof updateAdminUserSchema>;
