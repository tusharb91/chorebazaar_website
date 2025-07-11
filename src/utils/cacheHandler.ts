import { prisma } from '@/lib/db';
import { AmazonProduct } from './amazonTypes';

export async function getAllCachedProducts(): Promise<AmazonProduct[]> {
  const rawProducts = await prisma.product.findMany({
    orderBy: {
      lastPriceUpdatedAt: 'desc',
    },
  });

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