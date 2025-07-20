import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { searchAmazonProducts } from './amazonApi';
import { prisma } from '../lib/db';

export async function refreshPrices({ asins }: { asins?: string[] }) {
    console.log("🔁 refreshPrices script started");
    try {
        let asinList: string[] = [];

        if (asins && asins.length > 0) {
            asinList = asins;
        } else {
            const csvPath = 'data/asins.csv';
            console.log(`📁 Attempting to read CSV file at path: ${csvPath}`);
            let csvData;
            try {
                csvData = fs.readFileSync(csvPath);
                console.log("✅ CSV file successfully read");
            } catch (e) {
                console.error("❌ Failed to read CSV file:", e);
                throw e;
            }
            console.log("📥 CSV file read");
            console.log(csvData.toString()); // 🔍 Log raw CSV content
            const records: { asin: string }[] = parse(csvData, {
                columns: true,
                skip_empty_lines: true,
            });
            const asinListFromCSV = records.map(r => r.asin);
            console.log('🧾 Parsed ASINs from CSV:', asinListFromCSV);
            console.log("📋 CSV parsed, total records:", records.length);

            // Fetch all existing ASINs in the database
            const existingProducts = await prisma.product.findMany({
                where: {
                    asin: { in: asinListFromCSV }
                },
                select: { asin: true }
            });
            console.log("📦 Existing ASINs fetched from DB:", existingProducts.length);
            const existingAsinsSet = new Set(existingProducts.map(p => p.asin));

            // Filter only new ASINs from CSV not already in DB
            const newAsinsFromCSV = asinListFromCSV.filter(asin => !existingAsinsSet.has(asin));
            const newlyInsertedAsins = newAsinsFromCSV;
            console.log("🆕 Newly inserted ASINs:", newlyInsertedAsins.length);

            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const productsToUpdate = await prisma.product.findMany({
                where: {
                    asin: { notIn: newlyInsertedAsins },
                    OR: [
                        { lastPriceUpdatedAt: null },
                        { lastPriceUpdatedAt: { lt: oneHourAgo } }
                    ]
                },
                select: { asin: true }
            });
            console.log("♻️ Products needing price update:", productsToUpdate.length);

            asinList = [
                ...new Set([
                    ...newlyInsertedAsins,
                    ...productsToUpdate.map(p => p.asin)
                ])
            ];
            console.log('📦 ASINs selected for price refresh:', asinList);
            console.log("🚀 Beginning API calls in batches...");
        }

        const batchSize = 10;
        for (let i = 0; i < asinList.length; i += batchSize) {
            const batch = asinList.slice(i, i + batchSize);

            console.log(`🔍 Fetching price for ASIN batch:`, batch);

            const updatedProducts = await searchAmazonProducts({
                asins: batch,
                resources: [
                    "Offers.Listings.Price",
                    "Offers.Listings.SavingBasis"
                ]
            });

            if (!Array.isArray(updatedProducts)) {
                console.warn('🛑 Skipping update: Amazon returned invalid or throttled response');
                console.warn('❌ Invalid API response for batch:', batch);
                continue;
            }

            for (const product of updatedProducts) {
                const asin = product.ASIN;
                const priceInfo = product.Offers?.Listings?.[0]?.Price;
                if (asin && priceInfo) {
                    await prisma.product.updateMany({
                        where: { asin },
                        data: {
                            price: priceInfo.Amount,
                            currency: priceInfo.Currency,
                            lastPriceUpdatedAt: new Date(),
                        }
                    });
                    console.log(`✅ Price updated for ASIN: ${asin}`);
                } else {
                    console.warn(`⚠️ Skipping product due to missing ASIN or price info:`, product);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`Price refresh completed successfully for ${asinList.length} ASIN(s).`);

    } catch (error) {
        console.error('Error refreshing prices:', error);
    }
}

// Execute the refresh when the script is run directly
if (require.main === module) {
  refreshPrices({});
}