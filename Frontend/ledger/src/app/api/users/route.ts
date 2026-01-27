import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Protected route - requires middleware to have validated the JWT and injected headers.
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'User information not found in request' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ngo: {
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User data accessed successfully',
        user,
        sessionInfo: {
          userId: parseInt(userId, 10),
          email: userEmail,
          role: userRole,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Users route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
