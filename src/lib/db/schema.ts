import { pgTable, uuid, varchar, text, boolean, decimal, integer, date, timestamp, smallint, primaryKey } from "drizzle-orm/pg-core";

// Categorías de mantequilla
export const butterCategories = pgTable("butter_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

// Marcas
export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  country: varchar("country", { length: 50 }),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 500 }),
});

// Supermercados (España)
export const supermarkets = pgTable("supermarkets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: varchar("logo_url", { length: 500 }),
  type: varchar("type", { length: 50 }),
});

// Denominaciones de origen
export const denominations = pgTable("denominations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  region: varchar("region", { length: 100 }),
  description: text("description"),
});

// Mantequillas
export const butters = pgTable("butters", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  brandId: uuid("brand_id").references(() => brands.id),
  categoryId: uuid("category_id").references(() => butterCategories.id),
  denominationId: uuid("denomination_id").references(() => denominations.id),

  // Características
  fatPercentage: decimal("fat_percentage", { precision: 5, scale: 2 }),
  saltPercentage: decimal("salt_percentage", { precision: 5, scale: 2 }),
  waterPercentage: decimal("water_percentage", { precision: 5, scale: 2 }),
  milkType: varchar("milk_type", { length: 50 }),
  isOrganic: boolean("is_organic").default(false),
  isClarified: boolean("is_clarified").default(false),
  isSpreadable: boolean("is_spreadable").default(false),
  color: varchar("color", { length: 50 }),

  // Ingredientes
  ingredients: text("ingredients").array(),
  additives: text("additives").array(),
  allergens: text("allergens").array(),

  // Nutrición por 100g
  caloriesKcal: decimal("calories_kcal", { precision: 7, scale: 2 }),
  totalFatG: decimal("total_fat_g", { precision: 5, scale: 2 }),
  saturatedFatG: decimal("saturated_fat_g", { precision: 5, scale: 2 }),
  transFatG: decimal("trans_fat_g", { precision: 5, scale: 2 }),
  cholesterolMg: decimal("cholesterol_mg", { precision: 7, scale: 2 }),
  sodiumMg: decimal("sodium_mg", { precision: 7, scale: 2 }),
  proteinG: decimal("protein_g", { precision: 5, scale: 2 }),
  carbsG: decimal("carbs_g", { precision: 5, scale: 2 }),

  // Packaging
  weightG: integer("weight_g"),
  format: varchar("format", { length: 50 }),
  packagingType: varchar("packaging_type", { length: 50 }),

  // Scoring precalculado
  qualityScore: decimal("quality_score", { precision: 3, scale: 1 }),
  valueScore: decimal("value_score", { precision: 3, scale: 1 }),
  nutritionScore: decimal("nutrition_score", { precision: 3, scale: 1 }),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }),

  imageUrl: varchar("image_url", { length: 500 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Disponibilidad en supermercados (many-to-many)
export const butterSupermarkets = pgTable("butter_supermarkets", {
  butterId: uuid("butter_id").references(() => butters.id),
  supermarketId: uuid("supermarket_id").references(() => supermarkets.id),
  priceEur: decimal("price_eur", { precision: 5, scale: 2 }),
  pricePer100g: decimal("price_per_100g", { precision: 5, scale: 2 }),
  availability: varchar("availability", { length: 20 }),
  lastChecked: date("last_checked"),
  url: varchar("url", { length: 500 }),
}, (table) => [
  primaryKey({ columns: [table.butterId, table.supermarketId] }),
]);

// Reviews
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  butterId: uuid("butter_id").references(() => butters.id),
  userName: varchar("user_name", { length: 100 }),
  rating: smallint("rating"),
  tasteRating: smallint("taste_rating"),
  spreadabilityRating: smallint("spreadability_rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});