# Admin Panel Documentation

## Overview

The admin panel provides administrative tools for managing the Swift Gig platform. Currently, it includes a payment connection tool that allows manual assignment of Whop payments to recruiter accounts.

## Accessing the Admin Panel

**URL:** `/admin`

**Authentication:** Requires a valid user session (any authenticated user can access)

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

⚠️ **Important:**
- Currently accessible to any authenticated user
- Consider adding role-based access control for production
- All actions are logged to the console
- Payment API calls use the platform's `WHOP_API_KEY`

## Environment Variables Required

```bash
WHOP_API_KEY=your_whop_api_key
```

## Future Enhancements

Potential features to add:
- Role-based access control (admin-only access)
- Activity log/audit trail
- Bulk payment import
- Payment reconciliation tools
- User management features
- Listing management tools

