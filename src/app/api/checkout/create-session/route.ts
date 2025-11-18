import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { whopSdk } from '@/lib/whop-sdk';

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

    if (!process.env.PLATFORM_COMPANY_ID) {
      return NextResponse.json(
        { error: 'Whop company ID not configured' },
        { status: 500 }
      );
    }

    // Create a checkout configuration with Whop SDK
    let checkoutConfig;
    try {
      checkoutConfig = await whopSdk.checkoutConfigurations.create({
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
      });

      if (!checkoutConfig || !checkoutConfig.id) {
        throw new Error('No checkout configuration returned from Whop');
      }
    } catch (whopError) {
      console.error('Whop SDK error:', whopError);
      return NextResponse.json(
        { error: 'Failed to create checkout configuration' },
        { status: 500 }
      );
    }
    
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
