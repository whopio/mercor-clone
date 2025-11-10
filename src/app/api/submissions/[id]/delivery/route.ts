import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { deliveryMaterials } = await request.json();

    // Validate delivery materials
    if (!deliveryMaterials || deliveryMaterials.trim() === '') {
      return NextResponse.json(
        { error: 'Delivery materials are required' },
        { status: 400 }
      );
    }

    // Check if submission exists and belongs to the user
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.earnerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to submit delivery for this submission' },
        { status: 403 }
      );
    }

    // Check if submission is in the correct status
    if (submission.status !== 'Requires Completion') {
      return NextResponse.json(
        { error: 'This submission is not ready for delivery. Current status: ' + submission.status },
        { status: 400 }
      );
    }

    // Update submission with delivery materials and change status
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        deliveryMaterials,
        status: 'Pending Delivery Review',
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

    return NextResponse.json({
      submission: updatedSubmission,
      message: 'Delivery submitted successfully',
    });
  } catch (error) {
    console.error('Submit delivery error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

