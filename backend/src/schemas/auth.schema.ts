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
  .min(1, { error: "Email is required" })
  .toLowerCase()
  .pipe(
    z.email({
      error: "Invalid email format",
    }),
  );

const passwordSchema = z
  .string()
  .min(1, { error: "Password is required" })
  .min(8, {
    error: "Password must be at least 8 characters",
  });

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, {
    error: "Password is required",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
