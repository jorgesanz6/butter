"use client";

import { getScoreColor, getScoreLabel } from "@/lib/scoring";

interface ScoreBadgeProps {
  score: number | null;
  label: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, label, size = "md" }: ScoreBadgeProps) {
  if (score === null) return null;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 min-w-[28px]",
    md: "text-sm px-2 py-1 min-w-[36px]",
    lg: "text-lg px-3 py-1.5 min-w-[44px]",
  };

  const colorClass = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`font-bold rounded-md bg-stone-100 border border-stone-200 ${sizeClasses[size]} ${colorClass}`}>
        {score.toFixed(1)}
      </span>
      <span className="text-[10px] text-stone-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

interface OverallScoreProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

export function OverallScore({ score, size = "md" }: OverallScoreProps) {
  if (score === null) return null;

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  };

  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClasses[size]} rounded-full border-2 border-amber-300 bg-amber-50 flex items-center justify-center font-bold ${colorClass}`}>
        {score.toFixed(1)}
      </div>
      <span className="text-xs text-stone-500 font-medium">{label}</span>
    </div>
  );
}