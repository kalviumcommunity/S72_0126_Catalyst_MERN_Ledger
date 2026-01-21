import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecretkey";

// Mock users database
const MOCK_USERS = [
  { id: 1, username: "admin", password: "admin123", email: "admin@example.com", role: "Admin" },
  { id: 2, username: "user1", password: "user123", email: "user1@example.com", role: "User" },
  { id: 3, username: "user2", password: "user123", email: "user2@example.com", role: "User" },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log("Login attempt:", { username, passwordLength: password?.length });

    if (!username || !password) {
      console.log("Missing credentials");
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user in mock database
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      console.log("User not found or invalid password");
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", user.username);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Token generated successfully");

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    // Set cookie in the response header (server-side)
    response.cookies.set("token", token, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    console.log("Cookie set in response");

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

