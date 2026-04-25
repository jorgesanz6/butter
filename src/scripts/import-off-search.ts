// Must load env before db module is imported
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import { butters } from "@/lib/db/schema";
import { eq, isNull, or } from "drizzle-orm";

/**
 * Search Open Food Facts for butter products missing data.
 *
 * Usage: npx tsx src/scripts/import-off-search.ts
 *
 * Searches OFF by product name + brand, matches by category,
 * and updates DB with real nutrition, images, and ingredients.
 */

const OFF_SEARCH = "https://world.openfoodfacts.org/api/v2/search";
const USER_AGENT = "ButterChoice/1.0 (https://butterchoice.app)";

interface OFFProduct {
  code: string;
  product_name?: string;
  product_name_es?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  quantity?: string;
  nutriments?: Record<string, number | string>;
  ingredients_text?: string;
  ingredients_text_es?: string;
  allergens_tags?: string[];
  categories_tags?: string[];
  labels_tags?: string[];
  stores?: string;
  countries_tags?: string[];
}

interface OFFSearchResult {
  count: number;
  page: number;
  page_size: number;
  products: OFFProduct[];
}

const BUTTER_CATEGORIES = ["en:butters", "en:butter", "en:dairy-spreads", "en:milkfat"];

function toNum(val: unknown): number {
  if (val === undefined || val === null || val === "") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

function isButter(product: OFFProduct): boolean {
  const cats = product.categories_tags || [];
  return cats.some(c => BUTTER_CATEGORIES.includes(c));
}

function matchScore(product: OFFProduct, searchTerm: string): number {
  let score = 0;
  const name = (product.product_name_es || product.product_name || "").toLowerCase();
  const term = searchTerm.toLowerCase();

  if (name.includes(term)) score += 10;
  if (name === term) score += 20;

  if (isButter(product)) score += 15;

  const hasNutrition = toNum(product.nutriments?.fat_100g) > 0;
  if (hasNutrition) score += 5;

  if (product.image_url) score += 3;

  return score;
}

async function searchProduct(query: string): Promise<OFFProduct[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `${OFF_SEARCH}?search_terms=${encoded}&countries_tags=en:spain&page_size=10&json=true`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
    });

    if (!res.ok) {
      console.log(`  Search HTTP error: ${res.status}`);
      return [];
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.log(`  Search returned non-JSON: ${contentType}`);
      return [];
    }

    const data: OFFSearchResult = await res.json();
    return data.products || [];
  } catch (err) {
    console.log(`  Search error: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

async function enrichButterFromOFF(butter: typeof butters.$inferSelect): Promise<boolean> {
  // Build search term from name and brand info
  const searchTerm = butter.name.replace(/mantequilla/i, "").trim() || butter.slug.replace(/-/g, " ");
  console.log(`Searching OFF for: "${searchTerm}" (slug: ${butter.slug})`);

  const results = await searchProduct(searchTerm);
  if (results.length === 0) {
    console.log(`  No results found`);
    return false;
  }

  // Score and sort results
  const scored = results
    .map(p => ({ product: p, score: matchScore(p, searchTerm) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best.score < 5) {
    console.log(`  Best match score too low (${best.score}): ${best.product.product_name || "unnamed"}`);
    return false;
  }

  const product = best.product;
  const name = product.product_name_es || product.product_name || butter.name;
  const imageUrl = product.image_url || product.image_front_url || null;
  const nut = product.nutriments || {};

  console.log(`  Match: ${name} (score: ${best.score})`);
  console.log(`  Barcode: ${product.code}`);
  console.log(`  Image: ${imageUrl ? "YES" : "NO"}`);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  // Only update fields that are currently null/empty
  if (imageUrl && !butter.imageUrl) updates.imageUrl = imageUrl;

  const kcal = toNum(nut["energy-kcal_100g"]);
  if (kcal > 0 && !butter.caloriesKcal) updates.caloriesKcal = String(Math.round(kcal));

  const fat = toNum(nut.fat_100g);
  if (fat > 0 && !butter.totalFatG) {
    updates.totalFatG = String(Math.round(fat * 10) / 10);
    if (!butter.fatPercentage) updates.fatPercentage = String(Math.round(fat * 10) / 10);
  }

  const satFat = toNum(nut["saturated-fat_100g"]);
  if (satFat > 0 && !butter.saturatedFatG) updates.saturatedFatG = String(Math.round(satFat * 10) / 10);

  const transFat = toNum(nut["trans-fat_100g"]);
  if (transFat > 0 && !butter.transFatG) updates.transFatG = String(Math.round(transFat * 10) / 10);

  const cholesterol = toNum(nut.cholesterol_100g);
  if (cholesterol > 0 && !butter.cholesterolMg) updates.cholesterolMg = String(Math.round(cholesterol * 10) / 10);

  const salt = toNum(nut.salt_100g);
  if (salt > 0 && !butter.saltPercentage) updates.saltPercentage = String(Math.round(salt * 1000) / 10);

  const sodium = toNum(nut.sodium_100g);
  if (sodium > 0 && !butter.sodiumMg) updates.sodiumMg = String(Math.round(sodium * 10) / 10);

  const protein = toNum(nut.proteins_100g);
  if (protein > 0 && !butter.proteinG) updates.proteinG = String(Math.round(protein * 10) / 10);

  const carbs = toNum(nut.carbohydrates_100g);
  if (carbs > 0 && !butter.carbsG) updates.carbsG = String(Math.round(carbs * 10) / 10);

  // Ingredients
  const ingredientsText = product.ingredients_text_es || product.ingredients_text || "";
  if (ingredientsText && (!butter.ingredients || butter.ingredients.length === 0)) {
    const ingredientsList = ingredientsText.split(/[,;]/).map(i => i.trim()).filter(i => i.length > 0);
    if (ingredientsList.length > 0) updates.ingredients = ingredientsList;
  }

  // Allergens
  const allergens = (product.allergens_tags || []).map(a => a.replace("en:", "").replace("es:", ""));
  if (allergens.length > 0 && (!butter.allergens || butter.allergens.length === 0)) {
    updates.allergens = allergens;
  }

  // Labels (organic check)
  const labels = product.labels_tags || [];
  if (labels.some(l => l.includes("organic") || l.includes("bio") || l.includes("ecologico"))) {
    updates.isOrganic = true;
  }

  // Weight
  const qty = product.quantity || "";
  const weightMatch = qty.match(/(\d+)\s*g/i);
  if (weightMatch && !butter.weightG) updates.weightG = parseInt(weightMatch[1]);

  if (Object.keys(updates).length > 1) {
    await db.update(butters).set(updates).where(eq(butters.id, butter.id));
    console.log(`  UPDATED: ${Object.keys(updates).length - 1} fields`);
    return true;
  } else {
    console.log(`  No new data to add`);
    return false;
  }
}

async function importSearch() {
  console.log("Enriching butters from Open Food Facts search...\n");

  // Get butters that are missing image or key nutrition data
  const allButters = await db.select().from(butters);

  // Prioritize butters missing imageUrl
  const missingImage = allButters.filter(b => !b.imageUrl);
  console.log(`Found ${missingImage.length} butters missing image data.\n`);

  let enriched = 0;
  let failed = 0;

  for (const butter of missingImage) {
    const success = await enrichButterFromOFF(butter);
    if (success) enriched++;
    else failed++;

    // Rate limit
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nDone! Enriched: ${enriched}, Failed: ${failed}`);
}

importSearch().catch(console.error);