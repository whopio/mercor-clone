import PayoutsView from '@/components/PayoutsView';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function PayoutsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch user's Whop company
  const whopCompany = await prisma.whopCompany.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      whopId: true,
      createdAt: true,
    },
  });

  const payoutStatus = {
    hasCompany: !!whopCompany,
    company: whopCompany ? {
      id: whopCompany.id,
      title: whopCompany.title,
      whopId: whopCompany.whopId,
      createdAt: whopCompany.createdAt.toISOString(),
    } : null,
  };

  return <PayoutsView payoutStatus={payoutStatus} />;
}

