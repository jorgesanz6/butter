export interface ButterForScoring {
  fatPercentage: number | null;
  saltPercentage: number | null;
  milkType: string | null;
  isOrganic: boolean | null;
  isClarified: boolean | null;
  ingredients: string[] | null;
  additives: string[] | null;
  transFatG: number | null;
  saturatedFatG: number | null;
  totalFatG: number | null;
  cholesterolMg: number | null;
  sodiumMg: number | null;
  denominationId: string | null;
  pricePer100g: number | null;
  avgPricePer100g: number | null;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

export function calculateQualityScore(b: ButterForScoring): number {
  let score = 5;

  // Ingredient purity: single ingredient = best
  if (b.ingredients && b.ingredients.length === 1 && b.additives && b.additives.length === 0) {
    score += 2.5;
  } else if (b.ingredients && b.ingredients.length <= 2 && b.additives && b.additives.length === 0) {
    score += 1.5;
  } else if (b.additives && b.additives.length > 0) {
    score -= b.additives.length * 0.5;
  }

  // Fat percentage: >80% = real butter
  if (b.fatPercentage !== null) {
    if (b.fatPercentage >= 82) score += 1.5;
    else if (b.fatPercentage >= 80) score += 1.0;
    else if (b.fatPercentage >= 70) score += 0;
    else score -= 1;
  }

  // Denomination of origin bonus
  if (b.denominationId) score += 1;

  // Organic bonus
  if (b.isOrganic) score += 0.8;

  // Milk type bonus (sheep/goat = unique)
  if (b.milkType === "oveja" || b.milkType === "cabra") score += 0.5;

  return clamp(Math.round(score * 10) / 10, 0, 10);
}

export function calculateNutritionScore(b: ButterForScoring): number {
  let score = 5;

  // Saturated fat ratio (lower is better for health)
  if (b.saturatedFatG !== null && b.totalFatG !== null && b.totalFatG > 0) {
    const satRatio = b.saturatedFatG / b.totalFatG;
    if (satRatio <= 0.3) score += 3;
    else if (satRatio <= 0.5) score += 1.5;
    else if (satRatio <= 0.65) score += 0.5;
    else score -= 0.5;
  }

  // Trans fat penalty
  if (b.transFatG !== null && b.transFatG > 0) {
    score -= Math.min(b.transFatG * 1.5, 2);
  }

  // Cholesterol (lower is better)
  if (b.cholesterolMg !== null) {
    if (b.cholesterolMg <= 50) score += 2;
    else if (b.cholesterolMg <= 100) score += 1;
    else if (b.cholesterolMg <= 200) score += 0;
    else score -= 0.5;
  }

  // Sodium (lower is better)
  if (b.sodiumMg !== null) {
    if (b.sodiumMg <= 20) score += 1;
    else if (b.sodiumMg <= 500) score += 0;
    else score -= 0.5;
  }

  return clamp(Math.round(score * 10) / 10, 0, 10);
}

export function calculateValueScore(b: ButterForScoring): number {
  if (b.pricePer100g === null || b.avgPricePer100g === null || b.avgPricePer100g === 0) return 5;

  const ratio = b.pricePer100g / b.avgPricePer100g;

  if (ratio <= 0.6) return 9.5;
  if (ratio <= 0.7) return 9.0;
  if (ratio <= 0.8) return 8.5;
  if (ratio <= 0.9) return 7.5;
  if (ratio <= 1.0) return 6.5;
  if (ratio <= 1.1) return 5.5;
  if (ratio <= 1.2) return 4.5;
  if (ratio <= 1.4) return 3.5;
  return 2.5;
}

export function calculateOverallScore(
  qualityScore: number,
  nutritionScore: number,
  valueScore: number,
): number {
  const overall = qualityScore * 0.4 + nutritionScore * 0.25 + valueScore * 0.35;
  return clamp(Math.round(overall * 10) / 10, 0, 10);
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return "Excepcional";
  if (score >= 8) return "Excelente";
  if (score >= 7) return "Muy buena";
  if (score >= 6) return "Buena";
  if (score >= 5) return "Correcta";
  if (score >= 4) return "Mediocre";
  return "Mala";
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600";
  if (score >= 7) return "text-green-500";
  if (score >= 6) return "text-yellow-500";
  if (score >= 5) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBg(score: number): string {
  if (score >= 8) return "bg-emerald-100 border-emerald-300";
  if (score >= 7) return "bg-green-50 border-green-200";
  if (score >= 6) return "bg-yellow-50 border-yellow-200";
  if (score >= 5) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}