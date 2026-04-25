export interface ButterCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  logoUrl: string | null;
}

export interface Supermarket {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  type: string | null;
}

export interface Denomination {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  description: string | null;
}

export interface Butter {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  denominationId: string | null;
  fatPercentage: number | null;
  saltPercentage: number | null;
  waterPercentage: number | null;
  milkType: string | null;
  isOrganic: boolean | null;
  isClarified: boolean | null;
  isSpreadable: boolean | null;
  color: string | null;
  ingredients: string[] | null;
  additives: string[] | null;
  allergens: string[] | null;
  caloriesKcal: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  transFatG: number | null;
  cholesterolMg: number | null;
  sodiumMg: number | null;
  proteinG: number | null;
  carbsG: number | null;
  weightG: number | null;
  format: string | null;
  packagingType: string | null;
  qualityScore: number | null;
  valueScore: number | null;
  nutritionScore: number | null;
  overallScore: number | null;
  imageUrl: string | null;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ButterSupermarket {
  butterId: string;
  supermarketId: string;
  priceEur: number | null;
  pricePer100g: number | null;
  availability: string | null;
  lastChecked: Date | null;
  url: string | null;
}

export interface ButterWithDetails extends Butter {
  brand: Brand;
  category: ButterCategory;
  denomination: Denomination | null;
  supermarkets: (ButterSupermarket & { supermarket: Supermarket })[];
}