import { searchAmazonProducts } from './amazonApi';
import { prisma } from '../lib/db'; // moved to top-level import

export async function refreshProductInfo() {
  let updatedCount = 0;
  try {
    const products = await prisma.product.findMany({ select: { asin: true } });
    const allAsins = products.map(p => p.asin);

    for (let i = 0; i < allAsins.length; i += 10) {
      const batch = allAsins.slice(i, i + 10);

      const updatedProducts = await searchAmazonProducts({
        asins: batch,
        resources: ['ItemInfo.Title', 'Images.Primary.Medium', 'Offers.Listings.Price']
      });

      for (const product of updatedProducts) {
        const title = product?.ItemInfo?.Title?.DisplayValue;
        const image = product?.Images?.Primary?.Medium?.URL;
        const priceInfo = product?.Offers?.Listings?.[0]?.Price;

        if (!title || !image) {
          console.warn('⚠️ Skipping product with missing title/image:', product.asin);
          continue;
        }

        try {
          await prisma.product.upsert({
            where: { asin: product.asin },
            update: {
              title,
              image,
              lastInfoUpdatedAt: new Date()
            },
            create: {
              asin: product.asin,
              title,
              image,
              price: priceInfo?.Amount ?? 0,
              currency: priceInfo?.Currency ?? 'USD',
              lastPriceUpdatedAt: new Date(),
              lastInfoUpdatedAt: new Date()
            }
          });
          updatedCount++;
        } catch (err) {
          console.error(`❌ Failed to sync product ${product.asin} to DB:`, err);
        }
      }

      console.log(`🔁 Batch ${i / 10 + 1}: Updated ${updatedProducts.length} ASINs`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ Product info refreshed. Total products updated: ${updatedCount}`);
  } catch (error) {
    console.error('🔥 Error refreshing product info:', error);
  }}