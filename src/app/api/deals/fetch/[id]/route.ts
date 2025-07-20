import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const asin = context.params.id;
  console.log("Requested ASIN:", asin);

  if (!asin) {
    return NextResponse.json({ error: "Missing ASIN" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findFirst({
      where: {
        asin: {
          equals: asin,
          mode: "insensitive",
        },
      },
      select: {
        asin: true,
        title: true,
        price: true,
        image: true,
        link: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ deal: product });
  } catch (error) {
    console.error("Error fetching product by ASIN:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
