console.log('🔁 /api/deals route called');
import { uploadAsinsFromCsv } from '@/utils/uploadAsinsFromCsv';
import { NextResponse } from 'next/server';
import { getAllCachedProducts } from '@/utils/cacheHandler';
import { refreshPrices } from '@/utils/refreshPrices';
import { refreshProductInfo } from '@/utils/refreshProductInfo';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const shouldRefresh = url.searchParams.get('refresh') === 'true';

    if (shouldRefresh) {
      console.log('🔁 Manual refresh triggered');
      await uploadAsinsFromCsv('data/asins.csv');
      console.log('📥 ASINs imported from CSV');
      await refreshPrices({});
      await refreshProductInfo({});
    }

    const products = await getAllCachedProducts();
    console.log('🧪 Retrieved products from cache:', products);
    const missingAsins = products.filter(p => !p.asin);
    if (missingAsins.length > 0) {
      console.warn('⚠️ Products with missing ASINs:', missingAsins);
    }
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
console.log('✅ /api/deals responding with deals');
