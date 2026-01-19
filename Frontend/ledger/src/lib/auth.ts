import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';

/**
 * Authorization result containing user info or error details
 */
export interface AuthResult {
  success: boolean;
  userId?: number;
  email?: string;
  role?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Middleware to validate JWT token and extract user information
 * Returns user details if token is valid, or error information if not
 */
export function validateToken(request: NextRequest): AuthResult {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      error: 'Authorization token required',
      statusCode: 401,
    };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      success: false,
      error: 'Invalid or expired token',
      statusCode: 401,
    };
  }

  return {
    success: true,
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
}

/**
 * Check if user has required role for access
 * Implements role-based access control (RBAC)
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Middleware to enforce role-based access control
 * Returns error response if user doesn't have required role
 */
export function requireRole(
  request: NextRequest,
  requiredRoles: string[]
): { authorized: boolean; response?: NextResponse; authResult?: AuthResult } {
  const authResult = validateToken(request);

  if (!authResult.success) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.statusCode }
      ),
    };
  }

  if (!authResult.role || !hasRole(authResult.role, requiredRoles)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          message: 'Access denied. Insufficient permissions.',
          requiredRoles,
          userRole: authResult.role,
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    authResult,
  };
}

/**
 * Extract user info from request for use in route handlers
 * Assumes token has already been validated
 */
export function getUserFromRequest(request: NextRequest): AuthResult {
  return validateToken(request);
}
