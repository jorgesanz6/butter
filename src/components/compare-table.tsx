"use client";

import { OverallScore, ScoreBadge } from "./score-badges";
import { SupermarketBadge } from "./supermarket-badge";

interface CompareButter {
  name: string;
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

interface CompareTableProps {
  butters: CompareButter[];
  onRemove: (index: number) => void;
}

export function CompareTable({ butters, onRemove }: CompareTableProps) {
  if (butters.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        Selecciona mantequillas para comparar
      </div>
    );
  }

  const rows: { label: string; getValue: (b: CompareButter) => React.ReactNode }[] = [
    { label: "Puntuación", getValue: (b) => <OverallScore score={b.overallScore} size="sm" /> },
    { label: "Calidad", getValue: (b) => <ScoreBadge score={b.qualityScore} label="" size="sm" /> },
    { label: "Valor", getValue: (b) => <ScoreBadge score={b.valueScore} label="" size="sm" /> },
    { label: "Nutrición", getValue: (b) => <ScoreBadge score={b.nutritionScore} label="" size="sm" /> },
    { label: "Categoría", getValue: (b) => b.categoryName },
    { label: "Tipo de leche", getValue: (b) => b.milkType ? b.milkType.charAt(0).toUpperCase() + b.milkType.slice(1) : "—" },
    { label: "Ecológica", getValue: (b) => b.isOrganic ? "✓" : "✗" },
    { label: "% Grasa", getValue: (b) => b.fatPercentage !== null ? `${b.fatPercentage}%` : "—" },
    { label: "% Sal", getValue: (b) => b.saltPercentage !== null ? `${b.saltPercentage}%` : "—" },
    { label: "Calorías", getValue: (b) => b.caloriesKcal !== null ? `${b.caloriesKcal} kcal` : "—" },
    { label: "Grasa saturada", getValue: (b) => b.saturatedFatG !== null ? `${b.saturatedFatG}g` : "—" },
    { label: "Sodio", getValue: (b) => b.sodiumMg !== null ? `${b.sodiumMg}mg` : "—" },
    { label: "Peso", getValue: (b) => b.weightG !== null ? `${b.weightG}g` : "—" },
    { label: "Formato", getValue: (b) => b.format || "—" },
    { label: "Ingredientes", getValue: (b) => b.ingredients ? b.ingredients.join(", ") : "—" },
    { label: "Aditivos", getValue: (b) => b.additives && b.additives.length > 0 ? b.additives.join(", ") : "Ninguno" },
    { label: "Disponible en", getValue: (b) => (
      <div className="flex flex-wrap gap-1">
        {b.supermarkets.map((s, i) => (
          <SupermarketBadge key={i} name={s.name} price={s.priceEur} availability={s.availability} />
        ))}
      </div>
    )},
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200">
            <th className="text-left p-3 bg-stone-50 text-stone-500 font-medium sticky left-0 min-w-[140px]">
              Característica
            </th>
            {butters.map((b, i) => (
              <th key={i} className="p-3 bg-stone-50 min-w-[180px]">
                <div className="text-stone-900 font-semibold">{b.name}</div>
                <div className="text-stone-500 text-xs">{b.brandName}</div>
                <button onClick={() => onRemove(i)} className="text-xs text-red-400 hover:text-red-600 mt-1">Quitar</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-stone-100">
              <td className="p-3 text-stone-600 font-medium sticky left-0 bg-white">{row.label}</td>
              {butters.map((b, i) => (
                <td key={i} className="p-3 text-center">{row.getValue(b)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}