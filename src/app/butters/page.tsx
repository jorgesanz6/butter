import Link from "next/link";
import { db } from "@/lib/db";
import { butters, butterSupermarkets, supermarkets, brands, butterCategories } from "@/lib/db/schema";
import { desc, asc, sql, eq } from "drizzle-orm";
import { OverallScore, ScoreBadge } from "@/components/score-badges";
import { SupermarketBadge } from "@/components/supermarket-badge";
import { ButterImage } from "@/components/butter-image";

export const dynamic = "force-dynamic";

interface SearchParams {
  category?: string;
  supermarket?: string;
  milk?: string;
  sort?: string;
}

async function getButtersData(searchParams: SearchParams) {
  const allButters = await db.select().from(butters);
  const allBrands = await db.select().from(brands);
  const allCategories = await db.select().from(butterCategories);
  const allSupermarkets = await db.select().from(supermarkets);
  const allPrices = await db.select().from(butterSupermarkets);

  return { allButters, allBrands, allCategories, allSupermarkets, allPrices };
}

export default async function ButtersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { allButters, allBrands, allCategories, allSupermarkets, allPrices } = await getButtersData(params);

  const categoryMap = new Map(allCategories.map(c => [c.id, c]));
  const brandMap = new Map(allBrands.map(b => [b.id, b]));

  // Filter and sort butters
  let filtered = [...allButters];

  if (params.category) {
    const cat = allCategories.find(c => c.slug === params.category);
    if (cat) filtered = filtered.filter(b => b.categoryId === cat.id);
  }

  if (params.milk) {
    filtered = filtered.filter(b => b.milkType === params.milk);
  }

  if (params.supermarket) {
    const sup = allSupermarkets.find(s => s.slug === params.supermarket);
    if (sup) {
      const butterIdsInSup = new Set(allPrices.filter(p => p.supermarketId === sup.id).map(p => p.butterId));
      filtered = filtered.filter(b => butterIdsInSup.has(b.id));
    }
  }

  // Sort
  const sort = params.sort || "overall";
  filtered.sort((a, b) => {
    switch (sort) {
      case "quality": return Number(b.qualityScore || 0) - Number(a.qualityScore || 0);
      case "value": return Number(b.valueScore || 0) - Number(a.valueScore || 0);
      case "nutrition": return Number(b.nutritionScore || 0) - Number(a.nutritionScore || 0);
      case "price-asc": return 0;
      case "price-desc": return 0;
      default: return Number(b.overallScore || 0) - Number(a.overallScore || 0);
    }
  });

  const milkTypes = [...new Set(allButters.map(b => b.milkType).filter(Boolean))] as string[];

  const getPricesForButter = (butterId: string) =>
    allPrices
      .filter(p => p.butterId === butterId)
      .map(p => ({
        name: allSupermarkets.find(s => s.id === p.supermarketId)?.name || "",
        priceEur: Number(p.priceEur),
        availability: p.availability,
      }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Mantequillas</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/butters" className={`text-sm px-3 py-2 rounded-lg border transition-colors ${!params.category && !params.supermarket && !params.milk ? "bg-amber-700 text-white border-amber-700" : "bg-white text-stone-700 border-stone-200 hover:border-amber-300"}`}>
          Todas
        </Link>
        {allCategories.map(cat => (
          <Link key={cat.id} href={`/butters?category=${cat.slug}`} className={`text-sm px-3 py-2 rounded-lg border transition-colors ${params.category === cat.slug ? "bg-amber-700 text-white border-amber-700" : "bg-white text-stone-700 border-stone-200 hover:border-amber-300"}`}>
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <select
          className="text-sm rounded-lg border border-stone-200 px-3 py-2 bg-white text-stone-700"
          defaultValue={params.supermarket || ""}
          onChange={(e) => { /* client-side filtering would need JS */ }}
        >
          <option value="">Todos los supermercados</option>
          {allSupermarkets.map(s => (
            <option key={s.id} value={s.slug}>{s.name}</option>
          ))}
        </select>

        <select className="text-sm rounded-lg border border-stone-200 px-3 py-2 bg-white text-stone-700">
          <option value="">Todo tipo de leche</option>
          {milkTypes.map(m => (
            <option key={m} value={m!}>{m!.charAt(0).toUpperCase() + m!.slice(1)}</option>
          ))}
        </select>

        <select className="text-sm rounded-lg border border-stone-200 px-3 py-2 bg-white text-stone-700">
          <option value="overall">Mejor puntuación</option>
          <option value="quality">Mejor calidad</option>
          <option value="value">Mejor valor</option>
          <option value="nutrition">Mejor nutrición</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-stone-500 mb-4">{filtered.length} mantequillas encontradas</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((butter) => {
          const prices = getPricesForButter(butter.id);
          const brand = brandMap.get(butter.brandId ?? "");
          const category = categoryMap.get(butter.categoryId ?? "");

          return (
            <Link key={butter.id} href={`/butters/${butter.slug}`}>
              <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md hover:border-amber-300 transition-all group">
                <div className="flex gap-3">
                  <ButterImage name={butter.name} brand={brand?.name} category={category?.slug} fatPercentage={Number(butter.fatPercentage)} isOrganic={butter.isOrganic} imageUrl={butter.imageUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate text-sm">{butter.name}</h3>
                    <p className="text-xs text-stone-500">{brand?.name}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">{category?.name}</span>
                      {butter.isOrganic && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Eco</span>}
                      {butter.fatPercentage && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">{butter.fatPercentage}%</span>}
                    </div>
                  </div>
                  <OverallScore score={Number(butter.overallScore)} size="sm" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {prices.slice(0, 3).map((p, i) => (
                    <SupermarketBadge key={i} name={p.name} price={p.priceEur} availability={p.availability} />
                  ))}
                  {prices.length > 3 && <span className="text-xs text-stone-400 self-center">+{prices.length - 3} más</span>}
                </div>
                <div className="mt-2 flex gap-2">
                  <ScoreBadge score={Number(butter.qualityScore)} label="Calidad" size="sm" />
                  <ScoreBadge score={Number(butter.valueScore)} label="Valor" size="sm" />
                  <ScoreBadge score={Number(butter.nutritionScore)} label="Nutrición" size="sm" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}