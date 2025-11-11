# Payment and Payout Flow

This document explains how payments work in Swift Gig, from recruiter adding funds to earner receiving payouts.

## Overview

Swift Gig uses [Whop](https://whop.com) for payment processing and fund transfers. The platform charges a **5% fee** on all completed gigs.

## Flow Diagram

```
1. Recruiter adds funds → Whop Checkout → Platform receives payment
2. Earner applies to gig → Recruiter approves → Earner completes work
3. Recruiter marks complete → Funds debited from balance → Transfer to earner (95%)
4. Platform retains 5% fee
```

## Step-by-Step Process

### 1. Recruiter Adds Funds

**Location:** `/recruiter/balance` page

- Recruiter enters amount they want to add
- System creates a Whop checkout configuration via API
- Whop embedded checkout appears for payment
- On successful payment:
  - Whop sends webhook to `/api/whop/events`
  - System creates `Payment` record
  - System creates `LedgerEntry` (credit) for recruiter

**API:** `POST /api/checkout/create-session`

**Webhook:** `POST /api/whop/events`

### 2. Earner Sets Up Payouts

**Location:** `/earner/payouts` page

**Requirement:** Must be done before an earner can receive payments

- Earner clicks "Setup Payouts"
- System calls Whop API to create a sub-merchant company
- Whop creates company under platform's account
- System saves `WhopCompany` record with `whopId`

**API:** `POST /api/payouts/setup`

**Whop API:** [Create Company](https://docs.whop.com/api-reference/companies/create-company)

### 3. Gig Application and Approval

**Locations:**
- Earner: `/earner/listings` (apply)
- Recruiter: `/recruiter/submissions` (approve)

**Flow:**
1. Earner applies to listing with message
2. Submission created with status `Pending Acceptance`
3. Recruiter reviews and clicks "Approve"
4. Status changes to `Requires Completion`
5. Earner completes work and submits delivery materials
6. Status changes to `Pending Delivery Review`

### 4. Completion and Payout

**Location:** `/recruiter/submissions` page

**Trigger:** Recruiter clicks "Mark Complete & Pay" button

**Requirements:**
- Submission must be in `Pending Delivery Review` status
- Earner must have `WhopCompany` set up
- Recruiter must have sufficient balance

**Process:**

1. **Validation:**
   - Check submission status
   - Check earner has `WhopCompany`
   - Check recruiter balance ≥ listing amount

2. **Calculate Amounts:**
   ```javascript
   listingAmount = $100.00
   platformFee = $100.00 × 5% = $5.00
   earnerAmount = $100.00 - $5.00 = $95.00
   ```

3. **Create Whop Transfer:**
   - Origin: Platform company (PLATFORM_COMPANY_ID)
   - Destination: Earner's Whop company (whop_id)
   - Amount: $95.00 (after platform fee)
   - Idempotency key: `submission_{submissionId}_payout`

4. **Update Database (Transaction):**
   - Create debit `LedgerEntry` for recruiter (-$100.00)
   - Create credit `LedgerEntry` for platform fee (+$5.00)
   - Update submission status to `Completed`
   - Save Whop `transferId` on submission

**API:** `POST /api/submissions/{id}/complete`

**Whop API:** [Create Transfer](https://docs.whop.com/api-reference/transfers/create-transfer)

## Database Schema

### Payment
Stores Whop payment records when recruiter adds funds.

```prisma
model Payment {
  id         String   @id // Whop payment ID
  amount     Decimal
  currency   String
  status     String   // pending, succeeded, failed
  metadata   Json?
  recruiterId String
  createdAt  DateTime
  updatedAt  DateTime
}
```

### LedgerEntry
Double-entry bookkeeping for all financial transactions.

```prisma
model LedgerEntry {
  id              String   @id
  amount          Decimal  // Always positive
  currency        String
  transactionType String   // credit or debit
  description     String
  idempotencyKey  String   @unique
  recruiterId     String
  paymentId       String?  // Link to Payment if applicable
  createdAt       DateTime
}
```

### Submission
```prisma
model Submission {
  id                String   @id
  message           String
  deliveryMaterials String?
  status            String   // Pending Acceptance, Requires Completion, Pending Delivery Review, Completed, Rejected
  transferId        String?  @unique // Whop transfer ID
  listingId         String
  earnerId          String
  submittedAt       DateTime
  updatedAt         DateTime
}
```

### WhopCompany
Stores earner's Whop sub-merchant company for payouts.

```prisma
model WhopCompany {
  id        String   @id
  title     String
  whopId    String   @unique // biz_xxxxx from Whop
  metadata  Json?
  userId    String   @unique
  createdAt DateTime
  updatedAt DateTime
}
```

## Ledger Balance Calculation

```javascript
function calculateBalance(entries) {
  let balance = 0;
  for (const entry of entries) {
    if (entry.transactionType === 'credit') {
      balance += entry.amount;  // Add credits
    } else if (entry.transactionType === 'debit') {
      balance -= entry.amount;  // Subtract debits
    }
  }
  return balance;
}
```

## Example Ledger History

| Type | Amount | Description | Balance |
|------|--------|-------------|---------|
| Credit | +$100.00 | Funds added via Whop | $100.00 |
| Debit | -$50.00 | Payment for "Social Media Post" | $50.00 |
| Credit | +$2.50 | Platform fee (5% of $50) | $52.50 |
| Debit | -$30.00 | Payment for "Logo Design" | $22.50 |
| Credit | +$1.50 | Platform fee (5% of $30) | $24.00 |

**Note:** Platform fees are recorded as credits to track platform revenue per recruiter.

## Error Handling

### Common Errors

1. **"Earner has not set up payouts yet"**
   - Earner must complete payout setup at `/earner/payouts`
   - They need a `WhopCompany` record

2. **"Insufficient balance"**
   - Recruiter needs to add funds at `/recruiter/balance`
   - Balance must be ≥ listing amount

3. **"Submission must be in 'Pending Delivery Review' status"**
   - Only submissions with delivered work can be completed
   - Earner must submit delivery materials first

4. **"Submission has already been paid"**
   - Submission has a `transferId` already
   - Cannot process payment twice (idempotency protection)

5. **Whop Transfer Errors**
   - Invalid company IDs
   - Transfer amount too small/large
   - Currency mismatch
   - Network/API errors

## Environment Variables Required

```bash
# Whop API Key (from dashboard)
WHOP_API_KEY=your_api_key_here

# Platform Company ID (your main company on Whop)
PLATFORM_COMPANY_ID=biz_xxxxxxxxxxxxx
```

## Security Considerations

1. **Idempotency:**
   - All transfers use submission ID in idempotency key
   - Prevents duplicate payments if API call retried

2. **Transactions:**
   - Database updates wrapped in Prisma transaction
   - All-or-nothing: if any step fails, everything rolls back

3. **Validation:**
   - Check user permissions (owns listing)
   - Check submission status
   - Check earner payout setup
   - Check sufficient balance

4. **Webhook Verification:**
   - Whop webhooks should verify signatures (TODO)
   - Currently trusts all webhook payloads

## Testing Checklist

- [ ] Recruiter can add funds via Whop
- [ ] Webhook creates payment and ledger entry
- [ ] Balance displays correctly
- [ ] Earner can set up payouts
- [ ] Submission flow works end-to-end
- [ ] Complete & Pay validates earner has WhopCompany
- [ ] Complete & Pay checks sufficient balance
- [ ] Transfer is created in Whop
- [ ] Submission status updates to Completed
- [ ] TransferId is saved on submission
- [ ] Ledger entries created (debit + platform fee)
- [ ] Balance updates after payment
- [ ] Cannot pay same submission twice
- [ ] Error messages are user-friendly

## Future Enhancements

1. **Webhook signature verification**
2. **Refund handling**
3. **Dispute resolution**
4. **Multiple currencies**
5. **Configurable platform fee**
6. **Payout schedule (immediate vs batched)**
7. **Email notifications on payment events**
8. **Payment receipts/invoices**

