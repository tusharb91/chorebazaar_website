import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { refreshPrices } from '@/utils/refreshPrices';
import { uploadAsinsFromCsv } from '@/utils/uploadAsinsFromCsv';
import { refreshProductInfo } from '@/utils/refreshProductInfo';

export async function GET() {
  console.log('⏳ Starting price refresh cron job...');
  const start = Date.now();

  try {
    const newAsins = await uploadAsinsFromCsv('data/asins.csv');
    const stringAsins = Array.isArray(newAsins) ? newAsins.filter((asin): asin is string => typeof asin === 'string') : [];
    await refreshPrices({ asins: stringAsins });
    await refreshProductInfo({ asins: stringAsins });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ Price and product info refresh completed in ${duration}s`);
    return NextResponse.json({ message: 'Prices and product info refreshed successfully' });
  } catch (error) {
    console.error('❌ Error refreshing prices or product info:', error);
    return NextResponse.json({ error: 'Failed to refresh prices or product info' }, { status: 500 });
  }
}