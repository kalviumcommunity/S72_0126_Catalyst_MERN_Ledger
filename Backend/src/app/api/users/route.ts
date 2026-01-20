import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';
import { userSchema, userUpdateSchema } from '../../../lib/schemas';
import redis from '../../../lib/redis';

const router = Router();
const prisma = new PrismaClient();
const CACHE_KEY_USERS_LIST = 'users:list';

/**
 * GET /api/users
 * Retrieve all users with optional filtering and caching
 */
router.get('/', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    // Check Redis cache first
    const cachedUsers = await redis.get(CACHE_KEY_USERS_LIST);
    if (cachedUsers) {
      const latency = Date.now() - start;
      console.log(`[GET /api/users] Cache Status: HIT | Latency: ${latency}ms`);
      return res.json({
        success: true,
        source: 'cache',
        latency: `${latency}ms`,
        data: JSON.parse(cachedUsers),
      });
    }

    console.log('Cache Miss');
    const role = req.query.role as string | undefined;
    const organization = req.query.organization as string | undefined;

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

    // Store result in Redis with a 60-second TTL
    await redis.set(CACHE_KEY_USERS_LIST, JSON.stringify(users), 'EX', 60);

    const latency = Date.now() - start;
    console.log(`[GET /api/users] Cache Status: MISS | Latency: ${latency}ms`);

    return res.json({
      success: true,
      source: 'database',
      latency: `${latency}ms`,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

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
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    const validatedData = userSchema.parse(req.body);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        organization: validatedData.organization,
        role: validatedData.role,
      },
    });

    // Invalidate the cache
    await redis.del(CACHE_KEY_USERS_LIST);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
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
