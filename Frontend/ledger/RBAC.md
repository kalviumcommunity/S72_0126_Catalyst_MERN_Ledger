# RBAC Implementation Guide

## Overview

This document describes the Role-Based Access Control (RBAC) implementation in the Ledger platform. The system ensures that users can only access resources and perform actions appropriate to their assigned roles, following the **principle of least privilege**.

## Architecture

### Components

1. **JWT Token System** ([src/lib/jwt.ts](../src/lib/jwt.ts))
   - Generates and verifies JWT tokens
   - Embeds user ID, email, and role in token payload
   - Tokens expire after 7 days

2. **Middleware** ([src/middleware.ts](../src/middleware.ts))
   - Intercepts all API requests before they reach route handlers
   - Validates JWT tokens automatically
   - Enforces role-based access rules
   - Attaches user info to request headers

3. **Authorization Utilities** ([src/lib/auth.ts](../src/lib/auth.ts))
   - Helper functions for token validation
   - Role checking utilities
   - Reusable authorization logic

4. **Protected Routes**
   - `/api/users` - Accessible to all authenticated users
   - `/api/admin/*` - Accessible only to admin users

## How It Works

### Request Flow

```
Client Request
    ↓
Next.js Middleware (middleware.ts)
    ↓
[1] Extract Bearer Token from Authorization Header
    ↓
[2] Verify JWT Signature and Expiration
    ↓
[3] Extract Role from Token Payload
    ↓
[4] Check Route Permissions
    ├── /api/admin/* → Requires role = "admin"
    └── /api/*       → Requires valid token (any role)
    ↓
[5] Attach User Info to Headers (x-user-id, x-user-email, x-user-role)
    ↓
Route Handler (receives validated user info)
```

### Decision Tree

```
Has Authorization Header?
├── NO  → 401 Unauthorized
└── YES
    ↓
    Valid JWT Token?
    ├── NO  → 401 Unauthorized (Invalid/Expired)
    └── YES
        ↓
        Route Type?
        ├── /api/admin/*
        │   ↓
        │   Role = "admin"?
        │   ├── NO  → 403 Forbidden
        │   └── YES → Allow (200)
        │
        └── /api/* (other)
            ↓
            Authenticated?
            └── YES → Allow (200)
```

## Roles

### Current Roles

| Role | Level | Description | Access |
|------|-------|-------------|---------|
| `admin` | 100 | System administrator | Full access including `/api/admin/*` |
| `project_manager` | 50 | Manages projects | All authenticated routes |
| `contributor` | 10 | Regular contributor | All authenticated routes |
| `user` | 10 | Basic user | All authenticated routes |

### Adding New Roles

To add a new role (e.g., `moderator`):

1. **Update Prisma Schema** (optional - role field already accepts any string)

2. **Add Role to Signup Validation**
   ```typescript
   // src/app/api/auth/signup/route.ts
   const validRoles = ['admin', 'user', 'contributor', 'project_manager', 'moderator'];
   if (role && !validRoles.includes(role)) {
     return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
   }
   ```

3. **Update Middleware Logic**
   ```typescript
   // src/middleware.ts
   if (pathname.startsWith('/api/moderate')) {
     if (!['admin', 'moderator'].includes(decoded.role)) {
       return NextResponse.json(
         { success: false, message: 'Moderator access required' },
         { status: 403 }
       );
     }
   }
   ```

4. **Create Protected Routes**
   ```typescript
   // src/app/api/moderate/route.ts
   export async function GET(request: NextRequest) {
     const userRole = request.headers.get('x-user-role');
     // Middleware already verified role
     // Implement moderator functionality
   }
   ```

## Security Principles

### 1. Principle of Least Privilege

**Definition:** Users should have the minimum access rights necessary to perform their job functions.

**Implementation:**
- Default role on signup: `contributor` (lowest privilege)
- Explicit role assignment required for elevated privileges
- Admin routes completely blocked for non-admin users

**Example:**
```typescript
// ❌ BAD: Checking role inside route handler (can be bypassed)
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // admin logic
}

// ✅ GOOD: Middleware blocks request before it reaches handler
// Middleware checks role and returns 403 automatically
export async function GET(request: NextRequest) {
  // Only executes if user is admin
  // admin logic
}
```

### 2. Defense in Depth

**Multiple layers of security:**
1. **Client-side:** UI hides admin buttons (UX only, not security)
2. **Network:** HTTPS encrypts tokens in transit
3. **Middleware:** Validates tokens and roles before route execution
4. **Route Handler:** Can perform additional checks if needed
5. **Database:** Prisma queries can filter by user/organization

### 3. Fail Securely

**Default behavior: Deny access**

```typescript
// Missing token → 401
// Invalid token → 401
// Insufficient role → 403
// Unknown error → Deny access

// Never fail open (granting access when uncertain)
```

### 4. Token Security

**Best Practices:**
- Store tokens in memory or httpOnly cookies (not localStorage)
- Include expiration time (7 days)
- Sign with strong secret (from environment variable)
- Validate signature on every request

**Token Structure:**
```json
{
  "userId": 1,
  "email": "admin@test.com",
  "role": "admin",
  "iat": 1737279600,
  "exp": 1737884400
}
```

## API Endpoints

### Authentication Endpoints (Public)

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "organization": "Example NGO",
  "role": "user"  // optional, defaults to "contributor"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "organization": "Example NGO",
    "role": "user",
    "createdAt": "2026-01-19T10:00:00.000Z"
  }
}
```

#### POST /api/auth/login
Login and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "organization": "Example NGO",
    "role": "user"
  }
}
```

### Protected Endpoints (Require Authentication)

