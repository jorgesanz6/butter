"use client";

import { useState, useEffect } from "react";
import { OverallScore, ScoreBadge } from "@/components/score-badges";
import { SupermarketBadge } from "@/components/supermarket-badge";
import { CompareTable } from "@/components/compare-table";

interface ButterOption {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  categoryName: string;
  fatPercentage: number | null;
  saltPercentage: number | null;
  milkType: string | null;
  isOrganic: boolean | null;
  isClarified: boolean | null;
  isSpreadable: boolean | null;
  ingredients: string[] | null;
  additives: string[] | null;
  caloriesKcal: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  sodiumMg: number | null;
  weightG: number | null;
  format: string | null;
  qualityScore: number | null;
  valueScore: number | null;
  nutritionScore: number | null;
  overallScore: number | null;
  supermarkets: { name: string; priceEur: number | null; availability: string | null }[];
}

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allButters, setAllButters] = useState<ButterOption[]>([]);
  const [search, setSearch] = useState("");
  const [compareData, setCompareData] = useState<ButterOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/butters")
      .then(r => r.json())
      .then(data => {
        setAllButters(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setCompareData([]);
      return;
    }
    fetch(`/api/butters/compare?ids=${selectedIds.join(",")}`)
      .then(r => r.json())
      .then(setCompareData);
  }, [selectedIds]);

  const filtered = search
    ? allButters.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.brandName.toLowerCase().includes(search.toLowerCase()))
    : allButters;

  const toggleButter = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Comparar mantequillas</h1>
      <p className="text-stone-500 mb-8">Selecciona hasta 4 mantequillas para comparar lado a lado</p>

      {/* Selected butters */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedIds.map(id => {
            const b = allButters.find(b => b.id === id);
            return b ? (
              <span key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-800">
                {b.name}
                <button onClick={() => toggleButter(id)} className="text-amber-400 hover:text-red-500">×</button>
              </span>
            ) : null;
          })}
          {selectedIds.length < 4 && <span className="text-sm text-stone-400 self-center">Puedes añadir {4 - selectedIds.length} más</span>}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar mantequilla por nombre o marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-stone-200 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
        />
      </div>

      {/* Butter selection grid */}
      {!search && selectedIds.length >= 4 ? null : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8 max-h-96 overflow-y-auto">
          {filtered.map(butter => (
            <button
              key={butter.id}
              onClick={() => toggleButter(butter.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                selectedIds.includes(butter.id)
                  ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                  : "border-stone-200 bg-white hover:border-amber-300"
              }`}
            >
              <div className="font-medium text-stone-900 text-sm truncate">{butter.name}</div>
              <div className="text-xs text-stone-500">{butter.brandName}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">{butter.categoryName}</span>
                {butter.overallScore !== null && (
                  <span className="text-xs font-bold text-amber-700">{Number(butter.overallScore).toFixed(1)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Comparison table */}
      {compareData.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <CompareTable
            butters={compareData}
            onRemove={(index) => {
              const id = compareData[index]?.id;
              if (id) toggleButter(id);
            }}
          />
        </div>
      )}
    </div>
  );
}