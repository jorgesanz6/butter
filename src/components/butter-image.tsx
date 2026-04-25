import Image from "next/image";

interface ButterImageProps {
  name: string;
  brand?: string;
  category?: string;
  fatPercentage?: number | null;
  isOrganic?: boolean | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const categoryColors: Record<string, string> = {
  "sin-sal": "from-amber-400 to-yellow-300",
  "salada": "from-amber-500 to-amber-300",
  "semisalada": "from-amber-400 to-amber-200",
  "ghee": "from-yellow-500 to-amber-400",
  "untable": "from-yellow-300 to-lime-200",
  "ecologica": "from-green-400 to-emerald-300",
};

const categoryEmoji: Record<string, string> = {
  "sin-sal": "🧈",
  "salada": "🧂",
  "semisalada": "🧈",
  "ghee": "✨",
  "untable": "🍞",
  "ecologica": "🌿",
};

export function ButterImage({ name, brand, category, fatPercentage, isOrganic, imageUrl, size = "md" }: ButterImageProps) {
  const sizeClasses = {
    sm: "w-14 h-14 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-28 h-28 text-4xl",
  };

  const imgSizes = {
    sm: { width: 56, height: 56 },
    md: { width: 80, height: 80 },
    lg: { width: 112, height: 112 },
  };

  const slug = category?.toLowerCase().replace(/mantequilla\s+/g, "").replace(/\s+/g, "-") || "sin-sal";
  const gradientClass = categoryColors[slug] || "from-amber-400 to-yellow-300";
  const emoji = categoryEmoji[slug] || "🧈";

  if (imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl relative overflow-hidden border border-amber-200 shadow-sm bg-white`}>
        <Image
          src={imageUrl}
          alt={name}
          width={imgSizes[size].width}
          height={imgSizes[size].height}
          className="object-contain w-full h-full p-0.5"
          unoptimized
        />
        {isOrganic && (
          <span className="absolute top-0.5 right-0.5 text-[10px]">🌿</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradientClass} border border-amber-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm`}>
      <span className={`${size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-4xl"}`}>{emoji}</span>
      {isOrganic && (
        <span className="absolute top-0.5 right-0.5 text-[10px]">🌿</span>
      )}
      {fatPercentage && (
        <span className={`${size === "sm" ? "text-[8px]" : "text-[10px]"} font-bold text-amber-900/70`}>{fatPercentage}%</span>
      )}
    </div>
  );
}