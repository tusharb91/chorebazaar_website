import { prisma } from '../lib/db';
import { productList } from '../data/productList';
import { getAllCachedKeys, getCache, setCache } from './cacheHandler';
import { searchAmazonProducts } from './amazonApi';
import { AmazonProduct } from './amazonTypes';

export async function refreshPrices() {
    try {
        const asins = productList.map(product => product.asin);

        // Break ASINs into batches of 10
        const batchSize = 10;
        for (let i = 0; i < asins.length; i += batchSize) {
            const batch = asins.slice(i, i + batchSize);

            // Fetch updated prices for this batch
            const updatedProducts = await searchAmazonProducts({ asins: batch, resources: ['Offers.Listings.Price'] });

            for (const product of updatedProducts) {
                const existingCache = getCache(product.asin);
                if (existingCache && product.Offers?.Listings?.[0]?.Price) {
                    const priceInfo = product.Offers.Listings[0].Price;

                    (existingCache as any).price = priceInfo.Amount || (existingCache as any).price;
                    (existingCache as any).currency = priceInfo.Currency || (existingCache as any).currency;

                    setCache(product.asin, existingCache, 3600); // TTL = 1 hour

                    // Also update in Prisma DB
                    await prisma.product.updateMany({
                        where: { asin: product.asin },
                        data: {
                            price: priceInfo.Amount,
                            currency: priceInfo.Currency,
                            updatedAt: new Date()
                        }
                    });
                }
            }

            // Optional: Add delay between batches if necessary to avoid throttling
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

        console.log('Price refresh completed successfully.');

    } catch (error) {
        console.error('Error refreshing prices:', error);
    }
}