# Admin Panel Documentation

## Overview

The admin panel provides administrative tools for managing the Swift Gig platform. Currently, it includes a payment connection tool that allows manual assignment of Whop payments to recruiter accounts.

## Accessing the Admin Panel

**URL:** `/admin`

**Authentication:** Requires admin privileges (`isAdmin: true` in the User table)

**Authorization:**
- User must be logged in
- User must have `isAdmin` field set to `true` in the database
- Non-admin users will be redirected to `/earner/listings`
- Unauthenticated users will be redirected to `/auth/signin`

## Features

### Manual Payment Connection

Connect a Whop payment to a specific recruiter account manually.

#### Use Case
- When a payment needs to be manually attributed to a recruiter
- For testing payment flows
- For correcting payment attribution issues

#### How It Works

1. **Navigate to** `/admin`
2. **Enter Payment Details:**
   - **Payment ID**: The Whop payment ID (format: `pay_xxxxxxxxxxxxx`)
   - **Recruiter Email**: The email address of the recruiter who should receive credit

3. **Click "Connect Payment"**

4. **System Actions:**
   - ✅ Validates that the payment doesn't already exist in the database
   - ✅ Retrieves payment details from Whop API
   - ✅ Finds the recruiter by email address
   - ✅ Creates a Payment record in the database
   - ✅ If payment status is "succeeded", creates a LedgerEntry (credit)
   - ✅ Updates the recruiter's balance

#### Validation Rules

- **Payment ID** is required and must exist in Whop
- **Recruiter Email** must match an existing user in the database
- **Payment must NOT already exist** in the database (prevents duplicates)

#### Success Response

When successful, you'll see:
- Payment ID
- Amount and currency
- Payment status
- Recruiter email
- Whether a ledger entry was created

#### Error Scenarios

| Error | Reason |
|-------|--------|
| "Payment already exists in database" | This payment has already been processed |
| "Recruiter not found" | No user exists with that email address |
| "Failed to retrieve payment from Whop" | Invalid payment ID or Whop API error |
| "Unauthorized" | Not logged in |

## Technical Details

### API Endpoint

**POST** `/api/admin/connect-payment`

```json
{
  "paymentId": "pay_xxxxxxxxxxxxx",
  "recruiterEmail": "recruiter@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "payment": {
    "id": "pay_xxxxxxxxxxxxx",
    "amount": 100.00,
    "currency": "USD",
    "status": "succeeded",
    "recruiterId": "user_xxxxx",
    "recruiterEmail": "recruiter@example.com"
  },
  "ledgerEntry": {
    "id": "ledger_xxxxx",
    "amount": 100.00,
    "currency": "USD"
  }
}
```

### Database Changes

When a payment is connected:

1. **Payment Table**
   - Creates new record with payment details from Whop
   - Links to recruiter via `recruiterId`
   - Stores full Whop payment data in `metadata` field

2. **LedgerEntry Table** (if payment succeeded)
   - Creates credit entry for recruiter
   - Amount matches payment total
   - Links to payment via `paymentId`
   - Uses idempotency key: `payment_{paymentId}`

### Security Considerations

✅ **Security Features:**
- Only users with `isAdmin: true` can access `/admin` routes
- Middleware checks authentication and admin status
- API routes verify admin privileges before processing
- Non-admin users are redirected automatically
- All actions are logged to the console
- Payment API calls use the platform's `WHOP_API_KEY`

## Granting Admin Access

To grant admin privileges to a user:

### Method 1: Using Prisma Studio

1. Run `pnpm prisma studio` (opens at http://localhost:5555)
2. Navigate to the `User` table
3. Find the user you want to make admin
4. Click on the user's row
5. Set `isAdmin` to `true`
6. Save changes

### Method 2: Using Database Query

Execute this SQL query in your database:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'admin@example.com';
```

### Method 3: Using Prisma Client (in code/script)

```typescript
import { prisma } from '@/lib/prisma';

await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { isAdmin: true },
});
```

⚠️ **Important:** There is currently no UI for granting admin access. It must be done directly in the database.

## Environment Variables Required

```bash
WHOP_API_KEY=your_whop_api_key
```

## Future Enhancements

Potential features to add:
- UI for granting/revoking admin access
- Activity log/audit trail for admin actions
- Bulk payment import
- User management dashboard
- Platform analytics and reporting
- Payment reconciliation tools
- User management features
- Listing management tools

