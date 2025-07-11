import { keywordList } from './keywordList';
import { searchAmazonByKeyword, getAmazonProductsByAsins } from './amazonApi';
import { setCache } from './cacheHandler';

export async function importAsinsFromKeywords() {
  const asinSet = new Set<string>();

  for (const keyword of keywordList) {
    try {
      const results = await searchAmazonByKeyword(keyword);

      results.forEach((product: any) => {
        if (product.ASIN) {
          asinSet.add(product.ASIN);
        }
      });

      // wait 200ms between each keyword to be safe
      await new Promise(res => setTimeout(res, 200));
    } catch (err) {
      console.error(`Error fetching products for keyword "${keyword}":`, err);
    }
  }

  const asins = Array.from(asinSet);
  console.log(`Collected ${asins.length} unique ASINs.`);

  // Batch ASINs into groups of 10 and fetch detailed info
  for (let i = 0; i < asins.length; i += 10) {
    const batch = asins.slice(i, i + 10);
    try {
      const enrichedProducts = await getAmazonProductsByAsins(
        batch,
        ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price']
      );

      enrichedProducts.forEach((product: any) => {
        if (product.ASIN) {
          setCache(product.ASIN, product, 86400); // Cache for 24 hours
        }
      });

      // wait 500ms between each batch to be safe
      await new Promise(res => setTimeout(res, 500));
    } catch (err) {
      console.error(`Error enriching ASIN batch [${batch.join(', ')}]:`, err);
    }
  }

  console.log("Imported ASINs based on keywords.");
}