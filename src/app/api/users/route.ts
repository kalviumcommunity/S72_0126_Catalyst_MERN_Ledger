import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';
import { userSchema, userUpdateSchema } from '@/lib/schemas';

const prisma = new PrismaClient();

/**
 * GET /api/users
 * Retrieve all users with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const organization = searchParams.get('organization');

    const users = await prisma.user.findMany({
      where: {
        role: role || undefined,
        organization: organization || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        organization: true,
        role: true,
        createdAt: true,
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

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user with Zod validation
 * 
 * Validates:
 * - email (must be valid email format)
 * - name (required)
 * - organization (optional)
 * - role (defaults to "contributor")
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Zod
    const validatedData = userSchema.parse(body);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        organization: validatedData.organization,
        role: validatedData.role,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          message: 'Validation Error',
          errors,
        },
        { status: 400 }
      );
    }

    // Handle unique constraint violations (duplicate email)
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation Error',
          errors: [{ field: 'email', message: 'Email already exists' }],
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users
 * Update an existing user with Zod validation
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation Error',
          errors: [{ field: 'id', message: 'User ID is required' }],
        },
        { status: 400 }
      );
    }

    // Validate update data using Zod
    const validatedData = userUpdateSchema.parse(updateData);

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          message: 'Validation Error',
          errors,
        },
        { status: 400 }
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
      },
      { status: 500 }
    );
  }
}
