import { NextResponse } from 'next/server';
import { getAllCachedProducts } from '@/utils/cacheHandler';

export async function GET() {
  try {
    console.log('API hit - refreshing prices and product info');
    const { refreshPrices } = await import('@/utils/refreshPrices');
    const { refreshProductInfo } = await import('@/utils/refreshProductInfo');
    // const { prisma } = await import('@/lib/db');
    await refreshPrices();
    await refreshProductInfo();
    const products = await getAllCachedProducts();
    if (!products || !Array.isArray(products)) {
      console.error('❌ Invalid or missing product cache');
      return NextResponse.json({ error: 'No valid deals found' }, { status: 400 });
    }

    return NextResponse.json({ deals: products });
  } catch (error) {
    console.error('🔥 Error in /api/deals:', error instanceof Error ? error.stack || error.message : error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}