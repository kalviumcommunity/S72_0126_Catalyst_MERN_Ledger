import { z } from 'zod';

/**
 * User Schema - Validates user data for NGO contributors and staff
 * Ensures valid email format and name presence for proper attribution
 */
export const userSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  name: z.string().min(1, { message: "Name is required" }),
  organization: z.string().optional(),
  role: z.string().default("contributor"),
});

/**
 * TypeScript type inferred from Zod schema
 * Use this type across your application for type safety
 */
export type UserInput = z.infer<typeof userSchema>;

/**
 * Schema for updating user data (all fields optional)
 */
export const userUpdateSchema = userSchema.partial();

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
