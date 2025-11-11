import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency = 'USD' } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!process.env.WHOP_API_KEY) {
      return NextResponse.json(
        { error: 'Whop API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.PLATFORM_COMPANY_ID) {
      return NextResponse.json(
        { error: 'Whop company ID not configured' },
        { status: 500 }
      );
    }

    // Create a checkout configuration with Whop API
    const whopResponse = await fetch('https://api.whop.com/api/v1/checkout_configurations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: {
          company_id: process.env.PLATFORM_COMPANY_ID,
          visibility: 'visible',
          plan_type: 'one_time',
          release_method: 'buy_now',
          currency: currency.toLowerCase(),
          initial_price: amount,
        },
        metadata: {
          recruiterId: session.user.id,
          amount: amount.toString(),
          currency: currency,
          type: 'add_funds',
        },
        // Only set redirect_url if we have a valid HTTPS URL (production)
        // For local development, Whop will use their default redirect
        ...(process.env.HOST_URL && process.env.HOST_URL.startsWith('https://') 
          ? { redirect_url: process.env.HOST_URL }
          : {}),
      }),
    });

    if (!whopResponse.ok) {
      const errorData = await whopResponse.json().catch(() => ({}));
      console.error('Whop API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create checkout configuration' },
        { status: whopResponse.status }
      );
    }

    const checkoutConfig = await whopResponse.json();
    
    return NextResponse.json({
      checkoutConfigId: checkoutConfig.id,
      planId: checkoutConfig.plan.id,
      purchaseUrl: checkoutConfig.purchase_url,
      metadata: checkoutConfig.metadata,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
