import { z } from "zod";

const profileNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Name cannot be empty" })
  .min(2, { error: "Name must be at least 2 characters" })
  .max(50, { error: "Name must be 50 characters or less" });

const profileEmailSchema = z
  .string()
  .trim()
  .min(1, { error: "Email cannot be empty" })
  .toLowerCase()
  .pipe(
    z.email({
      error: "Please enter a valid email address",
    }),
  );

export const updateProfileSchema = z
  .object({
    name: profileNameSchema.optional(),
    email: profileEmailSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    error: "Nothing to update",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
