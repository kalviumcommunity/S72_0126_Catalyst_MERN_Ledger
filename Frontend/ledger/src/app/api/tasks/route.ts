import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/tasks - Create a new task with OTP for an NGO location
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== 'ngo') {
      return NextResponse.json({ error: 'Only NGO accounts can create tasks' }, { status: 403 });
    }

    const body = await request.json();
    const { ngoId } = body;

    if (!ngoId) {
      return NextResponse.json({ error: 'NGO ID is required' }, { status: 400 });
    }

    // Verify the NGO belongs to this user
    const ngo = await prisma.ngo.findFirst({
      where: { id: ngoId, accountOwnerId: user.id, isActive: true },
    });

    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found or not owned by you' }, { status: 404 });
    }

    // Deactivate any existing active tasks for this NGO
    await prisma.task.updateMany({
      where: { ngoId, isActive: true },
      data: { isActive: false },
    });

    // Create new task with OTP (expires in 24 hours)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const task = await prisma.task.create({
      data: {
        ngoId,
        otp,
        expiresAt,
      },
    });

    return NextResponse.json({
      message: 'Task created successfully',
      task: {
        id: task.id,
        otp: task.otp,
        expiresAt: task.expiresAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// GET /api/tasks - Get active tasks for NGO's locations
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { ngos: true },
    });

    if (!user || user.role !== 'ngo') {
      return NextResponse.json({ error: 'Only NGO accounts can view tasks' }, { status: 403 });
    }

    const ngoIds = user.ngos.map(ngo => ngo.id);

    const tasks = await prisma.task.findMany({
      where: {
        ngoId: { in: ngoIds },
        isActive: true,
      },
      include: {
        ngo: { select: { id: true, name: true, location: true } },
        _count: { select: { ratings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
