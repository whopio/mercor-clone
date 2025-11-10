import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// This endpoint will be called by Whop when events occur
// You need to configure this webhook URL in your Whop dashboard
// Example: https://yourdomain.com/api/whop/events

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const signature = headersList.get('whop-signature');

    // TODO: Verify the webhook signature to ensure it's from Whop
    // const isValid = verifyWhopSignature(signature, body, process.env.WHOP_WEBHOOK_SECRET);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const body = await request.json();

    // Whop webhook payload structure
    // Reference: https://docs.whop.com/api-reference/webhooks
    const { type: eventType, data } = body;

    // Handle payment events
    if (eventType === 'payment.pending' || eventType === 'payment.succeeded' || eventType === 'payment.failed') {
      const { 
        id: paymentId, 
        total, 
        currency, 
        status, 
        substatus,
        metadata,
        plan 
      } = data;
      
      // Extract our custom metadata (from checkout configuration)
      const recruiterId = metadata?.recruiterId;
      const paymentAmount = total || parseFloat(metadata?.amount || '0');
      const paymentCurrency = (currency || 'usd').toUpperCase();
      const type = metadata?.type;

      if (!recruiterId) {
        console.log('⚠️ Skipping payment: missing recruiterId', { 
          paymentId, 
          type, 
          planId: plan?.id,
          metadata 
        });
        return NextResponse.json({ received: true });
      }

      // Determine payment status - use substatus if available, otherwise status
      let paymentStatus = substatus || status;
      if (eventType === 'payment.pending') {
        paymentStatus = 'pending';
      } else if (eventType === 'payment.succeeded') {
        paymentStatus = 'succeeded';
      } else if (eventType === 'payment.failed') {
        paymentStatus = 'failed';
      }

      // Upsert payment record
      const payment = await prisma.payment.upsert({
        where: { id: paymentId },
        create: {
          id: paymentId,
          amount: paymentAmount,
          currency: paymentCurrency,
          status: paymentStatus,
          metadata: data as any, // Store full payment data from Whop
          recruiterId,
        },
        update: {
          status: paymentStatus,
          metadata: data as any, // Update with latest data
          updatedAt: new Date(),
        },
      });

      console.log(`📝 Payment ${paymentId} status: ${paymentStatus} (${eventType})`);

      // Only create ledger entry on successful payment
      if (eventType === 'payment.succeeded' && type === 'add_funds' && paymentAmount > 0) {
        // Check if ledger entry already exists for this payment
        const existingEntry = await prisma.ledgerEntry.findUnique({
          where: { idempotencyKey: `payment_${paymentId}` },
        });

        if (!existingEntry) {
          // Create a credit ledger entry connected to the payment
          await prisma.ledgerEntry.create({
            data: {
              amount: paymentAmount,
              currency: paymentCurrency,
              transactionType: 'credit',
              description: `Funds added via payment (${paymentCurrency} ${paymentAmount})`,
              idempotencyKey: `payment_${paymentId}`,
              recruiterId,
              paymentId,
            },
          });

          console.log(`✅ Added ${paymentAmount} ${paymentCurrency} to recruiter ${recruiterId}`);
        } else {
          console.log(`ℹ️ Ledger entry already exists for payment ${paymentId}`);
        }
      }

      return NextResponse.json({ received: true });
    }

    // Handle other events here as needed
    console.log(`📨 Received event: ${eventType}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

