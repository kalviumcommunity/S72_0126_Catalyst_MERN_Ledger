/**
 * Shared Zod Schemas for NGO Collaboration Platform
 * 
 * These schemas provide validation across both client and server,
 * preventing duplicate work by ensuring data consistency.
 * 
 * Benefits:
 * 1. Single source of truth for validation rules
 * 2. Type safety with TypeScript inference
 * 3. Reusable validation logic
 * 4. Clear error messages for developers
 */

export * from './user.schema';
export * from './project.schema';
export * from './task.schema';
