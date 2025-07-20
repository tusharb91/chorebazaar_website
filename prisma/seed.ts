import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/lib/sync';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '..', 'data', 'asins.csv');
  const fileContent = readFileSync(filePath, 'utf-8');
  const records: Array<{ asin: string }> = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of records) {
    const asin = record.asin?.trim();
    if (!asin) continue;

    await prisma.product.upsert({
      where: { asin },
      update: {},
      create: {
        asin,
        title: 'Placeholder Title',
        image: '/placeholder.png',
        category: 'Unknown',
        price: 0,
        currency: 'INR',
      },
    });
  }

  console.log('Seeded products from CSV');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });