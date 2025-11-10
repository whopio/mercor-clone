import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paymentId, recruiterEmail } = await request.json();

    // Validate inputs
    if (!paymentId || !recruiterEmail) {
      return NextResponse.json(
        { error: 'Payment ID and recruiter email are required' },
        { status: 400 }
      );
    }

    // Check if payment already exists in database
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists in database. Cannot manually connect existing payments.' },
        { status: 400 }
      );
    }

    // Find recruiter by email
    const recruiter = await prisma.user.findUnique({
      where: { email: recruiterEmail },
    });

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter not found with that email address' },
        { status: 404 }
      );
    }

    // Retrieve payment from Whop API
    const whopResponse = await fetch(`https://api.whop.com/api/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
      },
    });

    if (!whopResponse.ok) {
      const errorData = await whopResponse.json();
      console.error('Whop API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to retrieve payment from Whop', details: errorData },
        { status: whopResponse.status }
      );
    }

    const whopPaymentData = await whopResponse.json();

    // Extract payment details (matching webhook structure)
    const paymentAmount = whopPaymentData.total || 0;
    const paymentCurrency = (whopPaymentData.currency || 'usd').toUpperCase();
    const paymentStatus = whopPaymentData.substatus || whopPaymentData.status || 'unknown';

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        id: paymentId,
        amount: paymentAmount,
        currency: paymentCurrency,
        status: paymentStatus,
        metadata: whopPaymentData as any,
        recruiterId: recruiter.id,
      },
    });

    console.log(`✅ Manually connected payment ${paymentId} to recruiter ${recruiter.email}`);

    // If payment is successful and has amount, create ledger entry
    let ledgerEntry = null;
    if (paymentStatus === 'succeeded' && paymentAmount > 0) {
      const idempotencyKey = `payment_${paymentId}`;
      
      // Check if ledger entry already exists
      const existingEntry = await prisma.ledgerEntry.findUnique({
        where: { idempotencyKey },
      });

      if (!existingEntry) {
        ledgerEntry = await prisma.ledgerEntry.create({
          data: {
            amount: paymentAmount,
            currency: paymentCurrency,
            transactionType: 'credit',
            description: `Manually connected payment (${paymentCurrency} ${paymentAmount})`,
            idempotencyKey,
            recruiterId: recruiter.id,
            paymentId: paymentId,
          },
        });

        console.log(`✅ Created ledger entry for ${paymentAmount} ${paymentCurrency}`);
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        recruiterId: payment.recruiterId,
        recruiterEmail: recruiter.email,
      },
      ledgerEntry: ledgerEntry ? {
        id: ledgerEntry.id,
        amount: Number(ledgerEntry.amount),
        currency: ledgerEntry.currency,
      } : null,
    });
  } catch (error) {
    console.error('❌ Connect payment error:', error);
    return NextResponse.json(
      { error: 'Something went wrong', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

