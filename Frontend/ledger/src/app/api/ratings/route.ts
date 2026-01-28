import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// POST /api/ratings - Submit a rating (requires valid OTP)
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

    const body = await request.json();
    const { otp, stars, comment } = body;

    if (!otp || !stars) {
      return NextResponse.json({ error: 'OTP and star rating are required' }, { status: 400 });
    }

    if (stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars' }, { status: 400 });
    }

    // Find active task with this OTP
    const task = await prisma.task.findFirst({
      where: {
        otp,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: { ngo: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check if user has already rated this task
    const existingRating = await prisma.rating.findUnique({
      where: {
        taskId_userId: {
          taskId: task.id,
          userId: payload.userId,
        },
      },
    });

    if (existingRating) {
      return NextResponse.json({ error: 'You have already rated this event' }, { status: 409 });
    }

    // Prevent NGO owner from rating their own event
    if (task.ngo.accountOwnerId === payload.userId) {
      return NextResponse.json({ error: 'You cannot rate your own event' }, { status: 403 });
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        taskId: task.id,
        ngoId: task.ngoId,
        userId: payload.userId,
        stars,
        comment: comment || null,
      },
    });

    return NextResponse.json({
      message: 'Rating submitted successfully',
      rating: {
        id: rating.id,
        stars: rating.stars,
        ngoName: task.ngo.name,
        location: task.ngo.location,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Submit rating error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}

// GET /api/ratings?ngoId=X - Get ratings for an NGO
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');

    if (!ngoId) {
      return NextResponse.json({ error: 'NGO ID is required' }, { status: 400 });
    }

    const ratings = await prisma.rating.findMany({
      where: { ngoId: parseInt(ngoId) },
      include: {
        task: { select: { id: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average
    const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
    const averageRating = ratings.length > 0 ? totalStars / ratings.length : 0;

    return NextResponse.json({
      ratings,
      stats: {
        count: ratings.length,
        average: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}
