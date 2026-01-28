import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateToken } from '@/lib/auth';

// Public: list all active NGOs with ratings
export async function GET() {
  try {
    const ngos = await prisma.ngo.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
        createdAt: true,
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: { stars: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average ratings for each NGO
    const ngosWithRatings = ngos.map(ngo => {
      const totalStars = ngo.ratings.reduce((sum, r) => sum + r.stars, 0);
      const avgRating = ngo.ratings.length > 0 ? totalStars / ngo.ratings.length : 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ratings, ...ngoData } = ngo;
      return {
        ...ngoData,
        rating: {
          average: Math.round(avgRating * 10) / 10,
          count: ngo.ratings.length,
        },
      };
    });

    return NextResponse.json({ success: true, ngos: ngosWithRatings }, { status: 200 });
  } catch (error) {
    console.error('NGO list error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch NGOs' }, { status: 500 });
  }
}

// Protected: register an NGO for a specific location (only role === "ngo")
export async function POST(request: NextRequest) {
  try {
    const authResult = validateToken(request);

    if (!authResult.success || !authResult.userId || authResult.role !== 'ngo') {
      return NextResponse.json(
        { success: false, message: 'Only authenticated NGO accounts can register a location' },
        { status: authResult.statusCode ?? 403 }
      );
    }

    const body = await request.json();
    const { name, location, description } = body;

    if (!name || !location) {
      return NextResponse.json(
        { success: false, message: 'Name and location are required' },
        { status: 400 }
      );
    }

    try {
      const ngo = await prisma.ngo.create({
        data: {
          name,
          location,
          description: description || null,
          accountOwnerId: authResult.userId,
        },
      });

      return NextResponse.json({ success: true, ngo }, { status: 201 });
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code;

      if (errorCode === 'P2002') {
        return NextResponse.json(
          { success: false, message: 'This location is already registered by another NGO' },
          { status: 409 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('NGO registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to register NGO' }, { status: 500 });
  }
}
