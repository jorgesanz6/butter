interface SupermarketBadgeProps {
  name: string;
  price?: number | null;
  availability?: string | null;
}

const supermarketColors: Record<string, string> = {
  mercadona: "bg-orange-100 text-orange-800 border-orange-200",
  carrefour: "bg-blue-100 text-blue-800 border-blue-200",
  dia: "bg-red-100 text-red-800 border-red-200",
  lidl: "bg-yellow-100 text-yellow-800 border-yellow-200",
  aldi: "bg-blue-100 text-blue-800 border-blue-200",
  eroski: "bg-green-100 text-green-800 border-green-200",
  consum: "bg-orange-100 text-orange-800 border-orange-200",
  alcampo: "bg-red-100 text-red-800 border-red-200",
  "el-corte-ingles": "bg-purple-100 text-purple-800 border-purple-200",
  hipercor: "bg-purple-100 text-purple-800 border-purple-200",
};

export function SupermarketBadge({ name, price, availability }: SupermarketBadgeProps) {
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const colorClass = supermarketColors[slug] || "bg-stone-100 text-stone-800 border-stone-200";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      <span>{name}</span>
      {price !== null && price !== undefined && (
        <span className="font-bold">{price.toFixed(2)}€</span>
      )}
      {availability === "ocasional" && (
        <span className="text-[10px] opacity-75">(ocasional)</span>
      )}
    </div>
  );
}