import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { whopSdk } from '@/lib/whop-sdk';

export async function POST() {
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

    // Create sub-company via Whop SDK
    // Reference: https://docs.whop.com/api-reference/companies/create-company
    let whopCompanyData;
    try {
      whopCompanyData = await whopSdk.companies.create({
        email: user.email,
        parent_company_id: process.env.PLATFORM_COMPANY_ID,
        title: user.name || user.email.split('@')[0],
      });

      if (!whopCompanyData || !whopCompanyData.id) {
        throw new Error('No company data returned from Whop');
      }
    } catch (whopError) {
      console.error('Whop SDK error:', whopError);
      return NextResponse.json(
        { error: 'Failed to create payout account', details: whopError instanceof Error ? whopError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Save Whop company to database
    const whopCompany = await prisma.whopCompany.create({
      data: {
        title: whopCompanyData.title,
        whopId: whopCompanyData.id,
        metadata: JSON.parse(JSON.stringify(whopCompanyData)),
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

