

import { NextResponse } from "next/server";
import { refreshProductInfo } from "@/utils/refreshProductInfo";

export async function GET() {
  try {
    await refreshProductInfo({});
    return NextResponse.json({ message: "Product info refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing product info:", error);
    return NextResponse.json({ error: "Failed to refresh product info" }, { status: 500 });
  }
}