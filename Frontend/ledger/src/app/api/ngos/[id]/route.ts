import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET /api/ngos/[id] - Get a specific NGO
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ngoId = parseInt(id, 10);

    if (isNaN(ngoId)) {
      return NextResponse.json({ error: 'Invalid NGO ID' }, { status: 400 });
    }

    const ngo = await prisma.ngo.findUnique({
      where: { id: ngoId },
      include: {
        accountOwner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    return NextResponse.json({ ngo });
  } catch (error) {
    console.error('Failed to fetch NGO:', error);
    return NextResponse.json({ error: 'Failed to fetch NGO' }, { status: 500 });
  }
}

// PATCH /api/ngos/[id] - Update NGO details (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ngoId = parseInt(id, 10);

    if (isNaN(ngoId)) {
      return NextResponse.json({ error: 'Invalid NGO ID' }, { status: 400 });
    }

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

    // Check if NGO exists and belongs to this user
    const ngo = await prisma.ngo.findUnique({
      where: { id: ngoId },
    });

    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    if (ngo.accountOwnerId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ error: 'You can only edit your own NGO' }, { status: 403 });
    }

    // Get update data
    const body = await request.json();
    const { description, contactNumber } = body;

    // Update NGO
    const updatedNgo = await prisma.ngo.update({
      where: { id: ngoId },
      data: {
        description: description !== undefined ? description : ngo.description,
        contactNumber: contactNumber !== undefined ? contactNumber : ngo.contactNumber,
      },
    });

    return NextResponse.json({
      message: 'NGO updated successfully',
      ngo: updatedNgo,
    });
  } catch (error) {
    console.error('Failed to update NGO:', error);
    return NextResponse.json({ error: 'Failed to update NGO' }, { status: 500 });
  }
}
