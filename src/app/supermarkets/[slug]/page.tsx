import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { supermarkets, butters, butterSupermarkets, brands, butterCategories } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { OverallScore, ScoreBadge } from "@/components/score-badges";
import { ButterImage } from "@/components/butter-image";

export const dynamic = "force-dynamic";

async function getSupermarketData(slug: string) {
  const [supermarket] = await db.select().from(supermarkets).where(eq(supermarkets.slug, slug));
  if (!supermarket) return null;

  const priceRows = await db.select().from(butterSupermarkets).where(eq(butterSupermarkets.supermarketId, supermarket.id));

  const butterIds = priceRows.map(p => p.butterId).filter(Boolean) as string[];
  const butterRows = butterIds.length > 0 ? await db.select().from(butters).where(inArray(butters.id, butterIds)).orderBy(desc(butters.overallScore)) : [];

  const brandIds = [...new Set(butterRows.map(b => b.brandId).filter(Boolean) as string[])];
  const categoryIds = [...new Set(butterRows.map(b => b.categoryId).filter(Boolean) as string[])];
  const [brandData, categoryData] = await Promise.all([
    brandIds.length > 0 ? db.select().from(brands).where(inArray(brands.id, brandIds)) : Promise.resolve([]),
    categoryIds.length > 0 ? db.select().from(butterCategories).where(inArray(butterCategories.id, categoryIds)) : Promise.resolve([]),
  ]);

  const brandMap = new Map(brandData.map(b => [b.id, b]));
  const categoryMap = new Map(categoryData.map(c => [c.id, c]));

  const butterData = butterRows.map(butter => {
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

  return { supermarket, butters: butterData };
}

export default async function SupermarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSupermarketData(slug);
  if (!data) notFound();

  const { supermarket, butters: butterList } = data;

  const byCategory = new Map<string, typeof butterList[0]>();
  for (const b of butterList) {
    const cat = b.category?.name;
    if (cat && (!byCategory.has(cat) || Number(b.overallScore || 0) > Number(byCategory.get(cat)!.overallScore || 0))) {
      byCategory.set(cat, b);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <Link href="/supermarkets" className="hover:text-amber-700">Supermercados</Link>
        <span>/</span>
        <span className="text-stone-700">{supermarket.name}</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-3xl">🏪</div>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{supermarket.name}</h1>
          {supermarket.type && <p className="text-stone-500 capitalize">{supermarket.type}</p>}
          <p className="text-sm text-stone-500">{butterList.length} mantequillas disponibles</p>
        </div>
      </div>

      {byCategory.size > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-stone-900 mb-4">Mejor mantequilla por categoría</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from(byCategory.entries()).map(([cat, b]) => (
              <Link key={cat} href={`/butters/${b.slug}`}>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 hover:border-amber-400 transition-all">
                  <div className="text-xs text-amber-600 font-medium mb-1">{cat}</div>
                  <div className="font-semibold text-stone-900 text-sm">{b.name}</div>
                  <div className="text-xs text-stone-500">{b.brand?.name}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <OverallScore score={Number(b.overallScore)} size="sm" />
                    {b.priceEur && <span className="text-sm font-bold text-stone-900">{Number(b.priceEur).toFixed(2)}€</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-stone-900 mb-4">Todas las mantequillas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {butterList.map((butter) => (
          <Link key={butter.id} href={`/butters/${butter.slug}`}>
            <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="flex gap-3">
                <ButterImage name={butter.name} brand={butter.brand?.name} category={butter.category?.slug} fatPercentage={Number(butter.fatPercentage)} isOrganic={butter.isOrganic} imageUrl={butter.imageUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate text-sm">{butter.name}</h3>
                  <p className="text-xs text-stone-500">{butter.brand?.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">{butter.category?.name}</span>
                </div>
                <OverallScore score={Number(butter.overallScore)} size="sm" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-2">
                  <ScoreBadge score={Number(butter.qualityScore)} label="Calidad" size="sm" />
                  <ScoreBadge score={Number(butter.valueScore)} label="Valor" size="sm" />
                </div>
                {butter.priceEur && <span className="font-bold text-stone-900">{Number(butter.priceEur).toFixed(2)}€</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/supermarkets" className="text-amber-700 hover:text-amber-800 font-medium text-sm">← Volver a supermercados</Link>
      </div>
    </div>
  );
}