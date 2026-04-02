/**
 * TRACE Dashboard — Type definitions
 * Aligns with outputs from Teams A, B, C.
 */

export type ConfidenceLevel = "low" | "medium" | "high";

export type EaseLevel = "low" | "medium" | "high";

/** Matches create-report wizard tabs (Profile → Space → Travel → Digital → Research) */
export type EmissionCategoryId =
  | "wizard_profile"
  | "wizard_space"
  | "wizard_travel"
  | "wizard_digital"
  | "wizard_research";

/** Fixed UI order for breakdown lists and charts (not sorted by kg) */
export const WIZARD_STEP_ORDER: readonly EmissionCategoryId[] = [
  "wizard_profile",
  "wizard_space",
  "wizard_travel",
  "wizard_digital",
  "wizard_research",
] as const;

export interface CategoryBreakdownItem {
  label: string;
  kgCo2e: number;
}

export interface EmissionCategory {
  id: EmissionCategoryId;
  label: string;
  shortLabel: string;
  kgCo2e: number;
  percentage: number;
  description?: string;
  /** Per field line items (same labels as the TRACE calculator form) */
  breakdown?: CategoryBreakdownItem[];
}

export interface ReductionOpportunity {
  id: string;
  categoryId: EmissionCategoryId;
  title: string;
  currentEmissions: number;
  suggestedAction: string;
  potentialSavingKgCo2e: number;
  ease: EaseLevel;
  priority: number;
}

export interface Assumption {
  id: string;
  label: string;
  value: string;
  source?: string;
}

export interface TraceResult {
  projectTitle: string;
  calculatedAt: string; // ISO date
  totalKgCo2e: number;
  totalAfterReductions: number;
  reductionPotentialKgCo2e: number;
  confidence: ConfidenceLevel;
  largestCategory: EmissionCategory;
  categories: EmissionCategory[];
  reductionOpportunities: ReductionOpportunity[];
  assumptions: Assumption[];
  estimatedInputsCount: number;
  optionalInputsCount: number;
  uncertaintyNote: string;
}

export interface ExportPayload {
  result: TraceResult;
  format: "pdf_report" | "pdf_supervisor" | "pdf_thesis" | "csv" | "json";
}
