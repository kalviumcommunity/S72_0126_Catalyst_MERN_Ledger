import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

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
      contactNumber,
      description,
    } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and optionally NGO in a transaction
    const { user, ngos } = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role === 'ngo' ? 'ngo' : 'user',
        },
      });

      // Only create NGO if role is ngo and required fields are provided
      if (role === 'ngo' && ngoName && location) {
        const createdNgo = await tx.ngo.create({
          data: {
            name: ngoName,
            location,
            contactNumber: contactNumber || null,
            description: description || null,
            accountOwnerId: createdUser.id,
          },
        });
        return { user: createdUser, ngos: [createdNgo] };
      }

      return { user: createdUser, ngos: [] };
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
          ngos,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
