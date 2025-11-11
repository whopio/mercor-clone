import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be signed in to apply' },
        { status: 401 }
      );
    }

    const { listingId, message } = await request.json();

    // Validate required fields
    if (!listingId || !message) {
      return NextResponse.json(
        { error: 'Listing ID and message are required' },
        { status: 400 }
      );
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if listing is active
    if (listing.status !== 'Active') {
      return NextResponse.json(
        { error: 'This listing is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        listingId_earnerId: {
          listingId,
          earnerId: session.user.id,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already applied to this listing' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        message,
        listingId,
        earnerId: session.user.id,
      },
      include: {
        listing: {
          include: {
            recruiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
    });

    return NextResponse.json(
      {
        submission,
        message: 'Application submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only allow users to get their own submissions
    // Always use session.user.id - ignore any userId query parameter
    const submissions = await prisma.submission.findMany({
      where: {
        earnerId: session.user.id,
      },
      include: {
        listing: {
          include: {
            recruiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

