# Admin Access Control Implementation

## Overview

Implemented role-based access control for the `/admin` routes using an `isAdmin` boolean field in the User table.

## Changes Made

### 1. Database Schema Updates

**Added `isAdmin` field to User model:**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String
  isAdmin       Boolean   @default(false)  // ✅ NEW
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // ... relations
}
```

**Migration:** `20251110190905_add_is_admin`

### 2. NextAuth Integration

**Updated Type Definitions** (`src/types/next-auth.d.ts`):
```typescript
interface Session {
  user: {
    id: string;
    isAdmin: boolean;  // ✅ NEW
  } & DefaultSession['user'];
}

interface User {
  id: string;
  isAdmin: boolean;  // ✅ NEW
}

interface JWT {
  id: string;
  isAdmin: boolean;  // ✅ NEW
}
```

**Updated Auth Configuration** (`src/lib/auth.ts`):
- Added `isAdmin` to user object returned from `authorize()`
- Added `isAdmin` to JWT callback
- Added `isAdmin` to session callback

### 3. Middleware Protection

**Updated Middleware** (`src/middleware.ts`):
```typescript
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.isAdmin || false;
  
  // Check admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect('/auth/signin');
    }
    if (!isAdmin) {
      return NextResponse.redirect('/earner/listings');
    }
  }
  // ... other checks
});
```

### 4. API Route Protection

**Updated Admin API** (`src/app/api/admin/connect-payment/route.ts`):
```typescript
const session = await auth();

if (!session?.user?.isAdmin) {
  return NextResponse.json(
    { error: 'Forbidden: Admin access required' },
    { status: 403 }
  );
}
```

### 5. UI Protection

**Updated Admin Page** (`src/app/admin/page.tsx`):
- Shows "Access Denied" message for non-admin users
- Provides button to navigate back to home
- Maintains dark mode support

## Access Control Flow

```
User tries to access /admin
    ↓
Middleware checks authentication
    ↓ (not logged in)
    Redirect to /auth/signin
    ↓ (logged in)
Middleware checks isAdmin
    ↓ (isAdmin = false)
    Redirect to /earner/listings
    ↓ (isAdmin = true)
Admin page checks isAdmin
    ↓ (isAdmin = false)
    Show "Access Denied" UI
    ↓ (isAdmin = true)
API checks isAdmin
    ↓ (isAdmin = false)
    Return 403 Forbidden
    ↓ (isAdmin = true)
    Allow admin action
```

## Granting Admin Access

### Option 1: Prisma Studio (Easiest)
1. Run `pnpm prisma studio`
2. Open http://localhost:5555
3. Navigate to User table
4. Find user → Set `isAdmin` to `true`

### Option 2: SQL Query
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'admin@example.com';
```

### Option 3: Prisma Client
```typescript
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { isAdmin: true },
});
```

## Security Features

✅ **Multi-Layer Protection:**
1. **Middleware** - Redirects unauthorized users
2. **API Routes** - Returns 403 for non-admins
3. **UI Components** - Shows appropriate error messages

✅ **Session-Based:**
- Admin status checked on every request
- Stored in JWT and session
- No client-side manipulation possible

✅ **Default Secure:**
- All new users have `isAdmin: false` by default
- Must be explicitly granted admin access

## Testing

### Test Admin Access:
1. Create a user account
2. Set `isAdmin = true` in database
3. Sign in
4. Navigate to `/admin`
5. Should see admin panel

### Test Non-Admin:
1. Create a user account
2. Leave `isAdmin = false` (default)
3. Sign in
4. Try to navigate to `/admin`
5. Should be redirected to `/earner/listings`

### Test API Protection:
```bash
# Non-admin user
curl -X POST http://localhost:3000/api/admin/connect-payment \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "pay_xxx", "recruiterEmail": "test@example.com"}'

# Expected: 403 Forbidden
```

## Files Modified

- ✅ `prisma/schema.prisma`
- ✅ `prisma/migrations/20251110190905_add_is_admin/migration.sql`
- ✅ `src/types/next-auth.d.ts`
- ✅ `src/lib/auth.ts`
- ✅ `src/middleware.ts`
- ✅ `src/app/api/admin/connect-payment/route.ts`
- ✅ `src/app/admin/page.tsx`
- ✅ `ADMIN_SETUP.md`

## Future Enhancements

- [ ] UI for admins to grant/revoke admin access to other users
- [ ] Audit log for admin actions
- [ ] Multiple admin permission levels (super admin, moderator, etc.)
- [ ] Admin dashboard with platform analytics
- [ ] Email notification when admin access is granted

## Deployment Notes

**For Vercel:**
- Migration will be applied automatically via `prisma migrate deploy`
- Set first admin manually after deployment using Vercel Postgres SQL Editor:
  ```sql
  UPDATE "User" SET "isAdmin" = true WHERE email = 'your-admin@example.com';
  ```

**Environment Variables:**
- No new environment variables required
- Existing `DATABASE_URL` and auth variables sufficient

