import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Protected route - Requires valid JWT token (enforced by middleware)
 * Accessible to all authenticated users regardless of role
 * Returns the current user's data based on their token
 */
export async function GET(request: NextRequest) {
  try {
    // User info is validated by middleware and passed via headers
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'User information not found in request' },
        { status: 401 }
      );
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        organization: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true,
            tasks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return protected user data
    return NextResponse.json(
      {
        success: true,
        message: 'User data accessed successfully',
        user,
        sessionInfo: {
          userId: parseInt(userId),
          email: userEmail,
          role: userRole,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Users route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
