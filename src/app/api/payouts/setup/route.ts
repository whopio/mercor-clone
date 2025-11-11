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

    // Check if user already has a Whop company
    const existingCompany = await prisma.whopCompany.findUnique({
      where: { userId: session.user.id },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Payout account already exists' },
        { status: 400 }
      );
    }

    // Get user data for creating the company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create sub-company via Whop API
    // Reference: https://docs.whop.com/api-reference/companies/create-company
    const whopResponse = await fetch('https://api.whop.com/api/v1/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
      },
      body: JSON.stringify({
        email: user.email,
        parent_company_id: process.env.PLATFORM_COMPANY_ID,
        title: user.name || user.email.split('@')[0],
      }),
    });

    if (!whopResponse.ok) {
      const errorData = await whopResponse.json();
      console.error('Whop API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create payout account', details: errorData },
        { status: whopResponse.status }
      );
    }

    const whopCompanyData = await whopResponse.json();

    // Save Whop company to database
    const whopCompany = await prisma.whopCompany.create({
      data: {
        title: whopCompanyData.title,
        whopId: whopCompanyData.id,
        metadata: whopCompanyData as any,
        userId: session.user.id,
      },
    });

    console.log(`✅ Created Whop company ${whopCompany.whopId} for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      company: {
        id: whopCompany.id,
        title: whopCompany.title,
        whopId: whopCompany.whopId,
      },
    });
  } catch (error) {
    console.error('❌ Setup payouts error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

