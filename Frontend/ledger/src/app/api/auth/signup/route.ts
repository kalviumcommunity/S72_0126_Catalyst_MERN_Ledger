import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

const ALLOWED_ROLES = ['user', 'ngo'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role = 'user',
      ngoName,
      location,
      description,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Role must be either "user" or "ngo"' }, { status: 400 });
    }

    if (role === 'ngo' && (!ngoName || !location)) {
      return NextResponse.json({ error: 'NGO name and location are required for NGO signups' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const { user, ngo } = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
          },
        });

        if (role !== 'ngo') {
          return { user: createdUser, ngo: null };
        }

        const createdNgo = await tx.ngo.create({
          data: {
            name: ngoName,
            location,
            description: description || null,
            accountOwnerId: createdUser.id,
          },
        });

        return { user: createdUser, ngo: createdNgo };
      });

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });

      return NextResponse.json(
        {
          message: 'Account created successfully',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          ngo,
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code;

      if (errorCode === 'P2002') {
        // Unique constraint violation: email or location
        return NextResponse.json(
          { error: 'Email or location already registered by another account' },
          { status: 409 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
