import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { userSchema } from '../../../lib/schemas';
import redis from '../../../lib/redis';

const router = Router();

// Create PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CACHE_KEY_USERS_LIST = 'users:list';

/**
 * GET /api/users
 * Retrieve all users with caching
 */
router.get('/', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    // Check Redis cache first
    const cachedUsers = await redis.get(CACHE_KEY_USERS_LIST);
    if (cachedUsers) {
      const latency = Date.now() - start;
      console.log(`✅ [GET /api/users] Cache Status: HIT | Latency: ${latency}ms`);
      return res.json({
        success: true,
        source: 'cache',
        latency: `${latency}ms`,
        data: JSON.parse(cachedUsers),
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        organization: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Store result in Redis with a 60-second TTL
    await redis.set(CACHE_KEY_USERS_LIST, JSON.stringify(users), 'EX', 60);

    const latency = Date.now() - start;
    console.log(`📊 [GET /api/users] Cache Status: MISS | Latency: ${latency}ms`);

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
 * Create a new user with cache invalidation
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = userSchema.parse(req.body);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        organization: validatedData.organization,
        role: validatedData.role,
      },
    });

    // Invalidate the cache
    console.log('🗑️  Cache invalidated: users:list');
    await redis.del(CACHE_KEY_USERS_LIST);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.errors,
      });
    }

    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
});

export default router;
