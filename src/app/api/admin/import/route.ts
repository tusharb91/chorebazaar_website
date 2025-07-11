import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { importAsinsFromKeywords } = await import('@/utils/ImportAsinsFromKeywords');

    await importAsinsFromKeywords();

    return NextResponse.json({ success: true, message: 'ASIN import complete.' });
  } catch (error) {
    console.error('❌ Error in admin import route:', error);
    return NextResponse.json({ success: false, message: 'Import failed.' }, { status: 500 });
  }
}