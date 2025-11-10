import { prisma } from './prisma';
import { randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';

interface CreateLedgerEntryParams {
  recruiterId: string;
  amount: number;
  currency: string;
  transactionType: 'credit' | 'debit';
  description: string;
  idempotencyKey?: string;
  paymentId?: string;
}

/**
 * Creates a ledger entry for a recruiter
 * @param params - The ledger entry parameters
 * @param tx - Optional Prisma transaction client
 * @returns The created ledger entry
 */
export async function createLedgerEntry(
  params: CreateLedgerEntryParams,
  tx?: Omit<Prisma.TransactionClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
) {
  const {
    recruiterId,
    amount,
    currency,
    transactionType,
    description,
    idempotencyKey = randomBytes(16).toString('hex'),
    paymentId,
  } = params;

  const client = tx || prisma;

  // Check if entry with this idempotency key already exists
  const existingEntry = await client.ledgerEntry.findUnique({
    where: { idempotencyKey },
  });

  if (existingEntry) {
    console.log('Ledger entry already exists for idempotency key:', idempotencyKey);
    return existingEntry;
  }

  // Create the ledger entry
  const entry = await client.ledgerEntry.create({
    data: {
      amount,
      currency,
      transactionType,
      description,
      idempotencyKey,
      recruiterId,
      paymentId,
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

