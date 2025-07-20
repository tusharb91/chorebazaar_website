import cron from 'node-cron';
import { refreshPrices } from '../utils/refreshPrices';
import { refreshProductInfo } from '../utils/refreshProductInfo';

// Refresh prices and offers every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly price and offer refresh...');
  await refreshPrices({});
});

// Refresh images and titles every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily product info refresh...');
  await refreshProductInfo({});
});

console.log('Cron jobs scheduled.');