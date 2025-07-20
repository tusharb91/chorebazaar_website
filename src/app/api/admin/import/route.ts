import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { uploadAsinsFromCsv } = await import('@/utils/uploadAsinsFromCsv');

    await uploadAsinsFromCsv('data/asins.csv'); // ✅ Added required filePath argument

    const allProducts = await prisma.product.findMany();
    console.log(allProducts.map(p => p.asin));

    return NextResponse.json({ success: true, message: 'ASIN import complete.' });
  } catch (error) {
    console.error('❌ Error in admin import route:', error);
    return NextResponse.json({ success: false, message: 'Import failed.' }, { status: 500 });
  }
}