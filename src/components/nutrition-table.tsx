interface NutritionTableProps {
  nutrition: {
    caloriesKcal: number | null;
    totalFatG: number | null;
    saturatedFatG: number | null;
    transFatG: number | null;
    cholesterolMg: number | null;
    sodiumMg: number | null;
    proteinG: number | null;
    carbsG: number | null;
  };
}

export function NutritionTable({ nutrition }: NutritionTableProps) {
  const rows = [
    { label: "Calorías", value: nutrition.caloriesKcal, unit: "kcal" },
    { label: "Grasa total", value: nutrition.totalFatG, unit: "g" },
    { label: "Grasa saturada", value: nutrition.saturatedFatG, unit: "g" },
    { label: "Grasa trans", value: nutrition.transFatG, unit: "g" },
    { label: "Colesterol", value: nutrition.cholesterolMg, unit: "mg" },
    { label: "Sodio", value: nutrition.sodiumMg, unit: "mg" },
    { label: "Proteínas", value: nutrition.proteinG, unit: "g" },
    { label: "Carbohidratos", value: nutrition.carbsG, unit: "g" },
  ];

  return (
    <div className="rounded-lg border border-stone-200 overflow-hidden">
      <div className="bg-stone-50 px-4 py-2 border-b border-stone-200">
        <h4 className="text-sm font-semibold text-stone-700">Información nutricional (por 100g)</h4>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-stone-100 last:border-0">
              <td className="px-4 py-2 text-stone-600">{row.label}</td>
              <td className="px-4 py-2 text-right font-medium text-stone-900">
                {row.value !== null ? `${row.value} ${row.unit}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}