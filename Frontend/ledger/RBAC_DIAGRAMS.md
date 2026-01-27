# RBAC Middleware Flow Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  (Browser, Postman, cURL, Mobile App)                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Request
                            │ Authorization: Bearer <JWT>
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS MIDDLEWARE                            │
│                  (src/middleware.ts)                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Extract Token from Authorization Header              │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │ 2. Verify JWT Signature & Expiration                    │  │
│  │    - Check signature matches secret                     │  │
│  │    - Check token not expired                            │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │ 3. Extract Payload (userId, email, role)                │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │ 4. Check Route Permissions                              │  │
│  │    - /api/admin/* → requires role="admin"               │  │
│  │    - /api/* → requires valid token                      │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │ 5. Add Headers to Request                               │  │
│  │    - x-user-id: userId                                  │  │
│  │    - x-user-email: email                                │  │
│  │    - x-user-role: role                                  │  │
│  └───────────────────────┬──────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ Request + User Headers
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTE HANDLER                                 │
│         (src/app/api/users/route.ts)                            │
│         (src/app/api/admin/route.ts)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 6. Extract User Info from Headers                       │  │
│  │    const userId = request.headers.get('x-user-id')      │  │
│  │    const role = request.headers.get('x-user-role')      │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │ 7. Execute Business Logic                               │  │
│  │    - Query database                                     │  │
│  │    - Process data                                       │  │
│  │    - Return response                                    │  │
│  └───────────────────────┬──────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ JSON Response
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                  Receives Response                               │
└─────────────────────────────────────────────────────────────────┘
```

## Decision Flow for Access Control

```
                         ┌─────────────────┐
                         │ Request Arrives │
                         └────────┬────────┘
                                  │
                         ┌────────▼─────────┐
                         │  Public Route?   │
                         │ (/api/auth/*)    │
                         └────┬────────┬────┘
                              │        │
                          YES │        │ NO
                              │        │
                     ┌────────▼──┐     │
                     │  ALLOW    │     │
                     │  PASS     │     │
                     └───────────┘     │
                                       │
                         ┌─────────────▼──────────────┐
                         │ Has Authorization Header?  │
                         └────┬────────────────┬──────┘
                              │                │
                           NO │                │ YES
                              │                │
                     ┌────────▼──────┐        │
                     │  401 Error    │        │
                     │  "Token       │        │
                     │   Required"   │        │
                     └───────────────┘        │
                                              │
                                ┌─────────────▼──────────┐
                                │  Valid JWT Token?      │
                                │  (Signature & Expiry)  │
                                └────┬──────────────┬────┘
                                     │              │
                                  NO │              │ YES
                                     │              │
                            ┌────────▼────────┐    │
                            │  401 Error      │    │
                            │  "Invalid or    │    │
                            │   Expired"      │    │
                            └─────────────────┘    │
                                                   │
                                     ┌─────────────▼─────────┐
                                     │  Extract Role from    │
                                     │  JWT Payload          │
                                     └────┬──────────────────┘
                                          │
                                          │
                         ┌────────────────▼─────────────────┐
                         │   What Route is Requested?       │
                         └────┬─────────────────────────┬───┘
                              │                         │
                      /api/admin/*              Other /api/*
                              │                         │
                 ┌────────────▼──────────┐             │
                 │  Role = "admin"?      │             │
                 └────┬──────────────┬───┘             │
                      │              │                 │
                   NO │              │ YES             │
                      │              │                 │
            ┌─────────▼─────┐       │                 │
            │  403 Error    │       │                 │
            │  "Access      │       │                 │
            │   Denied"     │       │                 │
            └───────────────┘       │                 │
                                    │                 │
                         ┌──────────▼─────────────────▼───┐
                         │  Attach Headers to Request:    │
                         │  - x-user-id                   │
                         │  - x-user-email                │
                         │  - x-user-role                 │
                         └──────────┬─────────────────────┘
                                    │
                         ┌──────────▼─────────────────────┐
                         │  ALLOW - Pass to Route Handler │
                         └────────────────────────────────┘
```

## Token Structure and Validation

```
┌────────────────────────────────────────────────────────────────┐
│                      JWT TOKEN ANATOMY                          │
└────────────────────────────────────────────────────────────────┘

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzcyNzk2MDAsImV4cCI6MTczNzg4NDQwMH0.signature_here
                      │                                      │                                                                                                    │
                      └──────────────┬───────────────────────┘                                                                                                    │
                                     │                                                                                                                            │
                            ┌────────▼────────┐                                                                                                                   │
                            │     HEADER      │                                                                                                                   │
                            │  {              │                                                                                                                   │
                            │   "alg":"HS256",│                                                                                                                   │
                            │   "typ":"JWT"   │                                                                                                                   │
                            │  }              │                                                                                                                   │
                            └─────────────────┘                                                                                                                   │
                                                                                                                                                                  │
                                     ┌───────────────────────────────────────────────────────────────────────┐                                                   │
                                     │                           PAYLOAD                                      │                                                   │
                                     │  {                                                                     │                                                   │
                                     │    "userId": 1,          ← Used for database queries                  │                                                   │
                                     │    "email": "admin@test.com",  ← User identification                  │                                                   │
                                     │    "role": "admin",      ← CRITICAL for authorization                 │                                                   │
                                     │    "iat": 1737279600,    ← Issued at timestamp                        │                                                   │
                                     │    "exp": 1737884400     ← Expiration (7 days later)                  │                                                   │
                                     │  }                                                                     │                                                   │
                                     └────────────────────────────────────────────────────────────────────────┘                                                   │
                                                                                                                                                                  │
                                                                                                                      ┌───────────────────────────────────────────┘
                                                                                                                      │
                                                                                                            ┌─────────▼─────────┐
                                                                                                            │    SIGNATURE      │
                                                                                                            │  HMAC-SHA256(     │
                                                                                                            │    base64(header)+│
                                                                                                            │    base64(payload)│
                                                                                                            │    JWT_SECRET     │
                                                                                                            │  )                │
                                                                                                            └───────────────────┘
                                                                                                                      │
                                                                                                                      ▼
                                                                                                            ┌─────────────────────────────┐
                                                                                                            │  Ensures token hasn't been  │
                                                                                                            │  tampered with              │
                                                                                                            │  Only valid if signed with  │
                                                                                                            │  correct JWT_SECRET         │
                                                                                                            └─────────────────────────────┘
```

## Role-Based Access Matrix

```
┌──────────────────┬───────────────┬───────────────┬───────────────┬───────────────┐
│   Route          │  No Token     │  User Token   │  Admin Token  │  Description  │
├──────────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ POST             │               │               │               │               │
│ /api/auth/signup │  ✅ Allow     │  ✅ Allow     │  ✅ Allow     │  Public       │
│                  │  (200)        │  (200)        │  (200)        │  Anyone       │
├──────────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ POST             │               │               │               │               │
│ /api/auth/login  │  ✅ Allow     │  ✅ Allow     │  ✅ Allow     │  Public       │
│                  │  (200)        │  (200)        │  (200)        │  Anyone       │
├──────────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ GET              │               │               │               │  Protected    │
│ /api/users       │  ❌ Deny      │  ✅ Allow     │  ✅ Allow     │  Auth         │
│                  │  (401)        │  (200)        │  (200)        │  Required     │
├──────────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ GET              │               │               │               │  Admin        │
│ /api/admin       │  ❌ Deny      │  ❌ Deny      │  ✅ Allow     │  Only         │
│                  │  (401)        │  (403)        │  (200)        │               │
├──────────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ PATCH            │               │               │               │  Admin        │
│ /api/admin       │  ❌ Deny      │  ❌ Deny      │  ✅ Allow     │  Only         │
│                  │  (401)        │  (403)        │  (200)        │               │
├──────────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ DELETE           │               │               │               │  Admin        │
│ /api/admin       │  ❌ Deny      │  ❌ Deny      │  ✅ Allow     │  Only         │
│                  │  (401)        │  (403)        │  (200)        │               │
└──────────────────┴───────────────┴───────────────┴───────────────┴───────────────┘

Legend:
✅ Allow - Request proceeds to route handler
❌ Deny  - Request blocked by middleware
(XXX)    - HTTP status code
```

## Error Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                               │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: Missing Token
─────────────────────────
Request: GET /api/users
Headers: (no Authorization header)
         │
         ▼
    Middleware Checks
         │
         ▼
    No Token Found
         │
         ▼
Response: 401 Unauthorized
{
  "success": false,
  "message": "Authorization token required. Please include Bearer token in Authorization header."
}


Scenario 2: Invalid Token
─────────────────────────
Request: GET /api/users
Headers: Authorization: Bearer invalid_token_here
         │
         ▼
    Middleware Checks
         │
         ▼
    Token Verification Fails
    (Invalid signature or expired)
         │
         ▼
Response: 401 Unauthorized
{
  "success": false,
  "message": "Invalid or expired token"
}


Scenario 3: Insufficient Role
─────────────────────────────
Request: GET /api/admin
Headers: Authorization: Bearer <USER_TOKEN>
Token Payload: { userId: 2, email: "user@test.com", role: "user" }
         │
         ▼
    Middleware Checks
         │
         ▼
    Token Valid ✓
         │
         ▼
    Route: /api/admin
         │
         ▼
    Role Check: "user" ≠ "admin"
         │
         ▼
Response: 403 Forbidden
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "userRole": "user",
  "requiredRole": "admin"
}


Scenario 4: Success
──────────────────
Request: GET /api/admin
Headers: Authorization: Bearer <ADMIN_TOKEN>
Token Payload: { userId: 1, email: "admin@test.com", role: "admin" }
         │
         ▼
    Middleware Checks
         │
         ▼
    Token Valid ✓
         │
         ▼
    Route: /api/admin
         │
         ▼
    Role Check: "admin" = "admin" ✓
         │
         ▼
    Add Headers:
    - x-user-id: 1
    - x-user-email: admin@test.com
    - x-user-role: admin
         │
         ▼
    Pass to Route Handler
         │
         ▼
Response: 200 OK
{
  "success": true,
  "message": "Admin data accessed successfully",
  "data": { ... }
}
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEFENSE IN DEPTH                              │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
───────────────────────────
┌────────────────────────────────────┐
│  HTTPS / TLS Encryption            │
│  - Encrypts token in transit       │
│  - Prevents man-in-the-middle      │
└────────────────────────────────────┘
              │
              ▼
Layer 2: Token Validation
─────────────────────────
┌────────────────────────────────────┐
│  JWT Signature Verification        │
│  - Validates HMAC-SHA256 signature │
│  - Ensures token not tampered      │
│  - Checks expiration               │
└────────────────────────────────────┘
              │
              ▼
Layer 3: Role Authorization
───────────────────────────
┌────────────────────────────────────┐
│  Middleware RBAC Check             │
│  - Validates user role             │
│  - Blocks unauthorized routes      │
│  - Returns 403 for insufficient    │
└────────────────────────────────────┘
              │
              ▼
Layer 4: Route Handler Logic
────────────────────────────
┌────────────────────────────────────┐
│  Additional Business Logic         │
│  - Data validation                 │
│  - Resource ownership check        │
│  - Custom authorization rules      │
└────────────────────────────────────┘
              │
              ▼
Layer 5: Database Security
──────────────────────────
┌────────────────────────────────────┐
│  Prisma Query Security             │
│  - Parameterized queries           │
│  - SQL injection prevention        │
│  - Scoped data access              │
└────────────────────────────────────┘
```

## Extension Example: Adding Moderator Role

```
Step 1: Update Middleware
──────────────────────────
// src/middleware.ts

// Add new route pattern
if (pathname.startsWith('/api/moderate')) {
  if (!['admin', 'moderator'].includes(decoded.role)) {
    return NextResponse.json(
      { success: false, message: 'Moderator access required' },
      { status: 403 }
    );
  }
}


Step 2: Create Moderator Routes
────────────────────────────────
// src/app/api/moderate/route.ts

export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role');
  // userRole is either 'admin' or 'moderator'
  
  // Moderator-specific logic
  const flaggedContent = await prisma.content.findMany({
    where: { flagged: true }
  });
  
  return NextResponse.json({ flaggedContent });
}


Step 3: Updated Access Matrix
──────────────────────────────
┌──────────────┬──────┬──────┬───────────┬───────┐
│   Route      │ User │ Mod  │   Admin   │ Note  │
├──────────────┼──────┼──────┼───────────┼───────┤
│ /api/users   │  ✅  │  ✅  │    ✅    | All   │
│ /api/admin   │  ❌  │  ❌  │    ✅     │ Admin │
│ /api/moderate│  ❌  │  ✅  │    ✅     │ Mod+  │
└──────────────┴──────┴──────┴───────────┴───────┘

No database migration needed!
No changes to existing routes!
Just add middleware rule and new routes!
```
