import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { butters, brands, butterCategories, denominations, butterSupermarkets, supermarkets } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { OverallScore, ScoreBadge } from "@/components/score-badges";
import { SupermarketBadge } from "@/components/supermarket-badge";
import { NutritionTable } from "@/components/nutrition-table";
import { ButterImage } from "@/components/butter-image";

export const dynamic = "force-dynamic";

async function getButterDetail(slug: string) {
  const [butter] = await db.select().from(butters).where(eq(butters.slug, slug));
  if (!butter) return null;

  const brand = butter.brandId ? (await db.select().from(brands).where(eq(brands.id, butter.brandId!)))[0] : null;
  const category = butter.categoryId ? (await db.select().from(butterCategories).where(eq(butterCategories.id, butter.categoryId!)))[0] : null;
  const denomination = butter.denominationId
    ? (await db.select().from(denominations).where(eq(denominations.id, butter.denominationId!)))[0]
    : null;

  const priceRows = await db.select().from(butterSupermarkets).where(eq(butterSupermarkets.butterId, butter.id));

  const supIds = priceRows.map(p => p.supermarketId).filter(Boolean) as string[];
  const supData = supIds.length > 0 ? await db.select().from(supermarkets).where(inArray(supermarkets.id, supIds)) : [];

  const supermarketData = priceRows.map(bs => {
    const supermarket = supData.find(s => s.id === bs.supermarketId);
    return { ...bs, supermarket };
  }).filter(d => d.supermarket).sort((a, b) => Number(a.priceEur || 0) - Number(b.priceEur || 0));

  // Find cheapest
  const cheapest = supermarketData.length > 0 ? supermarketData[0] : null;

  return { butter, brand, category, denomination, supermarketData, cheapest };
}

