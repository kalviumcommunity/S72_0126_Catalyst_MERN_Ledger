import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';
import { projectSchema, projectUpdateSchema } from '@/lib/schemas';

const prisma = new PrismaClient();

/**
 * GET /api/projects
 * Retrieve all projects (or filter by public visibility)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('isPublic');

    const projects = await prisma.project.findMany({
      where: isPublic !== null ? { isPublic: isPublic === 'true' } : undefined,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            organization: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch projects',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project with Zod validation
 * 
 * Validates:
 * - title (min 5 chars)
 * - description (optional)
 * - isPublic (boolean, default true)
 * - ownerId (positive integer)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Zod
    const validatedData = projectSchema.parse(body);

    // Create project in database
    const project = await prisma.project.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        isPublic: validatedData.isPublic,
        status: validatedData.status,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : new Date(),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        ownerId: validatedData.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            organization: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: project,
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

    // Handle other errors
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create project',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects
 * Update an existing project with Zod validation
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
          errors: [{ field: 'id', message: 'Project ID is required' }],
        },
        { status: 400 }
      );
    }

    // Validate update data using Zod
    const validatedData = projectUpdateSchema.parse(updateData);

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            organization: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
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

    console.error('Error updating project:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update project',
      },
      { status: 500 }
    );
  }
}
