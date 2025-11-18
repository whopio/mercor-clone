import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { whopSdk } from '@/lib/whop-sdk';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has a Whop company
    const whopCompany = await prisma.whopCompany.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        title: true,
        whopId: true,
        createdAt: true,
      },
    });

    // If user has a company, generate access token
    let token = null;
    if (whopCompany) {
      try {
        const tokenResponse = await whopSdk.accessTokens.create({
          company_id: whopCompany.whopId,
        });
        token = tokenResponse?.token || null;
      } catch (error) {
        console.error('Error generating Whop access token:', error);
        // Don't fail the whole request if token generation fails
      }
    }

    return NextResponse.json({
      hasCompany: !!whopCompany,
      company: whopCompany,
      token,
    });
  } catch (error) {
    console.error('Get payout status error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

