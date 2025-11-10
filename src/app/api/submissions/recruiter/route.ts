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

    // Get all submissions for listings created by this recruiter
    const submissions = await prisma.submission.findMany({
      where: {
        listing: {
          recruiterId: session.user.id,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            amount: true,
            currency: true,
          },
        },
        earner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Get recruiter submissions error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

