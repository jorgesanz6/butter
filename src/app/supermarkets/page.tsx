import Link from "next/link";
import { db } from "@/lib/db";
import { supermarkets, butterSupermarkets } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getSupermarketsData() {
  const supermarketList = await db.select().from(supermarkets).orderBy(supermarkets.name);

  const counts = await db
    .select({
      supermarketId: butterSupermarkets.supermarketId,
      count: sql<number>`count(*)`,
    })
    .from(butterSupermarkets)
    .groupBy(butterSupermarkets.supermarketId);

  const countMap = new Map(counts.map(c => [c.supermarketId, Number(c.count)]));

  return supermarketList.map(s => ({
    ...s,
    butterCount: countMap.get(s.id) || 0,
  }));
}

export default async function SupermarketsPage() {
  const supermarketsData = await getSupermarketsData();

  const typeOrder = ["hipermercado", "supermercado", "descuento", "especializado"];
  const grouped = typeOrder.map(type => ({
    type,
    items: supermarketsData.filter(s => s.type === type),
  })).filter(g => g.items.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Supermercados</h1>
      <p className="text-stone-500 mb-8">Encuentra la mejor mantequilla en cada supermercado de España</p>

      {grouped.map(group => (
        <div key={group.type} className="mb-10">
          <h2 className="text-xl font-bold text-stone-700 mb-4 capitalize">{group.type}s</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {group.items.map(s => (
              <Link key={s.id} href={`/supermarkets/${s.slug}`} className="bg-white rounded-xl border border-stone-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all text-center group">
                <div className="text-3xl mb-2">🏪</div>
                <div className="font-semibold text-stone-800 group-hover:text-amber-800 text-sm">{s.name}</div>
                <div className="text-xs text-stone-400 mt-1">{s.butterCount} mantequillas</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}