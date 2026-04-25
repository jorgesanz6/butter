import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { butters, brands, butterCategories, butterSupermarkets, supermarkets } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const allButters = await db.select().from(butters).orderBy(desc(butters.overallScore));
  const allBrands = await db.select().from(brands);
  const allCategories = await db.select().from(butterCategories);

  const brandMap = new Map(allBrands.map(b => [b.id, b]));
  const categoryMap = new Map(allCategories.map(c => [c.id, c]));

  const result = allButters.map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    brandName: brandMap.get(b.brandId ?? "")?.name || "",
    categoryName: categoryMap.get(b.categoryId ?? "")?.name || "",
    overallScore: Number(b.overallScore),
  }));

  return NextResponse.json(result);
}