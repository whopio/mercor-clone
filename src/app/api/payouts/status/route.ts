import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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

    return NextResponse.json({
      hasCompany: !!whopCompany,
      company: whopCompany,
    });
  } catch (error) {
    console.error('Get payout status error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

