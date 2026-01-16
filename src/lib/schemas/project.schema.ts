import { z } from 'zod';

/**
 * Project Schema - Validates NGO project data
 * Ensures transparency and visibility across organizations
 * 
 * Key Features:
 * - isPublic (default true): Enables cross-organization visibility
 * - Minimum name length: Prevents unclear project titles
 */
export const projectSchema = z.object({
  title: z.string().min(5, { message: "Project title must be at least 5 characters" }),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  status: z.enum(["active", "completed", "archived", "paused"]).default("active"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ownerId: z.number().int().positive({ message: "Owner ID must be a positive integer" }),
}).refine(
  (data) => {
    // Validate that endDate is after startDate if both are provided
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

/**
 * TypeScript type inferred from Zod schema
 */
export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Schema for updating project data (all fields optional)
 */
export const projectUpdateSchema = projectSchema.partial();

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
