import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/ngos/[id]/end - End task and release location
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ngoId = parseInt(id);

    if (isNaN(ngoId)) {
      return NextResponse.json({ error: 'Invalid NGO ID' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const ngo = await prisma.ngo.findUnique({
      where: { id: ngoId },
    });

    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    if (ngo.accountOwnerId !== payload.userId) {
      console.log(`Auth mismatch: NGO owner=${ngo.accountOwnerId}, token user=${payload.userId}`);
      return NextResponse.json({ 
        error: 'Not authorized to end this location. You may need to log out and log back in.' 
      }, { status: 403 });
    }

    // End all active tasks and release the location
    await prisma.task.updateMany({
      where: { ngoId, isActive: true },
      data: { isActive: false },
    });

    // Mark NGO as inactive (releases the location)
    await prisma.ngo.update({
      where: { id: ngoId },
      data: { isActive: false },
    });

    return NextResponse.json({ 
      message: 'Location released successfully. Others can now claim this location.' 
    });
  } catch (error) {
    console.error('End location error:', error);
    return NextResponse.json({ error: 'Failed to release location' }, { status: 500 });
  }
}
