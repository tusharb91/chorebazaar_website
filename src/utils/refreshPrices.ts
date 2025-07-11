import { searchAmazonProducts } from './amazonApi';
import { prisma } from '../lib/db';

export async function refreshPrices() {
    try {
        const products = await prisma.product.findMany({ select: { asin: true } });
        const asins = products.map(p => p.asin);

        const batchSize = 10;
        for (let i = 0; i < asins.length; i += batchSize) {
            const batch = asins.slice(i, i + batchSize);

            const updatedProducts = await searchAmazonProducts({
                asins: batch,
                resources: ['Offers.Listings.Price']
            });

            if (!Array.isArray(updatedProducts)) {
                console.warn('🛑 Skipping update: Amazon returned invalid or throttled response');
                continue;
            }

            for (const product of updatedProducts) {
                const priceInfo = product.Offers?.Listings?.[0]?.Price;
                if (priceInfo) {
                    await prisma.product.updateMany({
                        where: { asin: product.asin },
                        data: {
                            price: priceInfo.Amount,
                            currency: priceInfo.Currency,
                            lastPriceUpdatedAt: new Date(),
                        }
                    });
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('Price refresh completed successfully.');

    } catch (error) {
        console.error('Error refreshing prices:', error);
    }
}