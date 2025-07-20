import { prisma } from '@/lib/db';

async function main() {
  const products = await prisma.product.findMany();

  console.log(`🧾 Total products in DB: ${products.length}`);

  if (products.length > 0) {
    console.log('🧪 Sample product:', {
      asin: products[0].asin,
      title: products[0].title,
      price: products[0].price,
    });
  }

  process.exit();
}

main().catch((e) => {
  console.error('❌ Error querying products:', e);
  process.exit(1);
});