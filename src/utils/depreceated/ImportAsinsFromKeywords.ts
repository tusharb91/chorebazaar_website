// import { keywordList } from '../keywordList';
// import { searchAmazonByKeyword, getAmazonProductsByAsins } from '../amazonApi';
// import { prisma } from '@/lib/db';
//
// export async function importAsinsFromKeywords() {
//   const asinSet = new Set<string>();
//
//   for (const keyword of keywordList) {
//     try {
//       const products = await searchAmazonByKeyword(keyword) || [];
//       console.dir(products, { depth: null });
//
//       if (Array.isArray(products)) {
//         products.forEach((product: any) => {
//           if (product.Asin) {
//             asinSet.add(product.Asin);
//           }
//         });
//       } else {
//         console.warn(`⚠️ No valid product array returned for keyword "${keyword}". Got:`, products);
//       }
//
//       // wait 200ms between each keyword to be safe
//       await new Promise(res => setTimeout(res, 200));
//     } catch (err) {
//       console.error(`Error fetching products for keyword "${keyword}":`, err);
//     }
//   }
//
//   const asins = Array.from(asinSet);
//   console.log(`Collected ${asins.length} unique ASINs.`);
//
//   // Batch ASINs into groups of 10 and fetch detailed info
//   for (let i = 0; i < asins.length; i += 10) {
//     const batch = asins.slice(i, i + 10);
//     console.log(`🧵 ASIN batch size: ${batch.length}`);
//     try {
//       const enrichedProducts = await getAmazonProductsByAsins(
//         batch,
//         ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price']
//       );
//       console.log('🛠 Full response from getAmazonProductsByAsins:', enrichedProducts);
//
//       if (!Array.isArray(enrichedProducts)) {
//         console.warn('⚠️ enrichedProducts is not an array. Skipping batch:', batch);
//         continue;
//       }
//
//       if (enrichedProducts.length === 0) {
//         console.warn('🚫 No enriched products returned for batch:', batch);
//         continue;
//       }
//
//       console.log(`📦 Enriched product count: ${enrichedProducts.length}`);
//
//       for (const product of enrichedProducts) {
//         const title = product?.Title;
//         const image = product?.Image;
//
//         if (product?.Errors?.[0]?.Code === 'ItemNotAccessible') {
//           console.warn('⛔ Skipping inaccessible ASIN:', product?.Asin || '[Unknown ASIN]');
//           continue;
//         }
//
//         console.log(`⏩ Processing ASIN: ${product.Asin}`);
//         console.log(`🔍 Title: ${title} | Image: ${image}`);
//
//         if (!title || !image) {
//           console.warn('⚠️ Skipping incomplete product:', product?.Asin || '[Unknown ASIN]');
//           continue;
//         }
//
//         try {
//           await prisma.product.upsert({
//             where: { asin: product.Asin },
//             update: {
//               title,
//               image,
//               price: product?.Offers?.Listings?.[0]?.Price?.Amount || 0,
//               currency: product?.Offers?.Listings?.[0]?.Price?.Currency || 'INR',
//               lastInfoUpdatedAt: new Date(),
//               lastPriceUpdatedAt: new Date(),
//             },
//             create: {
//               asin: product.Asin,
//               title,
//               image,
//               price: product?.Offers?.Listings?.[0]?.Price?.Amount || 0,
//               currency: product?.Offers?.Listings?.[0]?.Price?.Currency || 'INR',
//               lastInfoUpdatedAt: new Date(),
//               lastPriceUpdatedAt: new Date(),
//             }
//           });
//           console.log(`✅ Successfully upserted: ${product.Asin}`);
//         } catch (err) {
//           console.error('❌ Prisma upsert failed for ASIN', product.Asin, err);
//         }
//       }
//
//       // wait 500ms between each batch to be safe
//       await new Promise(res => setTimeout(res, 500));
//     } catch (err) {
//       console.error(`Error enriching ASIN batch [${batch.join(', ')}]:`, err);
//     }
//   }
//
//   console.log("Imported ASINs based on keywords.");
// }