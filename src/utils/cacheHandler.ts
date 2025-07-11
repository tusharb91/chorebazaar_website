import { AmazonProduct } from './amazonTypes';

type CacheEntry = {
  data: AmazonProduct;
  expiry: number;
};

const cache: Record<string, CacheEntry> = {};

export function setCache(key: string, data: AmazonProduct, ttlInSeconds: number): void {
  const expiry = Date.now() + ttlInSeconds * 1000;
  cache[key] = { data, expiry };
}

export function getCache(key: string): AmazonProduct | null {
  const cachedItem = cache[key];
  if (!cachedItem) return null;

  if (Date.now() > cachedItem.expiry) {
    delete cache[key];
    return null;
  }

  return cachedItem.data;
}

export function invalidateCache(key: string): void {
  delete cache[key];
}

export function getAllCachedKeys(): string[] {
  return Object.keys(cache);
}

export function getAllCachedProducts(): AmazonProduct[] {
  return Object.values(cache).map(entry => entry.data);
}

export function updateCache(key: string, newData: AmazonProduct, ttlInSeconds: number): void {
  setCache(key, newData, ttlInSeconds);
}