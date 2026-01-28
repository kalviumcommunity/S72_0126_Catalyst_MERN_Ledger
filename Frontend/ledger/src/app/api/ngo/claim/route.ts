import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check user exists and is NGO role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { ngos: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ngo') {
      return NextResponse.json({ error: 'Only NGO accounts can claim locations' }, { status: 403 });
    }

    // No longer blocking - NGOs can have multiple locations

    // Get request body
    const body = await request.json();
    const { ngoName, location, contactNumber, description } = body;

    if (!ngoName || !location) {
      return NextResponse.json({ error: 'NGO name and location are required' }, { status: 400 });
    }

    // Check if location is already taken by an active NGO
    const existingNgo = await prisma.ngo.findFirst({
      where: { location, isActive: true },
    });

    if (existingNgo) {
      return NextResponse.json(
        { error: `Location "${location}" is already claimed by another NGO` },
        { status: 409 }
      );
    }

    // Create the NGO
    const ngo = await prisma.ngo.create({
      data: {
        name: ngoName,
        location,
        contactNumber: contactNumber || null,
        description: description || null,
        accountOwnerId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: 'Location claimed successfully',
        ngo,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorCode = (error as { code?: string })?.code;

    if (errorCode === 'P2002') {
      return NextResponse.json(
        { error: 'This location is already claimed by another NGO' },
        { status: 409 }
      );
    }

    console.error('Claim location error:', error);
    return NextResponse.json({ error: 'Failed to claim location' }, { status: 500 });
  }
}
