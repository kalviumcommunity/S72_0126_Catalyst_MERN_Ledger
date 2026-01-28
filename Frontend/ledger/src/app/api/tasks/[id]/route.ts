import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/tasks/[id] - End a task (deactivate it)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
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

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { ngo: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.ngo.accountOwnerId !== payload.userId) {
      return NextResponse.json({ error: 'Not authorized to end this task' }, { status: 403 });
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Task ended successfully' });
  } catch (error) {
    console.error('End task error:', error);
    return NextResponse.json({ error: 'Failed to end task' }, { status: 500 });
  }
}