export default async function ButterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getButterDetail(slug);
  if (!data) notFound();

  const { butter, brand, category, denomination, supermarketData, cheapest } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <Link href="/butters" className="hover:text-amber-700">Mantequillas</Link>
        <span>/</span>
        <span className="text-stone-700">{butter.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <ButterImage
            name={butter.name}
            brand={brand?.name}
            category={category?.slug}
            fatPercentage={Number(butter.fatPercentage)}
            isOrganic={butter.isOrganic}
            imageUrl={butter.imageUrl}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">{butter.name}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm text-amber-700 font-medium">{brand?.name}</span>
              <span className="text-stone-300">|</span>
              <span className="text-sm text-stone-500">{category?.name}</span>
              {denomination && <><span className="text-stone-300">|</span><span className="text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded">{denomination.name}</span></>}
              {butter.isOrganic && <span className="text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded">Ecológica</span>}
              {butter.isClarified && <span className="text-sm text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Clarificada</span>}
              {butter.isSpreadable && <span className="text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Untable</span>}
            </div>
            {butter.description && <p className="text-stone-600 text-sm mb-3">{butter.description}</p>}

            {/* Best price callout */}
            {cheapest && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-sm text-emerald-700 font-medium">Mejor precio</div>
                  <div className="text-lg font-bold text-emerald-800">{Number(cheapest.priceEur).toFixed(2)}€ <span className="text-sm font-normal text-emerald-600">en {cheapest.supermarket!.name}</span></div>
                  {cheapest.pricePer100g && <div className="text-xs text-emerald-600">{Number(cheapest.pricePer100g).toFixed(2)}€/100g</div>}
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <OverallScore score={Number(butter.overallScore)} size="lg" />
          </div>
        </div>
        <div className="mt-4 flex gap-4 justify-center sm:justify-start">
          <ScoreBadge score={Number(butter.qualityScore)} label="Calidad" size="md" />
          <ScoreBadge score={Number(butter.valueScore)} label="Valor" size="md" />
          <ScoreBadge score={Number(butter.nutritionScore)} label="Nutrición" size="md" />
        </div>
      </div>

      {/* Price Comparison — prominent */}
      {supermarketData.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🏪</span> Comparativa de precios
          </h2>
          <div className="space-y-2">
            {supermarketData.map((item, i) => {
              const isCheapest = i === 0 && supermarketData.length > 1;
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${isCheapest ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-100'}`}>
                  <div className="flex items-center gap-3">
                    <SupermarketBadge name={item.supermarket!.name} availability={item.availability} />
                    {isCheapest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold">MEJOR PRECIO</span>}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isCheapest ? 'text-emerald-700' : 'text-stone-900'}`}>{Number(item.priceEur).toFixed(2)}€</div>
                    {item.pricePer100g && <div className="text-xs text-stone-500">{Number(item.pricePer100g).toFixed(2)}€/100g</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {supermarketData.length > 1 && (
            <div className="mt-3 text-sm text-stone-500 text-center">
              Diferencia de precio: <span className="font-bold text-stone-700">{Number(supermarketData[supermarketData.length - 1].priceEur).toFixed(2)}€</span> → <span className="font-bold text-emerald-700">{Number(supermarketData[0].priceEur).toFixed(2)}€</span> — ahorras hasta <span className="font-bold text-emerald-700">{(Number(supermarketData[supermarketData.length - 1].priceEur) - Number(supermarketData[0].priceEur)).toFixed(2)}€</span>
            </div>
          )}
        </div>
      )}

      {/* Characteristics */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-stone-900 mb-4">Características</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {butter.fatPercentage !== null && <div className="bg-amber-50 rounded-lg p-3"><div className="text-stone-500 text-xs">Grasa</div><div className="font-bold text-stone-900">{butter.fatPercentage}%</div></div>}
          {butter.saltPercentage !== null && <div className="bg-stone-50 rounded-lg p-3"><div className="text-stone-500 text-xs">Sal</div><div className="font-bold text-stone-900">{butter.saltPercentage}%</div></div>}
          {butter.milkType && <div className="bg-stone-50 rounded-lg p-3"><div className="text-stone-500 text-xs">Tipo de leche</div><div className="font-bold text-stone-900 capitalize">{butter.milkType}</div></div>}
          {butter.weightG && <div className="bg-stone-50 rounded-lg p-3"><div className="text-stone-500 text-xs">Peso</div><div className="font-bold text-stone-900">{butter.weightG}g</div></div>}
          {butter.format && <div className="bg-stone-50 rounded-lg p-3"><div className="text-stone-500 text-xs">Formato</div><div className="font-bold text-stone-900 capitalize">{butter.format}</div></div>}
          {butter.color && <div className="bg-stone-50 rounded-lg p-3"><div className="text-stone-500 text-xs">Color</div><div className="font-bold text-stone-900">{butter.color}</div></div>}
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-stone-900 mb-4">Ingredientes</h2>
        {butter.ingredients && butter.ingredients.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-medium text-stone-600 mb-1">Ingredientes principales</h3>
            <div className="flex flex-wrap gap-2">
              {butter.ingredients.map((ing, i) => <span key={i} className="text-sm px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">{ing}</span>)}
            </div>
          </div>
        )}
        {butter.additives && butter.additives.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-medium text-stone-600 mb-1">Aditivos</h3>
            <div className="flex flex-wrap gap-2">
              {butter.additives.map((add, i) => <span key={i} className="text-sm px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200">{add}</span>)}
            </div>
          </div>
        )}
        {butter.allergens && butter.allergens.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-stone-600 mb-1">Alérgenos</h3>
            <div className="flex flex-wrap gap-2">
              {butter.allergens.map((all, i) => <span key={i} className="text-sm px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200">{all}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Nutrition */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <NutritionTable nutrition={{
          caloriesKcal: Number(butter.caloriesKcal),
          totalFatG: Number(butter.totalFatG),
          saturatedFatG: Number(butter.saturatedFatG),
          transFatG: Number(butter.transFatG),
          cholesterolMg: Number(butter.cholesterolMg),
          sodiumMg: Number(butter.sodiumMg),
          proteinG: Number(butter.proteinG),
          carbsG: Number(butter.carbsG),
        }} />
      </div>

      <div className="mt-6">
        <Link href="/butters" className="text-amber-700 hover:text-amber-800 font-medium text-sm">← Volver a mantequillas</Link>
      </div>
    </div>
  );
}