# Ledger - Collaborative NGO Platform

This is a [Next.js](https://nextjs.org) project for the **Ledger** platform - a collaborative system designed to make NGO contribution pipelines transparent, reusable, and efficient.

## 🔐 Authentication & Authorization

This app includes comprehensive security features:
- **bcrypt** for password hashing
- **JWT** for token-based sessions
- **Role-Based Access Control (RBAC)** for route protection
- **Middleware** for automatic authorization checks

📖 **See [AUTHENTICATION.md](./AUTHENTICATION.md) for authentication details.**

## 🛡️ Role-Based Access Control (RBAC)

### Overview

The Ledger platform implements a robust RBAC system that enforces the **principle of least privilege** - users can only access resources their role permits.

### Middleware Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Incoming Request                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Check Authorization Header                      │
│              Extract Bearer Token                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    Has Token?
                    /        \
                  NO          YES
                  │            │
                  ▼            ▼
            ┌─────────┐   ┌──────────────┐
            │  401    │   │ Verify JWT   │
            │ Denied  │   │ Signature    │
            └─────────┘   └──────┬───────┘
                                 │
                                 ▼
                           Valid Token?
                           /           \
                         NO             YES
                         │               │
                         ▼               ▼
                   ┌─────────┐    ┌─────────────┐
                   │  401    │    │ Extract     │
                   │ Denied  │    │ Role from   │
                   └─────────┘    │ Payload     │
                                  └──────┬──────┘
                                         │
                                         ▼
                                  Check Route Type
                                  /              \
                           /api/admin/*      Other /api/*
                               │                  │
                               ▼                  ▼
                          Role = admin?      Authenticated?
                          /         \             │
                        YES         NO            YES
                         │           │            │
                         ▼           ▼            ▼
                  ┌──────────┐  ┌────────┐  ┌──────────┐
                  │ Allow    │  │  403   │  │ Allow    │
                  │ Access   │  │ Denied │  │ Access   │
                  └──────────┘  └────────┘  └──────────┘
```

### User Roles

| Role | Description | Access Level |
|------|-------------|-------------|
| `admin` | System administrator | Full access to all routes including `/api/admin/*` |
| `user` | Regular user | Access to authenticated routes like `/api/users` |
| `contributor` | Project contributor | Access to authenticated routes |
| `project_manager` | Manages projects | Access to authenticated routes |

### Protected Routes

#### All Authenticated Users
- `GET /api/users` - Get current user data
- Requires: Valid JWT token
- Any role accepted

#### Admin Only
- `GET /api/admin` - List all users with statistics
- `PATCH /api/admin` - Update user roles
- `DELETE /api/admin?userId={id}` - Delete users
- Requires: Valid JWT token + `admin` role

### Testing RBAC

#### 1. Create Test Users

**Admin User:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Regular User:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regular User",
    "email": "user@test.com",
    "password": "user123",
    "role": "user"
  }'
```

#### 2. Login and Get Tokens

**Admin Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**User Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "user123"
  }'
```

Save the returned `token` values for the next steps.

#### 3. Test User Route (Allowed for All)

**✅ With Admin Token:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <ADMIN_JWT>"
```

**✅ With User Token:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <USER_JWT>"
```

**Expected:** Both succeed with 200 OK

#### 4. Test Admin Route

**✅ With Admin Token (Allowed):**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_JWT>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin data accessed successfully",
  "admin": {
    "email": "admin@test.com",
    "role": "admin"
  },
  "data": {
    "users": [...],
    "statistics": {
      "totalUsers": 2,
      "adminCount": 1,
      "userCount": 1,
      "otherRoles": 0
    }
  }
}
```

**❌ With User Token (Denied):**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <USER_JWT>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "userRole": "user",
  "requiredRole": "admin"
}
```
**Status:** 403 Forbidden

**❌ Without Token (Denied):**
```bash
curl -X GET http://localhost:3000/api/admin
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Authorization token required. Please include Bearer token in Authorization header."
}
```
**Status:** 401 Unauthorized

### Code Implementation

#### Middleware (`src/middleware.ts`)
```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Validate token
  const token = extractTokenFromHeader(request.headers.get('Authorization'));
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authorization token required' },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Check role for admin routes
  if (pathname.startsWith('/api/admin') && decoded.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Access denied' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}
```

#### Protected Route Example
```typescript
// src/app/api/users/route.ts
export async function GET(request: NextRequest) {
  // Middleware has already validated token
  const userId = request.headers.get('x-user-id');
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });
  return NextResponse.json({ user });
}
```

### Security Principles

#### 1. Least Privilege
**Why it matters:** Users should only access what they need for their role. This minimizes potential damage from compromised accounts.

**Implementation:**
- Default role: `contributor` (lowest privilege)
- Admin role: Only for system administrators
- Middleware automatically blocks unauthorized access

#### 2. Defense in Depth
**Multiple layers of security:**
- JWT signature verification
- Role validation in middleware
- Database queries scoped to user permissions

#### 3. Fail Securely
**What happens when checks fail:**
- Missing token → 401 Unauthorized
- Invalid token → 401 Unauthorized  
- Insufficient role → 403 Forbidden
- Default: Deny access

### Adding New Roles

The system is designed for easy extensibility:

**1. Define the role in signup:**
```typescript
const validRoles = ['admin', 'user', 'contributor', 'project_manager', 'editor', 'moderator'];
```

**2. Update middleware logic:**
```typescript
// For moderator-only routes
if (pathname.startsWith('/api/moderate') && decoded.role !== 'moderator') {
  return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
}
```

**3. No database migration needed** - the role field accepts any string value.

### Security Risks Without Middleware

**If middleware checks were missing or incorrect:**

❌ **Broken Authentication:**
- Any user could access admin endpoints
- No token verification → anyone could forge requests

❌ **Privilege Escalation:**
- Regular users accessing `/api/admin`
- Ability to delete users or change roles

❌ **Data Exposure:**
- Unauthorized access to all user data
- Privacy violations and compliance issues

❌ **System Compromise:**
- Attackers could create admin accounts
- Complete system takeover possible

### Quick Start - Authentication

1. **Set up environment variables:**
   ```bash
   # Create .env.local file
   echo 'JWT_SECRET=your-super-secret-key-change-in-production' > .env.local
   echo 'DATABASE_URL="file:../../dev.db"' >> .env.local
   ```

2. **Generate Prisma Client:**
   ```bash
   # From project root
   cd ../..
   npx prisma generate
   ```

3. **Run database migration (if not done):**
   ```bash
   npx prisma migrate dev --name add_password_field
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Test authentication endpoints:**
   - Signup: `POST http://localhost:3000/api/auth/signup`
   - Login: `POST http://localhost:3000/api/auth/login`
   - Protected Route: `GET http://localhost:3000/api/users` (requires Bearer token)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## API Routes

### Authentication Routes
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login and receive JWT token

### Protected Routes (Require Authentication)
- `GET /api/users` - Get current user data (all roles)
- `GET /api/admin` - Admin dashboard with all users (admin only)
- `PATCH /api/admin` - Update user roles (admin only)
- `DELETE /api/admin?userId={id}` - Delete users (admin only)

See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed API documentation and examples.

### Example Logs and Outputs

#### Successful Admin Access
```bash
$ curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer eyJhbGc..."

{
  "success": true,
  "message": "Admin data accessed successfully",
  "admin": {
    "email": "admin@ledger.org",
    "role": "admin"
  },
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@ledger.org",
        "name": "System Administrator",
        "organization": "Ledger Platform",
        "role": "admin",
        "createdAt": "2026-01-19T10:00:00.000Z",
        "_count": {
          "projects": 0,
          "tasks": 0
        }
      },
      {
        "id": 2,
        "email": "user@test.com",
        "name": "Regular User",
        "organization": "Test Org",
        "role": "user",
        "createdAt": "2026-01-19T10:05:00.000Z",
        "_count": {
          "projects": 3,
          "tasks": 7
        }
      }
    ],
    "statistics": {
      "totalUsers": 2,
      "adminCount": 1,
      "userCount": 1,
      "otherRoles": 0
    }
  }
}
```

#### Denied Admin Access (Regular User)
```bash
$ curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer eyJhbGc..."

{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "userRole": "user",
  "requiredRole": "admin"
}
# HTTP Status: 403 Forbidden
```

#### Denied Access (Missing Token)
```bash
$ curl -X GET http://localhost:3000/api/users

{
  "success": false,
  "message": "Authorization token required. Please include Bearer token in Authorization header."
}
# HTTP Status: 401 Unauthorized
```

#### Successful User Access
```bash
$ curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGc..."

{
  "success": true,
  "message": "User data accessed successfully",
  "user": {
    "id": 2,
    "email": "user@test.com",
    "name": "Regular User",
    "organization": "Test Org",
    "role": "user",
    "createdAt": "2026-01-19T10:05:00.000Z",
    "_count": {
      "projects": 3,
      "tasks": 7
    }
  },
  "sessionInfo": {
    "userId": 2,
    "email": "user@test.com",
    "role": "user"
  }
}
# HTTP Status: 200 OK
```

## Cache-Aside Caching Strategy

This application employs a **Cache-Aside** strategy with a **Time-to-Live (TTL)** policy to optimize API performance and reduce database load. This section explains how it works and how to test its effectiveness.

### How It Works

The Cache-Aside pattern is an on-demand caching strategy that loads data into the cache only when it is requested. The flow is as follows:

1.  **Request Data**: The application receives a request for data (e.g., a list of users).
2.  **Check Cache**: It first checks Redis for a corresponding cache key (e.g., `users:list`).
3.  **Cache Hit**: If the data is found in the cache, it is returned directly to the client, avoiding a database query. This results in a low-latency response.
4.  **Cache Miss**: If the data is not in the cache, the application queries the primary database (PostgreSQL) to retrieve it.
5.  **Store in Cache**: The retrieved data is then stored in Redis with a **60-second TTL**. This ensures that subsequent requests for the same data within the next minute will be served from the cache.
6.  **Return Data**: The data is returned to the client.

### Cache Invalidation

To prevent stale data, the cache is explicitly invalidated whenever the underlying data is modified. For example, when a new user is created via a `POST` request, the `users:list` cache key is deleted. The next `GET` request will trigger a cache miss, fetch the updated data from the database, and repopulate the cache.

### Testing Latency

You can observe the difference between a "cold start" (cache miss) and a "cache hit" using `curl`.

**Instructions:**

1.  **Start the Application**: Ensure the Next.js server and Redis are running.
2.  **Perform a Cold Start**: Execute the following command to request the user list for the first time. The `source` field in the response will be `"database"`.

    ```bash
    curl -X GET http://localhost:3000/api/users
    ```

3.  **Perform a Cache Hit**: Immediately execute the same command again. This time, the `source` will be `"cache"`, and the response time should be significantly faster.

    ```bash
    curl -X GET http://localhost:3000/api/users
    ```

By following these steps, you can verify that the Cache-Aside strategy is working correctly and measure the performance improvement.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
