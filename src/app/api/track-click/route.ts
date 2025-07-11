import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db');
    const { asin, timestamp } = await request.json();

    if (!asin) {
      return NextResponse.json({ error: 'Missing asin' }, { status: 400 });
    }

    await prisma.$executeRaw`INSERT INTO clicks (asin, timestamp) VALUES (${asin}, ${timestamp ? new Date(timestamp) : new Date()})`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}