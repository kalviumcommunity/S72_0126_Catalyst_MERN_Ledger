# RBAC Quick Reference Guide

## 🚀 Quick Start

### 1. Start Development Server
```bash
cd Frontend/ledger
npm run dev
```

### 2. Run Automated Tests
```powershell
./test-rbac.ps1
```

## 🔑 Key Concepts

### Middleware Flow
```
Request → Validate Token → Check Role → Allow/Deny → Route Handler
```

### HTTP Status Codes
- `200` ✅ Success
- `401` ❌ Unauthorized (missing/invalid token)
- `403` ❌ Forbidden (insufficient role)
- `500` ❌ Server error

### Roles
- `admin` - Full access including /api/admin/*
- `user` - Authenticated routes only
- `contributor` - Authenticated routes only
- `project_manager` - Authenticated routes only

## 📝 Quick Commands

### Create Admin User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}'
```

### Create Regular User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"user123","role":"user"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### Test User Route (Any Auth User)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

### Test Admin Route (Admin Only)
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## 🔒 Route Protection Matrix

| Route | No Token | User Token | Admin Token |
|-------|----------|------------|-------------|
| POST /api/auth/signup | ✅ 200 | ✅ 200 | ✅ 200 |
| POST /api/auth/login | ✅ 200 | ✅ 200 | ✅ 200 |
| GET /api/users | ❌ 401 | ✅ 200 | ✅ 200 |
| GET /api/admin | ❌ 401 | ❌ 403 | ✅ 200 |
| PATCH /api/admin | ❌ 401 | ❌ 403 | ✅ 200 |
| DELETE /api/admin | ❌ 401 | ❌ 403 | ✅ 200 |

## 📂 Key Files

### Security Core
- `src/middleware.ts` - Main security enforcement
- `src/lib/jwt.ts` - Token generation/verification
- `src/lib/auth.ts` - Authorization utilities

### Routes
- `src/app/api/auth/signup/route.ts` - User registration
- `src/app/api/auth/login/route.ts` - Authentication
- `src/app/api/users/route.ts` - User data (protected)
- `src/app/api/admin/route.ts` - Admin operations (admin-only)

### Documentation
- `README.md` - Main documentation
- `RBAC.md` - Detailed RBAC guide
- `RBAC_DIAGRAMS.md` - Visual diagrams
- `IMPLEMENTATION_SUMMARY.md` - Complete summary

### Testing
- `test-rbac.ps1` - Automated test script

## 🐛 Troubleshooting

### 401 Unauthorized
**Possible causes:**
- Missing `Authorization` header
- Token doesn't start with "Bearer "
- Token is expired (>7 days old)
- Invalid token signature

**Solution:**
- Check header: `Authorization: Bearer <token>`
- Login again to get fresh token
- Verify JWT_SECRET in .env matches

### 403 Forbidden
**Possible causes:**
- User role doesn't match required role
- Regular user accessing admin route

**Solution:**
- Check token payload at jwt.io
- Verify user has correct role in database
- Ensure admin users have `role: "admin"`

### Route Not Protected
**Possible causes:**
- Middleware not running
- Route not matching middleware pattern

**Solution:**
- Check middleware.ts config.matcher
- Verify route path starts with /api/
- Check console for middleware logs

## 💡 Common Patterns

### Get User Info in Route Handler
```typescript
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  
  // Use the user info
}
```

### Check Role in Route (Additional)
```typescript
const userRole = request.headers.get('x-user-role');
if (userRole !== 'admin') {
  return NextResponse.json(
    { error: 'Admin required' },
    { status: 403 }
  );
}
```

### Decode JWT Manually
```bash
# Copy token
# Go to https://jwt.io
# Paste token in "Encoded" section
# View payload in "Decoded" section
```

## 🎯 Testing Checklist

- [ ] Admin can access /api/admin
- [ ] User CANNOT access /api/admin (403)
- [ ] User can access /api/users
- [ ] No token CANNOT access /api/users (401)
- [ ] Invalid token gets 401
- [ ] Token includes role in payload
- [ ] Middleware logs show role checks

## 📊 Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "Admin data accessed successfully",
  "data": { ... }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authorization token required. Please include Bearer token in Authorization header."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "userRole": "user",
  "requiredRole": "admin"
}
```

## 🔧 Adding New Protected Route

### 1. For All Authenticated Users
```typescript
// src/app/api/myroute/route.ts
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  // Your logic - middleware already validated token
}
```

### 2. For Specific Role
Update middleware:
```typescript
// src/middleware.ts
if (pathname.startsWith('/api/myroute')) {
  if (decoded.role !== 'special_role') {
    return NextResponse.json(
      { success: false, message: 'Special role required' },
      { status: 403 }
    );
  }
}
```

## 🎥 Video Demo Structure

1. **Introduction** (30s)
   - What is RBAC
   - Why it matters

2. **Middleware Explanation** (2 min)
   - Show middleware.ts
   - Explain flow diagram
   - Decision points

3. **Live Demo** (3 min)
   - Create users
   - Login and get tokens
   - Test protected routes
   - Show 401/403 errors

4. **Security Discussion** (2 min)
   - Least privilege principle
   - Risks without RBAC
   - Defense in depth

5. **Extensibility** (1 min)
   - How to add new roles
   - Show code example

6. **Conclusion** (30s)
   - Recap benefits
   - Next steps

## 📚 Additional Resources

- **JWT.io** - https://jwt.io (decode tokens)
- **Postman** - Test API endpoints with GUI
- **Thunder Client** - VS Code extension for API testing
- **Next.js Middleware Docs** - https://nextjs.org/docs/app/building-your-application/routing/middleware

## ✅ Checklist Before Demo

- [ ] Development server is running
- [ ] Database is seeded with users
- [ ] Test script runs successfully
- [ ] Tokens are available for manual testing
- [ ] Documentation is reviewed
- [ ] Screenshots/logs are prepared
- [ ] Understand middleware flow
- [ ] Can explain security principles
- [ ] Know how to add new roles
- [ ] Prepared examples of 401/403 errors

---

**Quick Tip:** Use the test-rbac.ps1 script first to verify everything works, then do manual testing for the video demo!
