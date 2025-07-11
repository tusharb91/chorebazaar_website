import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { asin, timestamp } = await request.json();

    if (!asin || !timestamp) {
      return NextResponse.json({ error: 'Missing asin or timestamp' }, { status: 400 });
    }

    const click = await prisma.click.create({
      data: {
        asin,
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({ success: true, click });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}