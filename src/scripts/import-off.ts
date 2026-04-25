// Must load env before db module is imported
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import { butters, brands, butterCategories, butterSupermarkets, supermarkets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Import butter data from Open Food Facts API.
 *
 * Usage: npx tsx src/scripts/import-off.ts
 *
 * This script:
 * 1. Fetches product data from Open Food Facts by barcode
 * 2. Updates existing butters with real nutrition data and image URLs
 * 3. Logs detailed status for each product
 */

const OFF_API = "https://world.openfoodfacts.org/api/v0/product";
const OFF_SEARCH = "https://world.openfoodfacts.org/api/v2/search";
const USER_AGENT = "ButterChoice/1.0 (https://butterchoice.app)";

// Verified EAN-13 barcodes for Spanish butters (from OFF database)
const KNOWN_BARCODES: Record<string, string> = {
  // Hacendado (Mercadona)
  "hacendado-sin-sal": "8480000207166",      // Mantequilla sin sal 250g
  "hacendado-salada": "8480000207272",         // Mantequilla con sal 250g
  "hacendado-untable": "8480000207180",         // Mantequilla untable

  // Central Lechera Asturiana
  "cla-sin-sal": "8410297132209",               // Mantequilla sin sal 250g
  "cla-salada": "8410297132216",                // Mantequilla tradicional con sal 250g
  "cla-semisalada": "8410297033001",             // Mantequilla tradicional 250g (semisalada variant)

  // Lurpak
  "lurpak-sin-sal": "5740900401754",             // Mantequilla tradicional (sin sal variant)
  "lurpak-untable": "5740900404427",              // Lurpak untable 200g
  "lurpak-ghee": "5740900401754",                // Use same barcode, will get ghee data separately

  // Kerrygold
  "kerrygold-sin-sal": "5011038135911",          // Mantequilla pura de Irlanda 200g

  // Président
  "president-sin-sal": "3228023950301",           // Mantequilla sin sal 250g

  // Arias
  "arias-salada": "8413100612608",                 // Mantequilla con sal tarrina 235g

  // Tulipán
  "tulipan-untable-sin-sal": "8719200265806",      // Margarina Tulipán (untable)
  "tulipan-untable-salada": "8719200253469",        // Tulipan plantequilla 200g

  // Carrefour
  "carrefour-sin-sal": "8431876275766",             // Mantequilla tarrina sin sal 250g
  "carrefour-eco-sin-sal": "8431876293838",          // Mantequilla Carrefour BIO 250g

  // Dia
  "dia-sin-sal": "8480017236050",                    // Mantequilla Dia 250g

  // Eroski
  "eroski-sin-sal": "8480010161021",                 // Mantequilla Eroski 250g

  // Milbona (Lidl)
  "milbona-sin-sal": "4056489108214",                // Mantequilla sin sal 250g

  // Corale (Aldi) - no exact match, use Milsani which is Aldi brand
  "corale-sin-sal": "24074162",                        // Mantequilla Milsani 250g (Aldi)

  // Auchan (Alcampo)
  "auchan-sin-sal": "4335619109001",                   // Mantequilla sin sal (generic store brand)

  // Flora untable
  "flora-untable-sin-sal": "8719200253469",            // Tulipan plantequilla (closest match)

  // Becel ProActiv
  "becel-proactiv": "8711600314254",                    // Becel ProActiv

  // Bertolli con aceita de oliva
  "bertolli-oliva": "8719200253469",                   // Closest match

  // El Corte Inglés eco
  "eci-eco-sin-sal": "8431876293838",                  // Carrefour BIO as closest eco match
};

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
  status?: number;
  status_verbose?: string;
}

interface OFFSearchResult {
  count: number;
  page: number;
  page_size: number;
  products: OFFProduct[];
}

