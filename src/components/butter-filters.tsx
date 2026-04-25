"use client";

interface ButterFiltersProps {
  supermarkets: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
  milkTypes: string[];
  selectedSupermarket: string;
  selectedCategory: string;
  selectedMilkType: string;
  sortBy: string;
  onSupermarketChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onMilkTypeChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function ButterFilters({
  supermarkets,
  categories,
  milkTypes,
  selectedSupermarket,
  selectedCategory,
  selectedMilkType,
  sortBy,
  onSupermarketChange,
  onCategoryChange,
  onMilkTypeChange,
  onSortChange,
}: ButterFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={selectedSupermarket}
        onChange={(e) => onSupermarketChange(e.target.value)}
        className="text-sm rounded-lg border border-stone-200 px-3 py-2 bg-white text-stone-700 focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
      >
        <option value="">Todos los supermercados</option>
        {supermarkets.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="text-sm rounded-lg border border-stone-200 px-3 py-2 bg-white text-stone-700 focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={selectedMilkType}
        onChange={(e) => onMilkTypeChange(e.target.value)}
        className="text-sm rounded-lg border border-stone-200 px-3 py-2 bg-white text-stone-700 focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
      >
        <option value="">Todo tipo de leche</option>
        {milkTypes.map((m) => (
          <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="text-sm rounded-lg border border-stone-200 px-3 py-2 bg-white text-stone-700 focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
      >
        <option value="overall">Mejor puntuación</option>
        <option value="quality">Mejor calidad</option>
        <option value="value">Mejor valor</option>
        <option value="nutrition">Mejor nutrición</option>
        <option value="price-asc">Precio: menor a mayor</option>
        <option value="price-desc">Precio: mayor a menor</option>
      </select>
    </div>
  );
}