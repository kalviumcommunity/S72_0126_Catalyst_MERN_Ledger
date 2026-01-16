# Ledger - Collaborative NGO Platform

This is a [Next.js](https://nextjs.org) project for the **Ledger** platform - a collaborative system designed to make NGO contribution pipelines transparent, reusable, and efficient.

## 🔐 Authentication

This app includes secure user authentication using **bcrypt** for password hashing and **JWT** for token-based sessions.

📖 **See [AUTHENTICATION.md](./AUTHENTICATION.md) for complete authentication documentation.**

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
- `GET /api/users` - Get user data (protected, requires Bearer token)

See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed API documentation and examples.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
