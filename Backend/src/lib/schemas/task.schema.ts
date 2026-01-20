import { z } from 'zod';

/**
 * Task Schema - Validates reusable task templates for NGO workflows
 * 
 * Key Features:
 * - templateUrl: Must be a valid URL to ensure reusability across organizations
 * - Status tracking: Enables pipeline transparency
 * - Priority levels: Helps contributors identify urgent work
 * 
 * This schema prevents "garbage data" in the reusability pipeline
 */
export const taskSchema = z.object({
  title: z.string().min(3, { message: "Task title must be at least 3 characters" }),
  description: z.string().optional(),
  templateUrl: z.string().url({ message: "Template URL must be a valid URL format" }).optional(),
  status: z.enum(["pending", "in-progress", "completed", "blocked"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  projectId: z.number().int().positive({ message: "Project ID must be a positive integer" }),
  assigneeId: z.number().int().positive({ message: "Assignee ID must be a positive integer" }).optional(),
}).refine(
  (data) => {
    // If status is completed, ensure there's a description or template URL
    if (data.status === "completed") {
      return data.description || data.templateUrl;
    }
    return true;
  },
  {
    message: "Completed tasks must have a description or template URL for documentation",
    path: ["description"],
  }
);

/**
 * TypeScript type inferred from Zod schema
 */
export type TaskInput = z.infer<typeof taskSchema>;

/**
 * Schema for updating task data (all fields optional)
 */
export const taskUpdateSchema = taskSchema.partial();

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

/**
 * Schema specifically for validating templateUrl
 * Used when contributors share reusable resources
 */
export const templateUrlSchema = z.object({
  templateUrl: z.string().url({ message: "Must be a valid URL (e.g., https://example.com/template)" }),
});

export type TemplateUrlInput = z.infer<typeof templateUrlSchema>;
