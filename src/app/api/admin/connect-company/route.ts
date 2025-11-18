import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { companyId, userEmail } = await request.json();

    // Validate inputs
    if (!companyId || !userEmail) {
      return NextResponse.json(
        { error: 'Company ID and user email are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { whopCompany: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${userEmail} not found` },
        { status: 404 }
      );
    }

    // Check if user already has a Whop company
    if (user.whopCompany) {
      return NextResponse.json(
        { error: `User already has a Whop company connected (${user.whopCompany.whopId})` },
        { status: 409 }
      );
    }

    // Fetch company details from Whop SDK
    let companyData;
    try {
      companyData = await whopSdk.companies.retrieve(companyId);

      if (!companyData || !companyData.id) {
        throw new Error('No company data returned from Whop');
      }
    } catch (whopError) {
      console.error('Whop SDK error:', whopError);
      return NextResponse.json(
        { error: `Failed to fetch company from Whop: ${whopError instanceof Error ? whopError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Create WhopCompany record
    const whopCompany = await prisma.whopCompany.create({
      data: {
        title: companyData.title,
        whopId: companyData.id,
        metadata: companyData as any,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: 'Company connected successfully',
        whopCompany: {
          id: whopCompany.id,
          title: whopCompany.title,
          whopId: whopCompany.whopId,
          userId: whopCompany.userId,
          userEmail: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Connect company error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

