-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "lastPriceUpdatedAt" DROP NOT NULL,
ALTER COLUMN "lastInfoUpdatedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "asin" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);
