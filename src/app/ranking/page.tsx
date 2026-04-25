import Link from "next/link";
import { db } from "@/lib/db";
import { butters, brands, butterCategories, butterSupermarkets, supermarkets } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getRankingData() {
  const allButters = await db.select().from(butters);
  const allBrands = await db.select().from(brands);
  const allCategories = await db.select().from(butterCategories);
  const allPrices = await db.select().from(butterSupermarkets);
  const allSupermarkets = await db.select().from(supermarkets);

  const brandMap = new Map(allBrands.map(b => [b.id, b]));
  const categoryMap = new Map(allCategories.map(c => [c.id, c]));
  const supMap = new Map(allSupermarkets.map(s => [s.id, s]));

  const pricesByButter = new Map<string, { name: string; priceEur: number; availability: string | null }[]>();
  for (const p of allPrices) {
    if (!p.butterId) continue;
    if (!pricesByButter.has(p.butterId)) pricesByButter.set(p.butterId, []);
    const sup = supMap.get(p.supermarketId!);
    if (sup) pricesByButter.get(p.butterId!)!.push({ name: sup.name, priceEur: Number(p.priceEur), availability: p.availability });
  }

  return { allButters, brandMap, categoryMap, pricesByButter };
}

function RankingList({ butters, brandMap, categoryMap, pricesByButter, title, scoreField }: {
  butters: any[];
  brandMap: Map<string, any>;
  categoryMap: Map<string, any>;
  pricesByButter: Map<string, any[]>;
  title: string;
  scoreField: string;
}) {
  const sorted = [...butters].sort((a, b) => Number(b[scoreField]) - Number(a[scoreField])).slice(0, 10);

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-stone-900 mb-4">{title}</h2>
      <div className="space-y-2">
        {sorted.map((butter, index) => {
          const prices = pricesByButter.get(butter.id) || [];
          const cheapest = prices.length > 0 ? prices.reduce((min, p) => p.priceEur < min.priceEur ? p : min, prices[0]) : null;

          return (
            <Link key={butter.id} href={`/butters/${butter.slug}`}>
              <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-stone-100 text-stone-600"}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900 group-hover:text-amber-800 text-sm truncate">{butter.name}</div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>{brandMap.get(butter.brandId ?? "")?.name}</span>
                    <span className="text-stone-300">|</span>
                    <span>{categoryMap.get(butter.categoryId ?? "")?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {cheapest && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-900">{cheapest.priceEur.toFixed(2)}€</div>
                      <div className="text-[10px] text-stone-400">{cheapest.name}</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-700">{Number(butter[scoreField]).toFixed(1)}</div>
                    <div className="text-[10px] text-stone-400">/10</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function RankingPage() {
  const { allButters, brandMap, categoryMap, pricesByButter } = await getRankingData();

  const pureButters = allButters.filter(b => b.ingredients && b.ingredients.length === 1 && b.ingredients[0]?.includes("nata"));
  const organicButters = allButters.filter(b => b.isOrganic);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Ranking</h1>
      <p className="text-stone-500 mb-8">Las mejores mantequillas según diferentes criterios</p>

      <RankingList butters={allButters} brandMap={brandMap} categoryMap={categoryMap} pricesByButter={pricesByButter} title="Mejor puntuación general" scoreField="overallScore" />
      <RankingList butters={allButters} brandMap={brandMap} categoryMap={categoryMap} pricesByButter={pricesByButter} title="Mejor calidad" scoreField="qualityScore" />
      <RankingList butters={allButters} brandMap={brandMap} categoryMap={categoryMap} pricesByButter={pricesByButter} title="Mejor relación calidad-precio" scoreField="valueScore" />
      <RankingList butters={allButters} brandMap={brandMap} categoryMap={categoryMap} pricesByButter={pricesByButter} title="Mejor nutrición" scoreField="nutritionScore" />

      {pureButters.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-stone-900 mb-4">Mantequillas 100% puras</h2>
          <p className="text-sm text-stone-500 mb-4">Solo un ingrediente: nata de vaca</p>
          <div className="space-y-2">
            {pureButters.sort((a, b) => Number(b.overallScore) - Number(a.overallScore)).slice(0, 10).map((butter, index) => {
              const prices = pricesByButter.get(butter.id) || [];
              const cheapest = prices.length > 0 ? prices.reduce((min, p) => p.priceEur < min.priceEur ? p : min, prices[0]) : null;
              return (
                <Link key={butter.id} href={`/butters/${butter.slug}`}>
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-900 group-hover:text-amber-800 text-sm truncate">{butter.name}</div>
                      <div className="text-xs text-stone-500">{brandMap.get(butter.brandId ?? "")?.name}</div>
                    </div>
                    {cheapest && <div className="text-sm font-bold">{cheapest.priceEur.toFixed(2)}€</div>}
                    <div className="text-lg font-bold text-amber-700">{Number(butter.overallScore).toFixed(1)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {organicButters.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-stone-900 mb-4">Mantequillas ecológicas</h2>
          <div className="space-y-2">
            {organicButters.sort((a, b) => Number(b.overallScore) - Number(a.overallScore)).map((butter) => {
              const prices = pricesByButter.get(butter.id) || [];
              const cheapest = prices.length > 0 ? prices.reduce((min, p) => p.priceEur < min.priceEur ? p : min, prices[0]) : null;
              return (
                <Link key={butter.id} href={`/butters/${butter.slug}`}>
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-200 hover:border-green-300 transition-all group">
                    <span className="text-lg">🌿</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-900 group-hover:text-green-800 text-sm truncate">{butter.name}</div>
                      <div className="text-xs text-stone-500">{brandMap.get(butter.brandId ?? "")?.name}</div>
                    </div>
                    {cheapest && <div className="text-sm font-bold">{cheapest.priceEur.toFixed(2)}€</div>}
                    <div className="text-lg font-bold text-green-700">{Number(butter.overallScore).toFixed(1)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}