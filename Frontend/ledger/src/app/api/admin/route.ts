import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Admin-only route - Protected by middleware
 * Only users with 'admin' role can access this endpoint
 * 
 * This endpoint allows admins to:
 * - View all users in the system
 * - See user statistics
 * - Manage user roles (future enhancement)
 */
export async function GET(request: NextRequest) {
  try {
    // User info is already validated by middleware
    // Extract from headers added by middleware
    const userRole = request.headers.get('x-user-role');
    const userEmail = request.headers.get('x-user-email');

    // Fetch all users (admin privilege)
    const users = await prisma.user.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user statistics
    const stats = {
      totalUsers: users.length,
      adminCount: users.filter((u: { role: string }) => u.role === 'admin').length,
      userCount: users.filter((u: { role: string }) => u.role === 'user').length,
      otherRoles: users.filter((u: { role: string }) => u.role !== 'admin' && u.role !== 'user').length,
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
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Update user role (admin only)
 * Example: PATCH /api/admin { "userId": 1, "newRole": "admin" }
 */
export async function PATCH(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json(
        {
          success: false,
          message: 'userId and newRole are required',
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'user', 'contributor', 'project_manager'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
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
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user role',
      },
      { status: 500 }
    );
  }
}

/**
 * Delete user (admin only)
 * Example: DELETE /api/admin?userId=5
 */
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'userId query parameter is required',
        },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User deleted successfully by admin ${userEmail}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}
