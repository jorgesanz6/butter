import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { butters, brands, butterCategories, butterSupermarkets, supermarkets } from "@/lib/db/schema";
import { inArray, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) || [];

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const butterRows = await db.select().from(butters).where(inArray(butters.id, ids));
  const allBrands = await db.select().from(brands);
  const allCategories = await db.select().from(butterCategories);

  const brandMap = new Map(allBrands.map(b => [b.id, b]));
  const categoryMap = new Map(allCategories.map(c => [c.id, c]));

  const allPrices = await db
    .select()
    .from(butterSupermarkets)
    .innerJoin(supermarkets, eq(butterSupermarkets.supermarketId, supermarkets.id))
    .where(inArray(butterSupermarkets.butterId, ids));

  const pricesByButter = new Map<string, { name: string; priceEur: number | null; availability: string | null }[]>();
  for (const row of allPrices) {
    const bs = row.butter_supermarkets;
    const s = row.supermarkets;
    if (!pricesByButter.has(bs.butterId!)) pricesByButter.set(bs.butterId!, []);
    pricesByButter.get(bs.butterId!)!.push({ name: s.name, priceEur: Number(bs.priceEur), availability: bs.availability });
  }

  const result = butterRows.map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    brandName: brandMap.get(b.brandId ?? "")?.name || "",
    categoryName: categoryMap.get(b.categoryId ?? "")?.name || "",
    fatPercentage: Number(b.fatPercentage),
    saltPercentage: Number(b.saltPercentage),
    milkType: b.milkType,
    isOrganic: b.isOrganic,
    isClarified: b.isClarified,
    isSpreadable: b.isSpreadable,
    ingredients: b.ingredients,
    additives: b.additives,
    caloriesKcal: Number(b.caloriesKcal),
    totalFatG: Number(b.totalFatG),
    saturatedFatG: Number(b.saturatedFatG),
    sodiumMg: Number(b.sodiumMg),
    weightG: b.weightG,
    format: b.format,
    qualityScore: Number(b.qualityScore),
    valueScore: Number(b.valueScore),
    nutritionScore: Number(b.nutritionScore),
    overallScore: Number(b.overallScore),
    supermarkets: pricesByButter.get(b.id) || [],
  }));

  return NextResponse.json(result);
}