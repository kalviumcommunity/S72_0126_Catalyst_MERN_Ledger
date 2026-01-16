# 🔐 User Authentication Documentation

This document explains the secure user authentication system implemented using **bcrypt** for password hashing and **JWT** (JSON Web Tokens) for token-based sessions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Signup Flow](#signup-flow)
3. [Login Flow](#login-flow)
4. [Protected Routes](#protected-routes)
5. [API Endpoints](#api-endpoints)
6. [Code Examples](#code-examples)
7. [Security Best Practices](#security-best-practices)
8. [Reflection](#reflection)

---

## 🎯 Overview

The authentication system provides:
- ✅ **Secure password storage** using bcrypt hashing (salt rounds: 10)
- ✅ **JWT token-based sessions** for authenticated access
- ✅ **Protected routes** that require valid tokens
- ✅ **Token validation** with expiry handling

---

## 🔄 Signup Flow

### Process

1. User submits `name`, `email`, `password` (and optionally `organization`, `role`)
2. Server validates required fields
3. Checks if user with email already exists
4. **Hashes password** using `bcrypt.hash(password, 10)`
5. Stores user in database (password is hashed, never stored as plain text)
6. Returns success response with user data (password excluded)

### Code Implementation

```typescript
// src/app/api/auth/signup/route.ts

import bcrypt from 'bcrypt';

// Hash password before storing
const hashedPassword = await bcrypt.hash(password, 10);

// Create user with hashed password
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword, // Stored as hash, never plain text
    organization,
    role,
  },
});
```

---

## 🔑 Login Flow

### Process

1. User submits `email` and `password`
2. Server finds user by email
3. **Verifies password** using `bcrypt.compare(plainPassword, hashedPassword)`
4. If valid, **generates JWT token** containing `userId` and `email`
5. Returns token in response body

### Code Implementation

```typescript
// src/app/api/auth/login/route.ts

import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/jwt';

// Find user
const user = await prisma.user.findUnique({ where: { email } });

// Verify password
const isPasswordValid = await bcrypt.compare(password, user.password);

if (isPasswordValid) {
  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });
  
  return NextResponse.json({ token, user });
}
```

---

## 🛡️ Protected Routes

### Process

1. Client sends request with `Authorization: Bearer <token>` header
2. Server extracts token from header
3. **Verifies token** using JWT secret
4. If valid, extracts `userId` and `email` from token
5. Returns protected data
6. If invalid/expired, returns 401 Unauthorized

### Code Implementation

```typescript
// src/app/api/users/route.ts

import { extractTokenFromHeader, verifyToken } from '@/lib/jwt';

// Extract token from Authorization header
const authHeader = request.headers.get('Authorization');
const token = extractTokenFromHeader(authHeader); // Removes "Bearer " prefix

// Verify token
const decoded = verifyToken(token);
if (!decoded) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}

// Use decoded.userId to fetch protected data
const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
```

---

## 📡 API Endpoints

### 1. Signup

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "mypassword",
  "organization": "Clean Water Initiative", // optional
  "role": "contributor" // optional, defaults to "contributor"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice",
    "organization": "Clean Water Initiative",
    "role": "contributor",
    "createdAt": "2024-01-13T10:00:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request:** Missing required fields
```json
{
  "error": "Name, email, and password are required"
}
```

- **409 Conflict:** User already exists
```json
{
  "error": "User with this email already exists"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "mypassword"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDUxMjM0NTYsImV4cCI6MTcwNTcyODI1Nn0.example",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice",
    "organization": "Clean Water Initiative",
    "role": "contributor"
  }
}
```

**Error Responses:**

- **400 Bad Request:** Missing fields
```json
{
  "error": "Email and password are required"
}
```

- **401 Unauthorized:** Invalid credentials
```json
{
  "error": "Invalid email or password"
}
```

---

### 3. Protected Route (Get User Data)

**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "message": "Protected data accessed successfully",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice",
    "organization": "Clean Water Initiative",
    "role": "contributor",
    "createdAt": "2024-01-13T10:00:00.000Z",
    "updatedAt": "2024-01-13T10:00:00.000Z"
  },
  "tokenInfo": {
    "userId": 1,
    "email": "alice@example.com"
  }
}
```

**Error Responses:**

- **401 Unauthorized:** Missing or invalid token
```json
{
  "error": "Authorization token required. Please provide Bearer token in Authorization header."
}
```

```json
{
  "error": "Invalid or expired token"
}
```

---

## 💻 Code Examples

### Using cURL

#### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "mypassword"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "mypassword"
  }'
```

#### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Using JavaScript/Fetch

```javascript
// Signup
const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'mypassword',
  }),
});
const signupData = await signupResponse.json();

// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'alice@example.com',
    password: 'mypassword',
  }),
});
const { token } = await loginResponse.json();

// Access Protected Route
const usersResponse = await fetch('http://localhost:3000/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const userData = await usersResponse.json();
```

---

## 🔒 Security Best Practices

### Password Hashing with bcrypt

**Why bcrypt?**
- Uses salt rounds (10) to prevent rainbow table attacks
- Computationally expensive, making brute-force attacks slower
- One-way hashing: passwords cannot be reversed

**Implementation:**
```typescript
// Hash password (signup)
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password (login)
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### JWT Token Security

**Token Structure:**
```json
{
  "userId": 1,
  "email": "alice@example.com",
  "iat": 1705123456,  // Issued at
  "exp": 1705728256   // Expires in 7 days
}
```

**Key Features:**
- **Expiry:** Tokens expire after 7 days (configurable)
- **Secret Key:** Uses `JWT_SECRET` environment variable
- **Signed:** Prevents tampering

**Environment Variable:**
```env
JWT_SECRET=your-super-secret-key-change-in-production
```

---

## 🤔 Reflection

### Token Expiry and Refresh Logic

**Current Implementation:**
- Tokens expire after **7 days**
- No refresh token mechanism (users must login again)

**Future Improvements:**
1. **Refresh Tokens:** Implement refresh token rotation
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Refresh endpoint to get new access token

2. **Token Blacklisting:** Store revoked tokens in database
   - Useful for logout functionality
   - Prevents use of stolen tokens

3. **Sliding Expiry:** Extend token expiry on each use
   - Keeps active users logged in
   - Automatically logs out inactive users

### Token Storage Options

#### Option 1: localStorage (Current Approach)
**Pros:**
- ✅ Persists across browser sessions
- ✅ Survives page refreshes
- ✅ Easy to implement

**Cons:**
- ❌ Vulnerable to XSS attacks
- ❌ Accessible to any JavaScript on the page
- ❌ Not sent automatically with requests

**Best For:** Development, simple apps

#### Option 2: httpOnly Cookies
**Pros:**
- ✅ Protected from XSS (JavaScript cannot access)
- ✅ Automatically sent with requests
- ✅ Can set `Secure` and `SameSite` flags

**Cons:**
- ❌ Vulnerable to CSRF attacks (mitigated with SameSite)
- ❌ More complex to implement
- ❌ Requires CORS configuration

**Best For:** Production apps, better security

#### Option 3: Session Storage
**Pros:**
- ✅ Cleared when tab closes
- ✅ More secure than localStorage

**Cons:**
- ❌ Lost on tab close
- ❌ Still vulnerable to XSS

**Best For:** Temporary sessions

**Recommendation:** For production, use **httpOnly cookies** with `Secure` and `SameSite=Strict` flags.

### How Authentication Strengthens App Security

1. **Password Protection:**
   - Passwords are never stored in plain text
   - Even database administrators cannot see user passwords
   - bcrypt hashing prevents rainbow table attacks

2. **Token-Based Sessions:**
   - No server-side session storage needed (stateless)
   - Tokens can be revoked by changing secret
   - Expiry prevents indefinite access

3. **Protected Routes:**
   - Unauthorized users cannot access sensitive data
   - Each request validates user identity
   - Prevents data leakage

4. **Authorization:**
   - Tokens contain user ID, enabling role-based access control
   - Can restrict actions based on user permissions
   - Foundation for multi-user collaboration

---

## 🚀 Setup Instructions

1. **Install Dependencies:**
```bash
cd Frontend/ledger
npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken @prisma/client
```

2. **Set Environment Variables:**
Create `.env.local` in `Frontend/ledger/`:
```env
JWT_SECRET=your-super-secret-key-change-in-production
DATABASE_URL="file:../../dev.db"
```

3. **Run Database Migration:**
```bash
cd ../..
npx prisma migrate dev --name add_password_field
npx prisma generate
```

4. **Start Development Server:**
```bash
cd Frontend/ledger
npm run dev
```

5. **Test Endpoints:**
Use Postman, cURL, or the examples above to test signup, login, and protected routes.

---

## 📝 Summary

✅ **Signup:** Hashes passwords with bcrypt before storing  
✅ **Login:** Verifies passwords and generates JWT tokens  
✅ **Protected Routes:** Validates JWT tokens before allowing access  
✅ **Security:** Passwords never stored in plain text, tokens expire after 7 days  
✅ **Documentation:** Complete API documentation with examples

The authentication system is production-ready and follows security best practices for password hashing and token-based sessions.
