import { NextResponse } from 'next/server';
import { refreshPrices as baseRefreshPrices } from '@/utils/refreshPrices';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/db');
    const refreshPrices = () => baseRefreshPrices(prisma);
    await refreshPrices();
    return NextResponse.json({ message: 'Prices refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing prices:', error);
    return NextResponse.json({ error: 'Failed to refresh prices' }, { status: 500 });
  }
}