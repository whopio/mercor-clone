import { prisma } from './prisma';
import { randomBytes } from 'crypto';

interface CreateLedgerEntryParams {
  recruiterId: string;
  amount: number;
  currency: string;
  transactionType: 'credit' | 'debit';
  description: string;
  idempotencyKey?: string;
}

/**
 * Creates a ledger entry for a recruiter
 * @param params - The ledger entry parameters
 * @returns The created ledger entry
 */
export async function createLedgerEntry(params: CreateLedgerEntryParams) {
  const {
    recruiterId,
    amount,
    currency,
    transactionType,
    description,
    idempotencyKey = randomBytes(16).toString('hex'),
  } = params;

  // Check if entry with this idempotency key already exists
  const existingEntry = await prisma.ledgerEntry.findUnique({
    where: { idempotencyKey },
  });

  if (existingEntry) {
    console.log('Ledger entry already exists for idempotency key:', idempotencyKey);
    return existingEntry;
  }

  // Create the ledger entry
  const entry = await prisma.ledgerEntry.create({
    data: {
      amount,
      currency,
      transactionType,
      description,
      idempotencyKey,
      recruiterId,
    },
  });

  return entry;
}

/**
 * Gets the current balance for a recruiter
 * @param recruiterId - The recruiter's user ID
 * @returns The current balance
 */
export async function getRecruiterBalance(recruiterId: string): Promise<number> {
  const entries = await prisma.ledgerEntry.findMany({
    where: { recruiterId },
  });

  let balance = 0;
  for (const entry of entries) {
    const amount = Number(entry.amount);
    if (entry.transactionType === 'credit') {
      balance += amount;
    } else if (entry.transactionType === 'debit') {
      balance -= amount;
    }
  }

  return balance;
}

