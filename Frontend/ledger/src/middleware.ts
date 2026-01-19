import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

/**
 * Next.js Middleware for Route Protection and RBAC
 * 
 * This middleware runs before requests are processed and validates:
 * 1. JWT token presence and validity
 * 2. User role authorization for protected routes
 * 
 * Flow:
 * Request → Check Token → Verify Role → Allow/Deny Access
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-API routes and public routes
  if (!pathname.startsWith('/api/') || 
      pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Extract and validate token
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Authorization token required. Please include Bearer token in Authorization header.',
      },
      { status: 401 }
    );
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or expired token',
      },
      { status: 401 }
    );
  }

  // Role-Based Access Control (RBAC)
  // Admin-only routes
  if (pathname.startsWith('/api/admin')) {
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied. Admin privileges required.',
          userRole: decoded.role,
          requiredRole: 'admin',
        },
        { status: 403 }
      );
    }
  }

  // If all checks pass, allow the request to proceed
  // Attach user info to headers for route handlers to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', decoded.userId.toString());
  requestHeaders.set('x-user-email', decoded.email);
  requestHeaders.set('x-user-role', decoded.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configure which routes this middleware should run on
 * Matches all API routes except auth routes
 */
export const config = {
  matcher: [
    '/api/:path*',
    // Exclude auth routes
    '!/api/auth/:path*',
  ],
};
