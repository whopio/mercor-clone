import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description, amount, currency, duration, type } = await request.json();

    // Validate required fields
    if (!title || !description || !amount || !duration || !type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        amount,
        currency: currency || 'USD',
        duration,
        type,
        recruiterId: session.user.id,
      },
      include: {
        recruiter: {
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
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let listings;

    if (userId) {
      // Get listings for a specific recruiter
      listings = await prisma.listing.findMany({
        where: {
          recruiterId: userId,
        },
        include: {
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          submissions: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Get all active listings
      listings = await prisma.listing.findMany({
        where: {
          status: 'Active',
        },
        include: {
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          submissions: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

