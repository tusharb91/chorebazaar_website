import { prisma } from '../lib/db';
import { productList } from '../data/productList';
import { AmazonProduct } from './amazonTypes';
import { getAllCachedProducts, updateCache } from './cacheHandler';
import { searchAmazonProducts } from './amazonApi';

export async function refreshProductInfo() {
  try {
    // Extract ASINs
    const allAsins = productList.map(product => product.asin);

    // Batch ASINs (10 per request)
    for (let i = 0; i < allAsins.length; i += 10) {
      const batch = allAsins.slice(i, i + 10);

      // Call Amazon API for product info (non-offer details)
      const updatedProducts = await searchAmazonProducts({ asins: batch, resources: ['ItemInfo.Title', 'Images.Primary.Medium'] });

      // Update cache for each product
      updatedProducts.forEach((product: AmazonProduct) => {
        const priceInfo = product.Offers?.Listings?.[0]?.Price;
        const title = product.title;
        const image = product.image;
        updateCache(product.asin, {
          asin: product.asin,
          title,
          image,
          price: priceInfo?.Amount,
          currency: priceInfo?.Currency
        }, 86400); // Cache for 1 day

        prisma.product.upsert({
          where: { asin: product.asin },
          update: {
            title,
            image
          },
          create: {
            asin: product.asin,
            title,
            image
          }
        }).catch((err: any) => console.error(`Failed to sync product ${product.asin} to DB:`, err));
      });

      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('Product info refreshed successfully.');
  } catch (error) {
    console.error('Error refreshing product info:', error);
  }
}