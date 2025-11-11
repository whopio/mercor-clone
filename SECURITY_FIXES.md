# Security Fixes - User Data Access Control

## Overview

Fixed critical security vulnerabilities that allowed users to access other users' data by manipulating query parameters.

## Vulnerabilities Fixed

### 1. Submissions API Unauthorized Access 🔴 CRITICAL

**Vulnerability:**
- API endpoint: `GET /api/submissions`
- Accepted `userId` query parameter
- Anyone could pass `?userId=another_user_id` to view another user's submissions

**Impact:**
- ❌ Unauthorized access to private submission data
- ❌ Exposure of application messages
- ❌ Exposure of delivery materials
- ❌ Exposure of submission status and history

**Fix:**
```typescript
// BEFORE (Vulnerable)
const userId = searchParams.get('userId');
const submissions = await prisma.submission.findMany({
  where: {
    earnerId: userId || session.user.id, // ❌ Accepts any userId
  },
});

// AFTER (Secure)
const submissions = await prisma.submission.findMany({
  where: {
    earnerId: session.user.id, // ✅ Always uses authenticated user
  },
});
```

**Files Modified:**
- ✅ `src/app/api/submissions/route.ts`
- ✅ `src/components/SubmissionsView.tsx` (removed userId parameter)

---

### 2. Listings API Unauthorized Access 🔴 CRITICAL

**Vulnerability:**
- API endpoint: `GET /api/listings?userId=...`
- Accepted `userId` query parameter
- Anyone could pass `?userId=another_recruiter_id` to view their private listings
- **Included sensitive submission data for all listings**

**Impact:**
- ❌ Unauthorized access to recruiter's listings
- ❌ Exposure of **ALL submissions** to recruiter's listings
- ❌ Could see who applied, their messages, delivery materials
- ❌ Complete breakdown of privacy

**Fix:**
```typescript
// BEFORE (Vulnerable)
if (userId) {
  listings = await prisma.listing.findMany({
    where: {
      recruiterId: userId, // ❌ Accepts any userId
    },
    include: {
      submissions: true, // ❌ Exposes all submission data
    },
  });
}

// AFTER (Secure)
if (userId) {
  const session = await auth();
  
  // ✅ Must be authenticated
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ✅ Can only access own listings
  if (userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  listings = await prisma.listing.findMany({
    where: {
      recruiterId: session.user.id, // ✅ Always uses authenticated user
    },
    include: {
      submissions: true, // ✅ Only visible to owner
    },
  });
} else {
  // Public listings - NO submission data
  listings = await prisma.listing.findMany({
    where: { status: 'Active' },
    // ✅ submissions: true removed
  });
}
```

**Files Modified:**
- ✅ `src/app/api/listings/route.ts`

**Additional Security Enhancement:**
- Removed `submissions: true` from public listings query
- Public users can no longer see submission counts or data

---

## Security Model

### Submissions (Private)
- ✅ Users can ONLY view their own submissions
- ✅ No query parameters accepted
- ✅ Session ID is the source of truth

### Listings

**Public Listings (No userId):**
- ✅ Anyone can view (no auth required)
- ✅ Shows: title, description, amount, recruiter info
- ✅ Does NOT show: submissions data

**Private Listings (With userId):**
- ✅ Must be authenticated
- ✅ Can ONLY view own listings
- ✅ Returns 403 if trying to access another user's listings
- ✅ Includes submissions data (only for owner)

---

## Testing Security

### Test 1: Submissions Unauthorized Access (FIXED)
```bash
# Try to access another user's submissions
curl http://localhost:3000/api/submissions?userId=another_user_id \
  -H "Cookie: your-session-cookie"

# Expected: Returns YOUR submissions, ignores userId parameter
```

### Test 2: Listings Unauthorized Access (FIXED)
```bash
# Try to access another recruiter's listings
curl http://localhost:3000/api/listings?userId=another_recruiter_id \
  -H "Cookie: your-session-cookie"

# Expected: 403 Forbidden
```

### Test 3: Public Listings (Working as Expected)
```bash
# Get all active listings (no auth needed)
curl http://localhost:3000/api/listings

# Expected: 200 OK with active listings (no submissions data)
```

### Test 4: Own Listings (Working as Expected)
```bash
# Get your own listings
curl http://localhost:3000/api/listings?userId=your_user_id \
  -H "Cookie: your-session-cookie"

# Expected: 200 OK with your listings (includes submissions)
```

---

## Authentication Flow

```
Request → API Endpoint
    ↓
Check Authentication (session)
    ↓ (not authenticated)
    Return 401 Unauthorized
    ↓ (authenticated)
Validate Authorization
    ↓ (accessing other user's data)
    Return 403 Forbidden
    ↓ (accessing own data)
Execute Query with session.user.id
    ↓
Return Data
```

---

## Best Practices Implemented

✅ **Never trust client input for identity**
- Always use `session.user.id` as source of truth
- Never accept `userId` from query params for private data

✅ **Principle of Least Privilege**
- Public endpoints show minimal data
- Private endpoints require authentication
- User-specific endpoints verify ownership

✅ **Defense in Depth**
- Middleware authentication
- API route authentication
- API route authorization
- Database queries scoped to user

✅ **Data Minimization**
- Public listings don't include submission counts
- Submission data only visible to relevant parties

---

## Other API Routes Reviewed

### ✅ Secure Routes

**`/api/submissions/[id]/route.ts` (Update submission status)**
- ✅ Checks listing ownership before allowing status updates
- ✅ Validates recruiter owns the listing

**`/api/submissions/[id]/delivery/route.ts` (Submit delivery)**
- ✅ Checks submission ownership
- ✅ Earner can only submit delivery for their own submissions

**`/api/submissions/[id]/complete/route.ts` (Complete & Pay)**
- ✅ Checks listing ownership
- ✅ Validates recruiter owns the listing

**`/api/submissions/recruiter/route.ts` (Recruiter submissions)**
- ✅ Only returns submissions for listings owned by authenticated user
- ✅ No user ID parameter accepted

**`/api/listings/[id]/route.ts` (Update/Delete listing)**
- ✅ Checks listing ownership
- ✅ Only owner can modify/delete

---

## Impact Summary

### Before Fixes
- ⚠️ **HIGH RISK**: Any authenticated user could view:
  - Other users' submissions (messages, deliveries, status)
  - Other recruiters' listings with full submission data
  - Complete breakdown of privacy

### After Fixes
- ✅ **SECURE**: Users can only access their own data
- ✅ Authorization checks at API layer
- ✅ Public data properly scoped
- ✅ Private data protected

---

## Deployment Checklist

- [x] Regenerate Prisma Client (`pnpm prisma generate`)
- [x] Restart dev server
- [x] Test API endpoints
- [ ] Update Vercel deployment
- [ ] Verify production behavior
- [ ] Run security audit

---

## Future Security Enhancements

- [ ] Add rate limiting to API routes
- [ ] Implement API request logging/auditing
- [ ] Add CSRF protection
- [ ] Implement webhook signature verification
- [ ] Add automated security testing
- [ ] Set up monitoring for unauthorized access attempts