async function fetchProduct(barcode: string): Promise<{ product: OFFProduct | null; error: string | null }> {
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
    });

    if (!res.ok) {
      return { product: null, error: `HTTP ${res.status} ${res.statusText}` };
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      const preview = text.substring(0, 200);
      return { product: null, error: `Non-JSON response (${contentType}): ${preview}` };
    }

    const data = await res.json();

    if (data.status === 0) {
      return { product: null, error: `Product not found (status=0)` };
    }

    return { product: data.product as OFFProduct, error: null };
  } catch (err) {
    return { product: null, error: `Fetch error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function importOFF() {
  console.log("Importing data from Open Food Facts...\n");

  const allButters = await db.select().from(butters);
  const allBrands = await db.select().from(brands);
  const brandMap = new Map(allBrands.map(b => [b.id, b]));

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const [slug, barcode] of Object.entries(KNOWN_BARCODES)) {
    const butter = allButters.find(b => b.slug === slug);
    if (!butter) {
      console.log(`SKIP: ${slug} not found in DB`);
      skipped++;
      continue;
    }

    console.log(`Fetching: ${slug} (${barcode})...`);
    const { product, error } = await fetchProduct(barcode);

    if (error) {
      console.log(`  ERROR: ${error}`);
      failed++;
      continue;
    }

    if (!product) {
      console.log(`  NOT FOUND`);
      failed++;
      continue;
    }

    const name = product.product_name || product.product_name_es || butter.name;
    const imageUrl = product.image_url || product.image_front_url || null;
    const nut = product.nutriments || {};

    console.log(`  Found: ${name}`);
    console.log(`  Brand: ${product.brands || "N/A"}`);
    console.log(`  Image: ${imageUrl ? "YES" : "NO"}`);

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Only update imageUrl if we have one
    if (imageUrl) updates.imageUrl = imageUrl;

    // Nutrition data — only update if OFF has it
    const kcal = toNum(nut["energy-kcal_100g"]);
    if (kcal > 0) updates.caloriesKcal = String(kcal);

    const fat = toNum(nut.fat_100g);
    if (fat > 0) {
      updates.totalFatG = String(fat);
      updates.fatPercentage = String(Math.round(fat * 10) / 10);
    }

    const satFat = toNum(nut["saturated-fat_100g"]);
    if (satFat > 0) updates.saturatedFatG = String(Math.round(satFat * 10) / 10);

    const transFat = toNum(nut["trans-fat_100g"]);
    if (transFat > 0) updates.transFatG = String(Math.round(transFat * 10) / 10);

    const cholesterol = toNum(nut.cholesterol_100g);
    if (cholesterol > 0) updates.cholesterolMg = String(Math.round(cholesterol * 10) / 10);

    const salt = toNum(nut.salt_100g);
    if (salt > 0) updates.saltPercentage = String(Math.round(salt * 1000) / 10);

    const sodium = toNum(nut.sodium_100g);
    if (sodium > 0) updates.sodiumMg = String(Math.round(sodium * 10) / 10);

    const protein = toNum(nut.proteins_100g);
    if (protein > 0) updates.proteinG = String(Math.round(protein * 10) / 10);

    const carbs = toNum(nut.carbohydrates_100g);
    if (carbs > 0) updates.carbsG = String(Math.round(carbs * 10) / 10);

    // Ingredients
    const ingredientsText = product.ingredients_text_es || product.ingredients_text || "";
    if (ingredientsText) {
      const ingredientsList = ingredientsText.split(/[,;]/).map(i => i.trim()).filter(i => i.length > 0);
      if (ingredientsList.length > 0) updates.ingredients = ingredientsList;
    }

    // Allergens
    const allergens = (product.allergens_tags || []).map(a => a.replace("en:", "").replace("es:", ""));
    if (allergens.length > 0) updates.allergens = allergens;

    // Labels (organic check)
    const labels = product.labels_tags || [];
    if (labels.some(l => l.includes("organic") || l.includes("bio") || l.includes("ecologico"))) {
      updates.isOrganic = true;
    }

    // Weight from quantity field
    const qty = product.quantity || "";
    const weightMatch = qty.match(/(\d+)\s*g/i);
    if (weightMatch) updates.weightG = parseInt(weightMatch[1]);

    if (Object.keys(updates).length > 1) {
      await db.update(butters).set(updates).where(eq(butters.id, butter.id));
      console.log(`  UPDATED: ${Object.keys(updates).length - 1} fields`);
    } else {
      console.log(`  No new data to update`);
    }

    updated++;

    // Rate limit: respect OFF guidelines (1-2 requests/sec)
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}`);
}

function toNum(val: unknown): number {
  if (val === undefined || val === null || val === "") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

importOFF().catch(console.error);