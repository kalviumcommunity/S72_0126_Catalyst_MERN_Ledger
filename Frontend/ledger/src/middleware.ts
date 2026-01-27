import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip non-API or auth routes
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Public NGO listing (view-only)
  if (pathname.startsWith('/api/ngos') && (method === 'GET' || method === 'OPTIONS')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authorization token required. Please include Bearer token in Authorization header.' },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Admin-only APIs
  if (pathname.startsWith('/api/admin') && decoded.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Access denied. Admin privileges required.', userRole: decoded.role, requiredRole: 'admin' },
      { status: 403 }
    );
  }

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

export const config = {
  matcher: '/api/:path*',
};