#### GET /api/users
Get current user's data.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User data accessed successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "organization": "Example NGO",
    "role": "user",
    "createdAt": "2026-01-19T10:00:00.000Z",
    "_count": {
      "projects": 3,
      "tasks": 7
    }
  },
  "sessionInfo": {
    "userId": 1,
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `401` - Missing or invalid token
- `404` - User not found
- `500` - Server error

### Admin Endpoints (Require Admin Role)

#### GET /api/admin
Get all users and system statistics.

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Admin data accessed successfully",
  "admin": {
    "email": "admin@test.com",
    "role": "admin"
  },
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@test.com",
        "name": "Admin User",
        "role": "admin",
        "_count": {
          "projects": 0,
          "tasks": 0
        }
      }
    ],
    "statistics": {
      "totalUsers": 10,
      "adminCount": 2,
      "userCount": 8,
      "otherRoles": 0
    }
  }
}
```

**Error Responses:**
- `401` - Missing or invalid token
- `403` - User is not an admin (Forbidden)
- `500` - Server error

#### PATCH /api/admin
Update a user's role (admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Request:**
```json
{
  "userId": 5,
  "newRole": "project_manager"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully by admin admin@test.com",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "name": "User Name",
    "role": "project_manager",
    "updatedAt": "2026-01-19T12:00:00.000Z"
  }
}
```

#### DELETE /api/admin?userId={id}
Delete a user (admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully by admin admin@test.com"
}
```

## Testing

### Automated Testing Script

Run the PowerShell test script:
```powershell
cd Frontend/ledger
./test-rbac.ps1
```

This script will:
1. Create admin and regular users
2. Login as both users
3. Test access to protected routes
4. Verify correct 401/403 responses
5. Display tokens for manual testing

### Manual Testing with cURL

**1. Create Users:**
```bash
# Admin
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}'

# Regular User
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"user123","role":"user"}'
```

**2. Login:**
```bash
# Admin Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Save the returned token
```

**3. Test Routes:**
```bash
# ✅ Admin accessing admin route (SUCCESS)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# ❌ User accessing admin route (403 FORBIDDEN)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <USER_TOKEN>"

# ✅ User accessing user route (SUCCESS)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <USER_TOKEN>"
```

## Security Risks Without Proper RBAC

### What Could Go Wrong?

#### 1. Missing Token Validation
**Risk:** Anyone could access protected data without authentication.
```typescript
// ❌ VULNERABLE CODE
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json({ users }); // No auth check!
}
```

**Impact:**
- Unauthorized access to all user data
- Privacy violations
- Data breaches

#### 2. Role Checks Only in Route Handlers
**Risk:** Developers might forget to add role checks.
```typescript
// ❌ VULNERABLE CODE
export async function GET(request: NextRequest) {
  // Forgot to check if user is admin!
  const users = await prisma.user.findMany();
  return NextResponse.json({ users });
}
```

**Impact:**
- Privilege escalation
- Regular users accessing admin functions

#### 3. Client-Side Only Role Checks
**Risk:** Client-side checks can be bypassed.
```typescript
// ❌ VULNERABLE CODE
// Client: if (user.role === 'admin') show admin panel
// Server: No check at all
```

**Impact:**
- Attackers can modify client code
- Full system compromise

#### 4. Weak JWT Secrets
**Risk:** Tokens can be forged.
```typescript
// ❌ VULNERABLE CODE
const JWT_SECRET = '123'; // Weak secret
```

**Impact:**
- Attackers can create fake admin tokens
- Complete authentication bypass

### How Our Implementation Prevents These

✅ **Middleware validates every request** - No way to bypass token check  
✅ **Role checking happens before route execution** - Developers can't forget  
✅ **Server-side enforcement only** - Client can't bypass  
✅ **Strong secret from environment** - Tokens are cryptographically secure  
✅ **Token expiration** - Stolen tokens have limited lifetime  

## Best Practices

### For Developers

1. **Never bypass middleware** for protected routes
2. **Use environment variables** for JWT_SECRET
3. **Validate input** even after middleware checks
4. **Log access attempts** for security auditing
5. **Rotate secrets periodically** in production

### For Security

1. **Principle of least privilege** - Default to lowest role
2. **Fail securely** - Deny access when uncertain
3. **Defense in depth** - Multiple security layers
4. **Regular audits** - Review who has admin access
5. **Monitor for anomalies** - Unusual access patterns

### For Scalability

1. **Role-based, not user-based** - Easier to manage
2. **Middleware configuration** - Centralized security logic
3. **Reusable utilities** - DRY principle
4. **Easy to extend** - Adding new roles is simple
5. **Document everything** - This file!

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Missing Authorization header
- Token expired (older than 7 days)
- Invalid token signature
- Token not starting with "Bearer "

**403 Forbidden**
- User role doesn't match required role
- Admin route accessed by non-admin
- Check token payload for actual role

**500 Internal Server Error**
- Database connection issue
- Invalid user ID in token
- Check server logs

### Debugging Tips

1. **Check token payload:**
   ```bash
   # Decode JWT at https://jwt.io
   # Or use:
   echo "<TOKEN>" | cut -d "." -f 2 | base64 -d
   ```

2. **Verify middleware is running:**
   ```typescript
   // Add console.log in middleware.ts
   console.log('Middleware checking:', pathname, decoded?.role);
   ```

3. **Check headers in route:**
   ```typescript
   console.log('User role:', request.headers.get('x-user-role'));
   ```

## Conclusion

This RBAC implementation provides:
- ✅ Secure authentication and authorization
- ✅ Centralized security logic in middleware
- ✅ Easy to extend with new roles
- ✅ Following security best practices
- ✅ Comprehensive testing capabilities

The system enforces the principle of least privilege and ensures that users can only access what their roles permit, protecting the platform from unauthorized access and privilege escalation attacks.
