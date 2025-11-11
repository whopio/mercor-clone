# Whop Integration Setup Guide

This guide explains how to set up Whop's embedded checkout for adding funds to recruiter accounts.

## Prerequisites

1. A Whop account ([signup at whop.com](https://whop.com/sell))
2. Access to your Whop dashboard

## Step 1: Get Your Whop Company ID

1. Go to your [Whop Dashboard](https://whop.com/dashboard)
2. Copy the ID from the URL. It should look like https://whop.com/dashboard/biz_xxxxxxxxxxxx
   
**Note:** You don't need to manually create products or plans. The API will create one-time payment plans dynamically based on the amount the user enters.

## Step 2: Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Whop Configuration
PLATFORM_COMPANY_ID="biz_XXXXXXXXX"        # Your Whop company ID from Step 1
WHOP_API_KEY="whop_XXXXXXXXX"          # Your Whop API key (get from dashboard)
WHOP_WEBHOOK_SECRET="whsec_XXXXXXXXX"  # Your Whop webhook secret (get from webhook setup)
```

### Getting Your API Key:
1. Go to **Developer** > **API Keys** in your [Whop dashboard](https://whop.com/dashboard)
2. Create a new API key with appropriate permissions
3. Copy the key and add it to your `.env.local`

## Step 3: Set Up Webhooks

1. Go to **Developer** > **Webhooks** in your [Whop dashboard](https://whop.com/dashboard)
2. Click **Add Endpoint**
3. Set the URL to: `https://yourdomain.com/api/whop/events`
4. Subscribe to these events:
   - `payment.pending` - Track when payment is initiated
   - `payment.succeeded` - Process successful payments
   - `payment.failed` - Track failed payments
5. Copy the **Webhook Secret** and add it to your `.env.local`

## Step 4: Register Your Domain for Apple Pay (Optional)

To enable Apple Pay in the embedded checkout:

1. Go to your Whop product settings
2. Click **Configure** in the **Payment domains** section
3. Add your domain
4. Download the verification file: `apple-developer-merchantid-domain-association`
5. Host it at: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`

## How It Works

### User Flow:

1. Recruiter clicks "Add Funds" on the Balance page
2. Enters the amount they want to add (minimum $1.00)
3. Clicks "Proceed to Checkout"
4. Whop's embedded checkout appears in the modal
5. User completes payment
6. Webhook is triggered, creating a credit ledger entry
7. Balance is updated immediately

### Technical Flow:

```
1. Frontend (AddFundsModal)
   ↓ User enters amount (e.g., $100)
   
2. POST /api/checkout/create-session
   ↓ Calls Whop API: POST /checkout_configurations
   ↓ Creates one-time plan with metadata { recruiterId, amount, type: 'add_funds' }
   ↓ Returns planId
   
3. WhopCheckoutEmbed Component
   ↓ Loads checkout with planId
   ↓ User initiates payment
   
4. Whop sends webhook → POST /api/whop/events
   ↓ Event: payment.pending
   ↓ Creates Payment record with status "pending"
   
5. User completes payment
   
6. Whop sends webhook → POST /api/whop/events
   ↓ Event: payment.succeeded
   ↓ Updates Payment record status to "succeeded"
   ↓ Creates LedgerEntry connected to Payment
   
7. Database
   ↓ Payment: tracks payment lifecycle
   ↓ LedgerEntry: credit entry linked to payment
   
8. Balance updates on frontend
```

## Payment & Ledger System

### Payment Tracking
The `Payment` table tracks all Whop payments:
- `id`: Whop payment ID
- `amount`: Payment amount
- `currency`: Currency code (USD)
- `status`: Payment status (pending, succeeded, failed)
- `metadata`: Full metadata from Whop
- `recruiterId`: Who made the payment

### Ledger System
The `LedgerEntry` table tracks balance changes:
- **Credits**: Funds added to account (positive balance)
- **Debits**: Funds used to pay for completed gigs (negative balance)

Each entry includes:
- `amount`: Transaction amount
- `currency`: Currency code (USD)
- `transactionType`: "credit" or "debit"
- `description`: Human-readable description
- `idempotencyKey`: Prevents duplicate transactions
- `paymentId`: Links to Payment record (if applicable)

### Relationship
- Payments track the lifecycle of Whop payments (pending → succeeded/failed)
- LedgerEntries are only created when payment succeeds
- Each LedgerEntry can be linked to a Payment for full traceability

## Testing Locally

For local development:

1. Use [ngrok](https://ngrok.com) to expose your local server:
   ```bash
   ngrok http 3000
   ```

2. Update your Whop webhook URL to the ngrok URL:
   ```
   https://your-ngrok-url.ngrok.io/api/whop/events
   ```

3. Use Whop's test mode for payments

## Production Deployment

1. Deploy your application to production (e.g., Vercel)
2. Update environment variables in your hosting platform
3. Update Whop webhook URL to your production URL
4. Register your production domain for Apple Pay
5. Test with real payments in Whop's live mode

## Security Considerations

- **Always verify webhook signatures** to ensure requests are from Whop
- Store API keys securely (never commit to git)
- Use HTTPS for all webhook endpoints

## Documentation References

- [Whop Checkout Embed Docs](https://docs.whop.com/payments/checkout-embed)
- [Whop API Reference](https://docs.whop.com/api-reference)
- [Whop Webhooks](https://docs.whop.com/api-reference/webhooks)

