import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Admin-only route. Middleware ensures only role === "admin" reaches these handlers.
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    const userEmail = request.headers.get('x-user-email');

    const users = await prisma.user.findMany({
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      totalUsers: users.length,
      adminCount: users.filter((u) => u.role === 'admin').length,
      ngoAccounts: users.filter((u) => u.role === 'ngo').length,
      viewers: users.filter((u) => u.role === 'user').length,
      totalNgos: await prisma.ngo.count(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Admin data accessed successfully',
        admin: {
          email: userEmail,
          role: userRole,
        },
        data: {
          users,
          statistics: stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin route error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// Update user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ success: false, message: 'userId and newRole are required' }, { status: 400 });
    }

    const validRoles = ['admin', 'user', 'ngo'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User role updated successfully by admin ${userEmail}`,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update user role' }, { status: 500 });
  }
}

// Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId query parameter is required' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: parseInt(userId, 10) } });

    return NextResponse.json(
      {
        success: true,
        message: `User deleted successfully by admin ${userEmail}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete user' }, { status: 500 });
  }
}
