import { db } from "./index";
import { butters, brands, butterCategories, supermarkets, denominations, butterSupermarkets } from "./schema";
import { eq, desc, asc, inArray } from "drizzle-orm";

export async function getAllButters() {
  return db.select().from(butters).orderBy(desc(butters.overallScore));
}

export async function getButterBySlug(slug: string) {
  const [butter] = await db.select().from(butters).where(eq(butters.slug, slug));
  return butter;
}

export async function getButterWithDetails(slug: string) {
  const butter = await getButterBySlug(slug);
  if (!butter) return null;

  const brand = butter.brandId ? (await db.select().from(brands).where(eq(brands.id, butter.brandId!)))[0] : null;
  const category = butter.categoryId ? (await db.select().from(butterCategories).where(eq(butterCategories.id, butter.categoryId!)))[0] : null;
  const denomination = butter.denominationId
    ? (await db.select().from(denominations).where(eq(denominations.id, butter.denominationId!)))[0]
    : null;

  const priceRows = await db.select().from(butterSupermarkets).where(eq(butterSupermarkets.butterId, butter.id));

  const supIds = priceRows.map(p => p.supermarketId).filter(Boolean) as string[];
  const supData = supIds.length > 0 ? await db.select().from(supermarkets).where(inArray(supermarkets.id, supIds)) : [];

  type SupermarketDetail = { butterId: string | null; supermarketId: string | null; priceEur: string | null; pricePer100g: string | null; availability: string | null; lastChecked: string | null; url: string | null; supermarket: typeof supData[number] };
  const supermarketDetails: SupermarketDetail[] = priceRows
    .map(bs => {
      const supermarket = supData.find(s => s.id === bs.supermarketId);
      return supermarket ? { ...bs, supermarket } : null;
    })
    .filter((x): x is SupermarketDetail => x !== null);

  // Sort by price
  supermarketDetails.sort((a, b) => Number(a.priceEur || 0) - Number(b.priceEur || 0));

  return { ...butter, brand, category, denomination, supermarkets: supermarketDetails };
}

export async function getAllBrands() {
  return db.select().from(brands).orderBy(asc(brands.name));
}

export async function getAllCategories() {
  return db.select().from(butterCategories).orderBy(asc(butterCategories.name));
}

export async function getAllSupermarkets() {
  return db.select().from(supermarkets).orderBy(asc(supermarkets.name));
}

export async function getAllDenominations() {
  return db.select().from(denominations).orderBy(asc(denominations.name));
}

export async function getButtersBySupermarket(supermarketSlug: string) {
  const [supermarket] = await db.select().from(supermarkets).where(eq(supermarkets.slug, supermarketSlug));
  if (!supermarket) return { supermarket: null, butters: [] };

  const priceRows = await db.select().from(butterSupermarkets).where(eq(butterSupermarkets.supermarketId, supermarket.id));
  const butterIds = priceRows.map(p => p.butterId).filter(Boolean) as string[];

  if (butterIds.length === 0) return { supermarket, butters: [] };

  const butterRows = await db.select().from(butters).where(inArray(butters.id, butterIds)).orderBy(desc(butters.overallScore));

  const brandIds = [...new Set(butterRows.map(b => b.brandId).filter(Boolean) as string[])];
  const categoryIds = [...new Set(butterRows.map(b => b.categoryId).filter(Boolean) as string[])];

  const [brandData, categoryData] = await Promise.all([
    brandIds.length > 0 ? db.select().from(brands).where(inArray(brands.id, brandIds)) : Promise.resolve([]),
    categoryIds.length > 0 ? db.select().from(butterCategories).where(inArray(butterCategories.id, categoryIds)) : Promise.resolve([]),
  ]);

  const brandMap = new Map(brandData.map(b => [b.id, b]));
  const categoryMap = new Map(categoryData.map(c => [c.id, c]));

  const result = butterRows.map(butter => {
    const price = priceRows.find(p => p.butterId === butter.id);
    return {
      ...butter,
      brand: brandMap.get(butter.brandId ?? ""),
      category: categoryMap.get(butter.categoryId ?? ""),
      priceEur: price?.priceEur,
      pricePer100g: price?.pricePer100g,
      availability: price?.availability,
    };
  });

  return { supermarket, butters: result };
}

export async function getSupermarketBySlug(slug: string) {
  const [supermarket] = await db.select().from(supermarkets).where(eq(supermarkets.slug, slug));
  return supermarket;
}

export async function getTopButters(limit = 10) {
  return db.select().from(butters).orderBy(desc(butters.overallScore)).limit(limit);
}

export async function getButtersByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(butters).where(inArray(butters.id, ids));
}

export async function getAveragePricePer100g() {
  const rows = await db.select().from(butterSupermarkets);
  if (rows.length === 0) return 0.85;
  const sum = rows.reduce((acc, r) => acc + Number(r.pricePer100g || 0), 0);
  return sum / rows.length;
}