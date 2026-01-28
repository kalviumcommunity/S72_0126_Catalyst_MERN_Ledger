import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET /api/ngo/my - Get current user's active NGOs
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

    const ngos = await prisma.ngo.findMany({
      where: {
        accountOwnerId: payload.userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        location: true,
        contactNumber: true,
        description: true,
        createdAt: true,
        ratings: {
          select: { stars: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average ratings
    const ngosWithRatings = ngos.map(ngo => {
      const totalStars = ngo.ratings.reduce((sum, r) => sum + r.stars, 0);
      const avgRating = ngo.ratings.length > 0 ? totalStars / ngo.ratings.length : 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ratings, ...ngoData } = ngo;
      return {
        ...ngoData,
        rating: Math.round(avgRating * 10) / 10,
        ratingCount: ngo.ratings.length,
      };
    });

    return NextResponse.json({ ngos: ngosWithRatings });
  } catch (error) {
    console.error('Fetch my NGOs error:', error);
    return NextResponse.json({ error: 'Failed to fetch NGOs' }, { status: 500 });
  }
}
