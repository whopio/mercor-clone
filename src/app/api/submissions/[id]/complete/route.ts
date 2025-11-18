import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLedgerEntry, getRecruiterBalance } from '@/lib/ledger';
import { whopSdk } from '@/lib/whop-sdk';

const PLATFORM_FEE_PERCENTAGE = 0.05; // 5% platform fee

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get submission with all related data
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            recruiter: true,
          },
        },
        earner: {
          include: {
            whopCompany: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Verify the recruiter owns this listing
    if (submission.listing.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to complete this submission' },
        { status: 403 }
      );
    }

    // Check if submission is in the correct status
    if (submission.status !== 'Pending Delivery Review') {
      return NextResponse.json(
        { error: 'Submission must be in "Pending Delivery Review" status to be completed' },
        { status: 400 }
      );
    }

    // Check if already completed (has transferId)
    if (submission.transferId) {
      return NextResponse.json(
        { error: 'Submission has already been paid' },
        { status: 400 }
      );
    }

    // Check if earner has payouts setup (WhopCompany)
    if (!submission.earner.whopCompany) {
      return NextResponse.json(
        { error: 'Earner has not set up payouts yet. They need to set up their payout account before you can complete this submission.' },
        { status: 400 }
      );
    }

    // Check recruiter's balance
    const balance = await getRecruiterBalance(session.user.id);
    const listingAmount = Number(submission.listing.amount);

    if (balance < listingAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. You have $${balance.toFixed(2)} but need $${listingAmount.toFixed(2)} to complete this payment.` },
        { status: 400 }
      );
    }

    // Calculate amounts
    const platformFee = listingAmount * PLATFORM_FEE_PERCENTAGE;
    const earnerAmount = listingAmount - platformFee;

    const platformCompanyId = process.env.PLATFORM_COMPANY_ID;

    if (!platformCompanyId) {
      console.error('Missing PLATFORM_COMPANY_ID');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Whop transfer using submission ID as idempotency key
    const idempotencyKey = `submission_${submission.id}_payout`;

    try {
      const transferData = await whopSdk.transfers.create({
        amount: earnerAmount,
        currency: submission.listing.currency.toLowerCase() as 'usd',
        origin_id: platformCompanyId,
        destination_id: submission.earner.whopCompany.whopId,
        idempotence_key: idempotencyKey,
        notes: `Gig payment: ${submission.listing.title}`,
        metadata: {
          submissionId: submission.id,
          listingId: submission.listing.id,
          earnerId: submission.earnerId,
          recruiterId: submission.listing.recruiterId,
          listingAmount: listingAmount,
          platformFee: platformFee,
          earnerAmount: earnerAmount,
        },
      });

      if (!transferData || !transferData.id) {
        console.error('Failed to create transfer: No transfer data returned');
        return NextResponse.json(
          { error: 'Failed to create transfer' },
          { status: 500 }
        );
      }

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Debit the recruiter's account (amount is positive, type is 'debit')
      const debitEntry = await createLedgerEntry(
        {
          amount: listingAmount,
          currency: submission.listing.currency,
          transactionType: 'debit',
          description: `Payment for gig: ${submission.listing.title} (Earner: ${submission.earner.email})`,
          idempotencyKey: `${idempotencyKey}_debit`,
          recruiterId: session.user!.id,
        },
        tx
      );

      // 3. Update submission with transfer ID and status
      const updatedSubmission = await tx.submission.update({
        where: { id: submission.id },
        data: {
          status: 'Completed',
          transferId: transferData.id,
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

      return { updatedSubmission, debitEntry };
    });

    return NextResponse.json({
      message: 'Submission completed and payment processed successfully',
      submission: result.updatedSubmission,
      transfer: {
        id: transferData.id,
        amount: earnerAmount,
        currency: submission.listing.currency,
        platformFee: platformFee,
      },
    });
    } catch (transferError) {
      console.error('Whop transfer error:', transferError);
      return NextResponse.json(
        { error: `Failed to create transfer: ${transferError instanceof Error ? transferError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Complete submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

