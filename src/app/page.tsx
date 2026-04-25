import Link from "next/link";
import { db } from "@/lib/db";
import { butters, butterSupermarkets, supermarkets, brands, butterCategories } from "@/lib/db/schema";
import { desc, inArray } from "drizzle-orm";
import { OverallScore, ScoreBadge } from "@/components/score-badges";
import { SupermarketBadge } from "@/components/supermarket-badge";
import { ButterImage } from "@/components/butter-image";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const topButters = await db.select().from(butters).orderBy(desc(butters.overallScore)).limit(6);
  const supermarketList = await db.select().from(supermarkets).orderBy(supermarkets.name);
  const categoryList = await db.select().from(butterCategories).orderBy(butterCategories.name);

  const butterIds = topButters.map(b => b.id);
  const brandIds = [...new Set(topButters.map(b => b.brandId).filter(Boolean) as string[])];
  const categoryIds = [...new Set(topButters.map(b => b.categoryId).filter(Boolean) as string[])];

  const [brandData, categoryData, priceData] = await Promise.all([
    brandIds.length > 0 ? db.select().from(brands).where(inArray(brands.id, brandIds)) : Promise.resolve([]),
    categoryIds.length > 0 ? db.select().from(butterCategories).where(inArray(butterCategories.id, categoryIds)) : Promise.resolve([]),
    butterIds.length > 0 ? db.select().from(butterSupermarkets).where(inArray(butterSupermarkets.butterId, butterIds)) : Promise.resolve([]),
  ]);

  const supIds = [...new Set(priceData.map(p => p.supermarketId).filter(Boolean) as string[])];
  const supData = supIds.length > 0 ? await db.select().from(supermarkets).where(inArray(supermarkets.id, supIds)) : [];

  return { topButters, supermarketList, categoryList, priceData, brandData, categoryData, supData };
}

export default async function Home() {
  const { topButters, supermarketList, categoryList, priceData, brandData, categoryData, supData } = await getHomeData();

  const getBrand = (brandId: string | null) => brandData.find(b => b.id === brandId)?.name || "";
  const getCategory = (categoryId: string | null) => categoryData.find(c => c.id === categoryId)?.name || "";
  const getCategorySlug = (categoryId: string | null) => categoryData.find(c => c.id === categoryId)?.slug || "";
  const getPrices = (butterId: string) =>
    priceData
      .filter(p => p.butterId === butterId)
      .map(p => {
        const s = supData.find(s => s.id === p.supermarketId);
        return { name: s?.name || "", priceEur: Number(p.priceEur), availability: p.availability };
      });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">🧈 ButterChoice</h1>
          <p className="text-lg text-amber-700 mb-8 max-w-2xl mx-auto">
            Encuentra la mejor mantequilla en tu supermercado. Compara calidad, precio y nutrición de todas las marcas disponibles en España.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/butters" className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium">Ver todas las mantequillas</Link>
            <Link href="/compare" className="px-6 py-3 bg-white text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium border border-amber-300">Comparar</Link>
            <Link href="/ranking" className="px-6 py-3 bg-white text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium border border-amber-300">Ranking</Link>
          </div>
        </div>
      </section>

      {/* Top Butters */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-900">Top Mantequillas</h2>
          <Link href="/butters" className="text-sm text-amber-700 hover:text-amber-800 font-medium">Ver todas →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topButters.map((butter) => {
            const prices = getPrices(butter.id);
            return (
              <Link key={butter.id} href={`/butters/${butter.slug}`}>
                <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md hover:border-amber-300 transition-all group">
                  <div className="flex gap-3">
                    <ButterImage name={butter.name} brand={getBrand(butter.brandId)} category={getCategorySlug(butter.categoryId)} fatPercentage={Number(butter.fatPercentage)} isOrganic={butter.isOrganic} imageUrl={butter.imageUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate text-sm">{butter.name}</h3>
                      <p className="text-xs text-stone-500">{getBrand(butter.brandId)}</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">{getCategory(butter.categoryId)}</span>
                        {butter.isOrganic && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Eco</span>}
                      </div>
                    </div>
                    <OverallScore score={Number(butter.overallScore)} size="sm" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {prices.slice(0, 3).map((p, i) => (
                      <SupermarketBadge key={i} name={p.name} price={p.priceEur} availability={p.availability} />
                    ))}
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
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Explora por categoría</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categoryList.map((cat) => (
            <Link key={cat.id} href={`/butters?category=${cat.slug}`} className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all text-center">
              <span className="text-sm font-medium text-stone-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Supermarkets */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Supermercados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {supermarketList.map((s) => (
            <Link key={s.id} href={`/supermarkets/${s.slug}`} className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all text-center">
              <span className="text-sm font-medium text-stone-700">{s.name}</span>
              {s.type && <span className="block text-[10px] text-stone-400 mt-1">{s.type}</span>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}