import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKgCo2e(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t CO₂e`;
  return `${Math.round(kg)} kg CO₂e`;
}

export function formatPercentage(p: number): string {
  return `${Math.round(p)}%`;
}

export const CONFIDENCE_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const EASE_LABELS: Record<string, string> = {
  low: "Low effort",
  medium: "Medium effort",
  high: "High effort",
};

/** Emission level thresholds (kg CO2e). Used to label report footprint as Low / Medium / High. */
export const EMISSION_LEVEL_THRESHOLDS = {
  /** Below this = Low */
  mediumMin: 1000,
  /** Below this = Medium; at or above = High */
  highMin: 5000,
} as const;

export type EmissionLevel = "low" | "medium" | "high";

export function getEmissionLevel(kgCo2e: number): EmissionLevel {
  if (kgCo2e < EMISSION_LEVEL_THRESHOLDS.mediumMin) return "low";
  if (kgCo2e < EMISSION_LEVEL_THRESHOLDS.highMin) return "medium";
  return "high";
}

export function getEmissionLevelLabel(level: EmissionLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

/** Short description for tooltip / info: how the level is determined. */
export function getEmissionLevelDescription(): string {
  const { mediumMin, highMin } = EMISSION_LEVEL_THRESHOLDS;
  return `Based on total kg CO₂e for this report: Low = under ${mediumMin.toLocaleString()} kg CO₂e; Medium = ${mediumMin.toLocaleString()} to under ${highMin.toLocaleString()} kg CO₂e; High = ${highMin.toLocaleString()} kg CO₂e or more. These bands are for quick comparison and may be adjusted based on your department's TRACE guidance.`;
}
