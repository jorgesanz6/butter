import Link from "next/link";
import { OverallScore, ScoreBadge } from "./score-badges";
import { SupermarketBadge } from "./supermarket-badge";
import { ButterImage } from "./butter-image";

interface ButterCardProps {
  butter: {
    id: string;
    name: string;
    slug: string;
    brandName: string;
    categoryName: string;
    categorySlug?: string;
    fatPercentage: number | null;
    milkType: string | null;
    isOrganic: boolean | null;
    imageUrl?: string | null;
    qualityScore: number | null;
    valueScore: number | null;
    nutritionScore: number | null;
    overallScore: number | null;
    supermarkets: { name: string; priceEur: number | null; availability: string | null }[];
  };
}

export function ButterCard({ butter }: ButterCardProps) {
  return (
    <Link href={`/butters/${butter.slug}`}>
      <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md hover:border-amber-300 transition-all group">
        <div className="flex gap-3">
          <ButterImage name={butter.name} brand={butter.brandName} category={butter.categorySlug} fatPercentage={butter.fatPercentage} isOrganic={butter.isOrganic} imageUrl={butter.imageUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
              {butter.name}
            </h3>
            <p className="text-sm text-stone-500">{butter.brandName}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                {butter.categoryName}
              </span>
              {butter.isOrganic && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                  Ecológica
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <OverallScore score={butter.overallScore} size="sm" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {butter.supermarkets.slice(0, 4).map((s, i) => (
            <SupermarketBadge key={i} name={s.name} price={s.priceEur} availability={s.availability} />
          ))}
          {butter.supermarkets.length > 4 && (
            <span className="text-xs text-stone-400 self-center">
              +{butter.supermarkets.length - 4} más
            </span>
          )}
        </div>

        <div className="mt-2 flex gap-3">
          <ScoreBadge score={butter.qualityScore} label="Calidad" size="sm" />
          <ScoreBadge score={butter.valueScore} label="Valor" size="sm" />
          <ScoreBadge score={butter.nutritionScore} label="Nutrición" size="sm" />
        </div>
      </div>
    </Link>
  );
}