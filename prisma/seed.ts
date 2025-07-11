

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      asin: 'B0BDVG99J5',
      name: "Dot & Key Ceramides Moisturizer",
      price: 335,
      currency: 'INR',
    },
    {
      asin: 'B082KWT81N',
      name: "RE' EQUIL Ceramide Moisturiser",
      price: 280,
      currency: 'INR',
    },
  ];

  for (const product of products) {
    await prisma.productList.upsert({
      where: { asin: product.asin },
      update: product,
      create: product,
    });
  }

  console.log('Seeded product list');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });