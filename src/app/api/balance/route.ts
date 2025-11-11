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

    // Fetch all payments for the recruiter
    const payments = await prisma.payment.findMany({
      where: {
        recruiterId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch all ledger entries for the recruiter
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        recruiterId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate balance
    let balance = 0;
    for (const entry of entries) {
      const amount = Number(entry.amount);
      if (!isNaN(amount)) {
        if (entry.transactionType === 'credit') {
          balance += amount;
        } else if (entry.transactionType === 'debit') {
          balance -= amount;
        }
      }
    }

    return NextResponse.json({
      balance: balance || 0,
      currency: 'USD',
      payments: payments || [],
      entries: entries || [],
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

