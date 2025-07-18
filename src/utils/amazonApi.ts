import { keywordList } from '../utils/keywordList';
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import * as crypto from 'crypto';
import { incrementRequestCount } from './requestLimiter';

const accessKey = process.env.AMAZON_ACCESS_KEY || '';
const secretKey = process.env.AMAZON_SECRET_KEY || '';
const associateTag = process.env.AMAZON_ASSOCIATE_TAG || '';
const region = 'eu-west-1';
const host = 'webservices.amazon.in';
const endpoint = 'https://webservices.amazon.in/paapi5/searchitems';
const service = 'ProductAdvertisingAPI';

const getSignatureKey = (key: string, dateStamp: string, regionName: string, serviceName: string) => {
  const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
  return crypto.createHmac('sha256', kService).update('aws4_request').digest();
};

export const searchAmazonProducts = async ({ asins = [], resources = [], keywords = '' }: { asins?: string[], resources?: string[], keywords?: string }) => {
  try {
    if (asins.length > 0) {
      // If ASINs are provided, use GetItems
      const amzTarget = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
      const payload = JSON.stringify({
        Marketplace: 'www.amazon.in',
        PartnerType: 'Associates',
        PartnerTag: associateTag,
        ItemIds: asins,
        Resources: resources
      });

      const currentDate = new Date();
      const amzDate = currentDate.toISOString().replace(/[:-]|\.\d{3}/g, '');
      const dateStamp = amzDate.slice(0, 8);

      const canonicalHeaders = `content-encoding:amz-1.0\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${amzTarget}\n`;
      const signedHeaders = 'content-encoding;host;x-amz-date;x-amz-target';
      const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

      const canonicalRequest = `POST\n/paapi5/getitems\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

      const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${dateStamp}/${region}/${service}/aws4_request\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

      const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
      const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

      const headers = {
        'Content-Encoding': 'amz-1.0',
        'Content-Type': 'application/json; charset=UTF-8',
        'Host': host,
        'X-Amz-Date': amzDate,
        'X-Amz-Target': amzTarget,
        'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKey}/${dateStamp}/${region}/${service}/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`,
        'User-Agent': 'axios/1.10.0'
      };

      await incrementRequestCount();
      const response = await axios.post('https://webservices.amazon.in/paapi5/getitems', payload, { headers });
      console.log('Amazon GetItems API response:', response.data);
      return (
        response.data.ItemsResult?.Items
          ?.map((item: any) => {
            const title = item.ItemInfo?.Title?.DisplayValue;
            const image = item.Images?.Primary?.Large?.URL;

            if (!title || !image) return null;

            return {
              Asin: item.ASIN,
              Title: title,
              Image: image,
              Offers: item.Offers ?? null
            };
          })
          .filter((product: any) => product !== null) || []
      );
    } else if (keywords) {
      // If keywords are provided, use SearchItems
      const amzTarget = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
      const payload = JSON.stringify({
        Marketplace: 'www.amazon.in',
        PartnerType: 'Associates',
        PartnerTag: associateTag,
        Keywords: keywords,
        SearchIndex: 'All',
        ItemCount: 10,
        Resources: resources
      });

      const currentDate = new Date();
      const amzDate = currentDate.toISOString().replace(/[:-]|\.\d{3}/g, '');
      const dateStamp = amzDate.slice(0, 8);

      const canonicalHeaders = `content-encoding:amz-1.0\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${amzTarget}\n`;
      const signedHeaders = 'content-encoding;host;x-amz-date;x-amz-target';
      const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

      const canonicalRequest = `POST\n/paapi5/searchitems\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

      const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${dateStamp}/${region}/${service}/aws4_request\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

      const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
      const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

      const headers = {
        'Content-Encoding': 'amz-1.0',
        'Content-Type': 'application/json; charset=UTF-8',
        'Host': host,
        'X-Amz-Date': amzDate,
        'X-Amz-Target': amzTarget,
        'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKey}/${dateStamp}/${region}/${service}/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`,
        'User-Agent': 'axios/1.10.0'
      };

      await incrementRequestCount();
      const response = await axios.post(endpoint, payload, { headers });
      console.log('Amazon SearchItems API response:', response.data);
      return (
        response.data.SearchResult?.Items
          ?.map((item: any) => {
            const title = item.ItemInfo?.Title?.DisplayValue;
            const image = item.Images?.Primary?.Large?.URL;

            if (!title || !image) return null;

            return {
              Asin: item.ASIN,
              Title: title,
              Image: image,
              Offers: item.Offers ?? null
            };
          })
          .filter((product: any) => product !== null) || []
      );
    } else {
      throw new Error('Either ASINs or keywords must be provided.');
    }
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    return null;
  }
};

export const extractAsins = (searchResponse: any) => {
  if (!searchResponse?.SearchResult?.Items) return [];
  return searchResponse.SearchResult.Items.map((item: any) => item.ASIN);
};

export const getAmazonProductsByAsins = async (
  asins: string[],
  resources: string[] = ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price']
) => {
  try {
    const amzTarget = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
    const payload = JSON.stringify({
      Marketplace: 'www.amazon.in',
      PartnerType: 'Associates',
      PartnerTag: associateTag,
      ItemIds: asins,
      Resources: resources
    });

    const currentDate = new Date();
    const amzDate = currentDate.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);

    const canonicalHeaders = `content-encoding:amz-1.0\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${amzTarget}\n`;
    const signedHeaders = 'content-encoding;host;x-amz-date;x-amz-target';
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

    const canonicalRequest = `POST\n/paapi5/getitems\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${dateStamp}/${region}/${service}/aws4_request\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const headers = {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=UTF-8',
      'Host': host,
      'X-Amz-Date': amzDate,
      'X-Amz-Target': amzTarget,
      'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKey}/${dateStamp}/${region}/${service}/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'User-Agent': 'axios/1.10.0'
    };

    await incrementRequestCount();
    const response = await axios.post('https://webservices.amazon.in/paapi5/getitems', payload, { headers });
    console.log('Amazon GetItems API response:', response.data.ItemsResult.Items);
    return (
      response.data.ItemsResult?.Items
        ?.map((item: any) => {
          const title = item.ItemInfo?.Title?.DisplayValue;
          const image = item.Images?.Primary?.Large?.URL;

          if (!title || !image) return null;

          return {
            Asin: item.ASIN,
            Title: title,
            Image: image,
            Offers: item.Offers ?? null
          };
        })
        .filter((product: any) => product !== null) || []
    );
  } catch (error) {
    console.error('Error fetching Amazon products by ASINs:', error);
    return null;
  }
};
export const searchAmazonByKeyword = async (keyword: string): Promise<any[]> => {
  const products = await searchAmazonProducts({
    keywords: keyword,
    resources: ['ItemInfo.Title', 'Images.Primary.Large', 'Offers.Listings.Price'],
  });

  console.dir(products, { depth: null });
  return products || [];
};

export const fetchAllKeywordProducts = async () => {
  const allProducts = [];

  for (const keyword of keywordList) {
    const products = await searchAmazonProducts({
      keywords: keyword,
      resources: ['ItemInfo.Title', 'Images.Primary.Medium', 'Offers.Listings.Price'],
    });

    if (products) {
      allProducts.push(...products);
    }
  }

  return allProducts;
};
// Prisma upsert example for Product:
// await prisma.product.upsert({
//   where: { asin: asinValue },
//   update: { /* fields to update */ },
//   create: { asin: asinValue, /* other fields */ },
// });

// In refreshPrices or refreshProductInfo, you might see:
// await prisma.product.upsert({ ... }) // to insert or update product info/prices