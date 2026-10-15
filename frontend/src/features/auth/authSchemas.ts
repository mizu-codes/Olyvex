import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required" })
    .pipe(
      z.email({
        error: "Please enter a valid email address",
      }),
    ),

  password: z.string().min(1, { error: "Password is required" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .min(2, { error: "Name must be at least 2 characters" })
    .max(50, { error: "Name must be 50 characters or less" }),

  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required" })
    .pipe(
      z.email({
        error: "Please enter a valid email address",
      }),
    ),

  password: z
    .string()
    .min(1, { error: "Password is required" })
    .min(8, { error: "Password must be at least 8 characters" }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileSchema = registerSchema.pick({
  name: true,
  email: true,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
