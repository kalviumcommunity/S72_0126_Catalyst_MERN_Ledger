import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';
import { taskSchema, taskUpdateSchema } from '@/lib/schemas';

const prisma = new PrismaClient();

/**
 * GET /api/tasks
 * Retrieve all tasks (or filter by project, status, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const hasTemplate = searchParams.get('hasTemplate');

    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId ? Number(projectId) : undefined,
        status: status || undefined,
        templateUrl: hasTemplate === 'true' ? { not: null } : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            isPublic: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task with Zod validation
 * 
 * Validates:
 * - title (min 3 chars)
 * - templateUrl (MUST be valid URL if provided) - KEY for reusability
 * - status (enum: pending, in-progress, completed, blocked)
 * - projectId (positive integer)
 * 
 * The templateUrl validation is CRITICAL for ensuring reusable resources
 * across NGOs and preventing broken links in the collaboration pipeline.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Zod
    const validatedData = taskSchema.parse(body);

    // Create task in database
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        templateUrl: validatedData.templateUrl,
        status: validatedData.status,
        priority: validatedData.priority,
        projectId: validatedData.projectId,
        assigneeId: validatedData.assigneeId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            isPublic: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Task created successfully',
        data: task,
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
    console.error('Error creating task:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create task',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks
 * Update an existing task with Zod validation
 * 
 * Special validation: If templateUrl is being updated, it MUST be a valid URL
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
          errors: [{ field: 'id', message: 'Task ID is required' }],
        },
        { status: 400 }
      );
    }

    // Validate update data using Zod
    const validatedData = taskUpdateSchema.parse(updateData);

    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: validatedData,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            isPublic: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
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

    console.error('Error updating task:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update task',
      },
      { status: 500 }
    );
  }
}
