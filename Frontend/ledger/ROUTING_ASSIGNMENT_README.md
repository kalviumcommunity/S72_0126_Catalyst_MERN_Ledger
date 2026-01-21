# Next.js App Router - Routing Assignment

## Overview

This project demonstrates page routing and dynamic routes using the Next.js 13+ App Router. It implements public and protected pages, handles dynamic parameters, and includes proper error handling for a complete routing experience.

## Tech Stack

- **Next.js 13+ App Router**: File-based routing system
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **JWT**: Token-based authentication (mock implementation)
- **js-cookie**: Cookie management

## Route Map

### Public Routes
Routes that can be accessed by anyone without authentication:

| Route | File Path | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Home page with welcome message |
| `/login` | `app/login/page.tsx` | Login page with mock authentication |

### Protected Routes
Routes that require authentication (valid JWT token in cookies):

| Route | File Path | Description |
|-------|-----------|-------------|
| `/dashboard` | `app/dashboard/page.tsx` | Protected dashboard for logged-in users |
| `/users` | `app/users/page.tsx` | List of users (links to individual profiles) |
| `/users/[id]` | `app/users/[id]/page.tsx` | Dynamic user profile page |

### Error Pages

| Route | File Path | Description |
|-------|-----------|-------------|
| `404` | `app/not-found.tsx` | Custom 404 page for non-existent routes |

## Project Structure

```
src/
├── middleware.ts           → Route protection middleware
└── app/
    ├── page.tsx           → Home page (public)
    ├── layout.tsx         → Global layout with navigation
    ├── not-found.tsx      → Custom 404 page
    ├── login/
    │   └── page.tsx       → Login page (public)
    ├── dashboard/
    │   └── page.tsx       → Dashboard (protected)
    └── users/
        ├── page.tsx       → Users list (protected)
        └── [id]/
            └── page.tsx   → User profile (protected, dynamic)
```

## Key Implementation Details

### 1. Middleware (`middleware.ts`)

The middleware implements simple JWT-based authentication:

- **Public Routes**: `/` and `/login` are accessible without authentication
- **Protected Routes**: `/dashboard` and `/users/*` require a valid JWT token
- **Token Validation**: Checks for "token" cookie and verifies it using JWT
- **Redirect Logic**: Unauthenticated users are redirected to `/login`

```typescript
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname === "/") {
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // JWT verification...
  }
}
```

### 2. Mock Authentication

The login page uses a simple mock authentication system:

```typescript
function handleLogin() {
  // Mock token (in real apps, get it from backend)
  Cookies.set("token", "mock.jwt.token");
  router.push("/dashboard");
}
```

**Note**: This is for demonstration purposes only. In production, implement proper authentication with:
- Backend JWT generation
- Secure token storage
- Token refresh mechanisms
- Proper password hashing

### 3. Dynamic Routes

The `[id]` folder pattern creates dynamic routes:

```typescript
interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;
  const user = { id, name: "User " + id };
  // Render user profile...
}
```

This allows URLs like `/users/1`, `/users/2`, etc., to render different content dynamically.

### 4. Navigation Layout

The `layout.tsx` provides consistent navigation across all pages:

```typescript
<nav className="flex gap-4 p-4 bg-gray-100">
  <Link href="/">Home</Link>
  <Link href="/login">Login</Link>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/users/1">User 1</Link>
</nav>
```

## How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Try accessing `/dashboard` (should redirect to `/login`)
   - Click "Login" button on login page
   - Now you can access protected routes

## Testing the Routes

### Test Public Routes
1. Visit `/` - Should show the home page ✅
2. Visit `/login` - Should show the login page ✅

### Test Protected Routes (Before Login)
1. Try to access `/dashboard` - Should redirect to `/login` ✅
2. Try to access `/users` - Should redirect to `/login` ✅
3. Try to access `/users/1` - Should redirect to `/login` ✅

### Test Protected Routes (After Login)
1. Click "Login" button on `/login` page
2. Should redirect to `/dashboard` ✅
3. Navigate to `/users` - Should show users list ✅
4. Click on "User 1" or "User 2" - Should show user profile ✅

### Test Dynamic Routes
1. Visit `/users/1` - Shows "User 1" profile ✅
2. Visit `/users/2` - Shows "User 2" profile ✅
3. Visit `/users/42` - Shows "User 42" profile ✅

### Test Error Pages
1. Visit `/nonexistent` - Should show custom 404 page ✅

