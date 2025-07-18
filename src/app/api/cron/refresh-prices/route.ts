import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { refreshPrices } from '@/utils/refreshPrices';

export async function GET() {
  try {
    await refreshPrices();
    return NextResponse.json({ message: 'Prices refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing prices:', error);
    return NextResponse.json({ error: 'Failed to refresh prices' }, { status: 500 });
  }
}