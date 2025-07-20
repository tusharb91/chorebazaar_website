-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "asin" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "discount" DOUBLE PRECISION,
    "lastPriceUpdatedAt" TIMESTAMP(3) NOT NULL,
    "lastInfoUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_asin_key" ON "Product"("asin");