## Reflection on Routing Best Practices

### 1. Dynamic Routing and Scalability

**Benefits**:
- **Scalable**: A single `[id]/page.tsx` file handles infinite user profiles
- **Maintainable**: No need to create separate files for each user
- **SEO-Friendly**: Each dynamic route generates a unique URL
- **Data Loading**: Can fetch user-specific data based on the `id` parameter

**Real-world applications**:
- Blog posts: `/posts/[slug]`
- Product pages: `/products/[id]`
- User profiles: `/users/[username]`
- Category pages: `/categories/[category]`

### 2. SEO Considerations

**Route Structure**:
- Clean, descriptive URLs improve SEO
- `/users/1` is more semantic than `/user?id=1`
- Dynamic routes generate proper meta tags for each page

**Recommendations**:
- Add metadata to each page using Next.js `metadata` API
- Implement breadcrumbs for better navigation and SEO
- Use semantic HTML structure
- Generate sitemaps for dynamic routes

**Example breadcrumbs for `/users/[id]`**:
```
Home > Users > User 1
```

### 3. User Experience (UX)

**Navigation**:
- Consistent navigation bar across all pages
- Clear visual hierarchy
- Logical route structure

**Authentication Flow**:
- Smooth redirect to login for protected pages
- Automatic redirect to dashboard after login
- Clear feedback on authentication state

**Error Handling**:
- Custom 404 page provides better UX than default error
- Graceful handling of invalid routes
- User-friendly error messages

### 4. Performance Optimization

**App Router Benefits**:
- Server Components by default (better performance)
- Automatic code splitting per route
- Streaming and suspense support
- Optimized client-side navigation

**Best Practices Implemented**:
- Minimal client-side JavaScript (only login page is "use client")
- Server-side rendering for static content
- Lazy loading of routes

### 5. Security Considerations

**Current Implementation**:
- JWT token validation in middleware
- Cookie-based authentication
- Protected routes redirect to login

**Production Recommendations**:
- Use httpOnly cookies for tokens
- Implement CSRF protection
- Add rate limiting
- Use secure JWT secrets (environment variables)
- Implement token refresh mechanism
- Add password hashing with bcrypt
- Use HTTPS in production

### 6. Route Protection Strategy

**Middleware Approach**:
- Centralized authentication logic
- Runs before routes are rendered
- Efficient redirection
- Easy to maintain and extend

**Alternative Approaches**:
- Higher-order components (HOCs)
- Custom hooks
- Layout-level protection
- API route protection

### 7. Error Handling

**Current Implementation**:
- Custom 404 page with clear messaging
- Graceful handling of missing routes
- User-friendly error states

**Future Enhancements**:
- Add error.tsx for runtime errors
- Implement error boundaries
- Add loading.tsx for loading states
- Add not-found.tsx for specific sections

## Future Enhancements

### Breadcrumbs Implementation
Add breadcrumbs to improve navigation:

```typescript
// app/users/[id]/page.tsx
<nav className="text-sm mb-4">
  <Link href="/">Home</Link> / 
  <Link href="/users">Users</Link> / 
  <span>User {id}</span>
</nav>
```

### Metadata for SEO
Add dynamic metadata:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `User ${params.id} Profile`,
    description: `Profile page for user ${params.id}`,
  };
}
```

### Loading States
Add loading indicators:

```typescript
// app/users/[id]/loading.tsx
export default function Loading() {
  return <div>Loading user profile...</div>;
}
```

### Data Fetching
Replace mock data with real API calls:

```typescript
async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}
```

## Deliverables Checklist

- ✅ Working public and protected route setup with middleware
- ✅ Dynamic routes that render parameterized content
- ✅ Custom 404 error page and layout navigation
- ✅ README with route map visualization
- ✅ Code snippets showing route definitions and middleware
- ✅ Reflection on SEO and routing best practices
- ✅ Documentation on breadcrumbs and user experience
- ✅ Error handling strategies

## Conclusion

This project demonstrates a complete implementation of Next.js App Router with:
- File-based routing system
- Public and protected routes
- Dynamic routing with parameters
- Middleware-based authentication
- Custom error pages
- Consistent navigation layout

The implementation follows Next.js best practices and provides a solid foundation for building scalable, SEO-friendly web applications with proper authentication and routing.

---

**Note**: This is an educational project demonstrating Next.js routing concepts. The authentication is mocked for learning purposes. In production, implement proper security measures and real authentication systems.
