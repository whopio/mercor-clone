import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
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
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['Pending Acceptance', 'Requires Completion', 'Pending Delivery Review', 'Completed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if submission exists and belongs to a listing owned by the user
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

    if (submission.listing.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this submission' },
        { status: 403 }
      );
    }

    // Update submission status
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status },
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
      message: 'Submission status updated successfully',
    });
  } catch (error) {
    console.error('Update submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

