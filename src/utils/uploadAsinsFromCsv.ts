// src/utils/uploadAsinsFromCsv.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/db';

interface CsvRow {
  asin: string;
  title?: string;
  category?: string;
  note?: string;
}

export async function uploadAsinsFromCsv(filePath: string) {
  try {
    const fileContent = fs.readFileSync(path.resolve(filePath));
    const records: CsvRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validRecords = records.filter((row) => row.asin && row.asin.length >= 10);

    let inserted = 0;
    const newlyInsertedAsins: string[] = [];
    for (const row of validRecords) {
      const existing = await prisma.product.findUnique({
        where: { asin: row.asin },
      });

      await prisma.product.upsert({
        where: { asin: row.asin },
        update: {
          title: row.title || undefined,
          category: row.category || undefined,
          note: row.note || undefined,
        },
        create: {
          asin: row.asin,
          title: row.title || '',
          category: row.category || '',
          note: row.note || '',
          image: '',
        },
      });

      if (!existing) {
        inserted++;
        newlyInsertedAsins.push(row.asin);
      }
    }

    console.log(`✅ Imported ${inserted} new ASINs successfully.`);
    console.log('📦 Newly inserted ASINs:', newlyInsertedAsins);

    // Automatically trigger Amazon API refresh for newly inserted ASINs
    if (newlyInsertedAsins.length > 0) {
      const { refreshProductInfo } = await import('./refreshProductInfo');
      const { refreshPrices } = await import('./refreshPrices');

      console.log('🔄 Refreshing product info and prices for new ASINs...');
      await refreshPrices({ asins: newlyInsertedAsins });
      await refreshProductInfo({ asins: newlyInsertedAsins });
    }
    return inserted;
  } catch (error) {
    console.error('❌ Error uploading ASINs:', error);
    return 0;
  }
}
// Removed erroneous log statement referencing undefined 'insertedAsins'