/**
 * Validation Utilities
 * 
 * Helper functions for working with Zod validation across the application
 */

import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Formats Zod errors into a consistent API response structure
 * 
 * @param error - ZodError from validation failure
 * @returns Formatted error array with field and message
 */
export function formatZodErrors(error: ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Creates a standardized validation error response
 * 
 * @param error - ZodError from validation failure
 * @returns NextResponse with 400 status and formatted errors
 */
export function createValidationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation Error',
      errors: formatZodErrors(error),
    },
    { status: 400 }
  );
}

/**
 * Creates a standardized success response
 * 
 * @param data - Response data
 * @param message - Success message
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with formatted success response
 */
export function createSuccessResponse(
  data: any,
  message: string = 'Success',
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Creates a standardized error response
 * 
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @returns NextResponse with formatted error response
 */
export function createErrorResponse(
  message: string = 'An error occurred',
  status: number = 500
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

/**
 * Validates data against a Zod schema with safeParse
 * Returns { success: true, data } or { success: false, errors }
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result object
 */
export function validateData<T>(schema: any, data: unknown) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true as const,
      data: result.data as T,
    };
  }
  
  return {
    success: false as const,
    errors: formatZodErrors(result.error),
  };
}
