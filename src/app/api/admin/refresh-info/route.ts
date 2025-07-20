// src/app/api/admin/refresh-info/route.ts
import { NextResponse } from 'next/server';
import { refreshProductInfo } from '@/utils/refreshProductInfo';
import { refreshPrices } from '@/utils/refreshPrices';

export async function GET() {
  try {
    await refreshProductInfo({});
    await refreshPrices({});
    return NextResponse.json({ message: 'Refresh started' });
  } catch (err) {
    console.error('Failed to refresh info:', err);
    return NextResponse.json({ error: 'Failed to refresh info' }, { status: 500 });
  }
}