import { NextResponse } from 'next/server';
import { refreshPrices } from '@/utils/refreshPrices';
import { refreshProductInfo } from '@/utils/refreshProductInfo';
import { getAllCachedProducts } from '@/utils/cacheHandler';

export async function GET() {
  try {
    console.log('API hit - refreshing prices and product info');
    await refreshPrices();
    await refreshProductInfo();
    const products = await getAllCachedProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in /api/deals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}