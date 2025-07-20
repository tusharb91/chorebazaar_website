import { prisma } from '@/lib/db';
import { AmazonProduct } from './amazonTypes';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { subHours } from 'date-fns';

export async function getAllCachedProducts(): Promise<AmazonProduct[]> {
  const csvPath = path.join(process.cwd(), 'data', 'asins.csv');
  const csvContent = await fs.promises.readFile(csvPath, 'utf-8');
  const parsed = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as { asin: string }[];

  const asins = parsed.map((row: { asin: string }) => row.asin);

  const rawProducts = await prisma.product.findMany({
    where: {
      asin: {
        in: asins,
      },
      lastPriceUpdatedAt: {
        gte: subHours(new Date(), 24),
      },
    },
    orderBy: {
      lastPriceUpdatedAt: 'desc',
    },
  });

  const missingAsins = asins.filter(a => !rawProducts.some(p => p.asin === a));
  if (missingAsins.length > 0) {
    console.warn('Missing ASINs from DB:', missingAsins);
    console.warn('⚠️ No products returned from Prisma for some ASINs');
  }

  console.log('🧾 Retrieved products from Prisma:', rawProducts.length);
  console.log('📦 Raw products sample:', rawProducts.slice(0, 3)); // limit to 3 for preview

  return rawProducts.map(p => ({
    id: p.id,
    asin: p.asin,
    title: p.title,
    image: p.image,
    price: p.price ?? undefined,
    currency: p.currency ?? undefined,
    discount: p.discount ?? undefined,
    lastPriceUpdatedAt: p.lastPriceUpdatedAt ?? undefined,
    lastInfoUpdatedAt: p.lastInfoUpdatedAt ?? undefined,
  }));
}