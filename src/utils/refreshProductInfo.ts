import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { subHours } from 'date-fns';
import { searchAmazonProducts } from './amazonApi';
import { prisma } from '../lib/db';

export async function refreshProductInfo({ asins }: { asins?: string[] }) {
  let updatedCount = 0;

  try {
    console.log("📁 Starting refreshProductInfo");

    let allAsinsRaw: string[] = [];

    if (Array.isArray(asins) && asins.length > 0) {
      allAsinsRaw = asins.map(r => r?.trim()).filter(Boolean);
      console.log("✅ ASINs provided via argument:", allAsinsRaw);
    } else {
      const csvPath = path.resolve(process.cwd(), 'data', 'asins.csv');
      const fileContent = fs.readFileSync(csvPath);
      const records: { asin: string }[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      allAsinsRaw = records.map(r => r.asin?.trim()).filter(Boolean);
      console.log("✅ All ASINs from CSV:", allAsinsRaw);
    }

    console.log("🧾 ASINs to process:", allAsinsRaw);

    // Filter ASINs to exclude those updated in the last 24 hours
    const twentyFourHoursAgo = subHours(new Date(), 24);
    const productsInDb = await prisma.product.findMany({
      
      where: {
        asin: { in: allAsinsRaw },
      },
      select: {
        asin: true,
        lastInfoUpdatedAt: true
      }
    });

    console.log("🗄️ ASINs found in DB:", productsInDb.map(p => p.asin));

    const newlyInsertedAsins = productsInDb.filter(p => !p.lastInfoUpdatedAt).map(p => p.asin);
    console.log("🆕 Newly inserted ASINs:", newlyInsertedAsins);

    console.log("📉 Outdated ASINs:");
    const outdatedAsins = allAsinsRaw.filter(asin => {
      const product = productsInDb.find(p => p.asin === asin);
      if (!product) return false; // already included in newlyInsertedAsins
      if (!product.lastInfoUpdatedAt) return true; // never updated
      console.log(`⏱️ Checking ASIN ${asin}: lastInfoUpdatedAt =`, product.lastInfoUpdatedAt);
      return product.lastInfoUpdatedAt < twentyFourHoursAgo;
    });

    const allAsins = [...new Set([...newlyInsertedAsins, ...outdatedAsins])];
    console.log("🎯 Final ASINs selected for API:", allAsins);
    if (allAsins.length === 0) {
      console.log("🚫 No ASINs to update. Exiting early.");
      return;
    }

    for (let i = 0; i < allAsins.length; i += 10) {
      const batch = allAsins.slice(i, i + 10).filter(a => typeof a === 'string' && a.trim().length > 0);
      if (batch.length === 0) {
        console.warn(`⚠️ Batch ${i / 10 + 1}: All ASINs invalid or empty. Skipping.`);
        continue;
      }

      console.log(`📤 Sending batch to Amazon:`, batch);

      const updatedProducts = await searchAmazonProducts({
        asins: batch,
        resources: [
          'ItemInfo.Title',
          'ItemInfo.ByLineInfo',
          'Images.Primary.Medium',
          'Offers.Listings.Price',
          'Offers.Listings.Availability'
        ]
      }) ?? [];

      console.log("📥 Amazon API response ASINs:", updatedProducts.map((p: any) => p?.ASIN));

      if (!Array.isArray(updatedProducts)) {
        if (updatedProducts?.Errors) {
          for (const err of updatedProducts.Errors) {
            const asinMatch = err.Message?.match(/ItemId (\w+)/);
            const asin = asinMatch?.[1];
            if (asin) {
              console.warn(`🚫 Invalid ASIN returned by Amazon API: ${asin}. Flagging for deletion.`);
              try {
                await prisma.product.updateMany({
                  where: { asin },
                  data: {
                    note: 'Invalid ASIN — rejected by Amazon API',
                  },
                });
              } catch (dbErr) {
                console.error(`❌ Failed to mark invalid ASIN ${asin} in DB:`, dbErr);
              }
            }
          }
        } else {
          console.error('❌ Amazon API returned an invalid product list:', updatedProducts);
        }
        continue;
      }

      const asinList = [];

      for (const product of updatedProducts) {
        const asin = product?.ASIN;
        console.log('🔎 Raw product response for', asin, JSON.stringify(product, null, 2));
        if (!asin) {
          console.warn('⚠️ Skipping product with missing ASIN');
          continue;
        }

        const title = product?.Title ?? product?.ItemInfo?.Title?.DisplayValue;
        const image = product?.Image ?? product?.Images?.Primary?.Medium?.URL;
        const availability = product?.Offers?.Listings?.[0]?.Availability?.Message;
        const link = `https://www.amazon.in/dp/${asin}/?tag=chorebazaar-21`;

        if (!title || !image) {
          console.warn(`⚠️ Skipping ASIN ${asin} | Missing Title: ${!title} | Missing Image: ${!image}`);
          continue;
        }

        console.log(`🧩 Upserting ASIN ${asin} | Title: ${title} | Image: ${image} | Availability: ${availability}`);

        try {
          await prisma.product.upsert({
            where: { asin },
            update: {
              title,
              image,
              note: availability || '',
              lastInfoUpdatedAt: new Date(),
              link
            },
            create: {
              asin,
              title,
              image,
              price: 0,
              currency: 'USD',
              note: availability || '',
              lastPriceUpdatedAt: new Date(),
              lastInfoUpdatedAt: new Date(),
              link
            }
          });
          updatedCount++;
        } catch (err) {
          console.error(`❌ Failed to sync product ${asin} to DB:`, err);
        }
      }

      console.log(`🔁 Batch ${i / 10 + 1}: Updated ${updatedProducts.length} ASINs`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.table({
      TotalASINs: allAsins.length,
      Updated: updatedCount,
      Skipped: allAsins.length - updatedCount
    });
  } catch (error) {
    console.error('🔥 Error refreshing product info:', error);
  }
}