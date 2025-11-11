# Swift Gig - Authentication Setup Guide

## Prerequisites

- Node.js 18+ installed
- pnpm installed
- PostgreSQL database (we'll use Vercel Postgres for production)

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/swiftgig?schema=public"

# Auth - Generate a secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Set Up Database

You have two options:

#### Option A: Use Vercel Postgres (Recommended for production)

1. Install Vercel CLI: `pnpm add -g vercel`
2. Link your project: `vercel link`
3. Create Postgres database: `vercel postgres create`
4. Pull environment variables: `vercel env pull .env.local`

#### Option B: Use Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb swiftgig`
3. Update `DATABASE_URL` in `.env` with your local connection string

### 4. Run Database Migrations

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your app!

## Vercel Deployment Setup

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "Postgres"
4. Follow the prompts to create your database

### 2. Add Environment Variables

In your Vercel project settings, add:

- `DATABASE_URL` (automatically added when you create Postgres)
- `NEXTAUTH_URL` = `https://your-domain.vercel.app`
- `NEXTAUTH_SECRET` = Generate with `openssl rand -base64 32`

### 3. Deploy

```bash
vercel --prod
```

### 4. Run Migrations on Production

```bash
# Connect to production database
vercel env pull .env.production

# Run migrations
pnpm prisma migrate deploy
```

## Database Schema

The app includes the following models:

- **User**: Stores user accounts with email/password authentication
- **Account**: For OAuth providers (future use)
- **Session**: Manages user sessions
- **Listing**: Job postings created by recruiters
- **Submission**: Applications from earners to listings

## Authentication Features

✅ Email/password authentication with NextAuth.js
✅ Secure password hashing with bcrypt
✅ Protected routes (earner and recruiter pages)
✅ Role-based access (EARNER or RECRUITER)
✅ Session management
✅ Sign in/Sign up pages
✅ Automatic redirect after authentication

## Useful Commands

```bash
# Open Prisma Studio to view/edit database
pnpm prisma studio

# Generate Prisma Client after schema changes
pnpm prisma generate

# Create a new migration
pnpm prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Format Prisma schema
pnpm prisma format
```

## Troubleshooting

### "PrismaClient is not configured to run in Vercel Edge Functions"

Make sure you're using `prisma-client-js` in your schema, not `prisma-client`.

### Database connection issues

1. Check your `DATABASE_URL` is correct
2. Ensure your database is running
3. For Vercel Postgres, make sure you've pulled the latest env vars

### "NEXTAUTH_URL is not defined"

Add `NEXTAUTH_URL` to your `.env` file:
- Local: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

## Next Steps

1. Add email verification
2. Add password reset functionality
3. Add OAuth providers (Google, GitHub, etc.)
4. Add profile pages
5. Add two-factor authentication

