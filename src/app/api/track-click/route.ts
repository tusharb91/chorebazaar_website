import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db');
    const { asin, timestamp } = await request.json();

    if (!asin) {
      return NextResponse.json({ error: 'Missing asin' }, { status: 400 });
    }

    const click = await prisma.click.create({
      data: {
        asin,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    return NextResponse.json({ success: true, click });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}