/**
 * TRACE — JSON export of full result (includes formatted values in selected interpretation)
 */

import type { TraceResult } from "../types";
import type { InterpretationId } from "../interpretations";
import { interpret, getMode } from "../interpretations";
import { format } from "date-fns";

export function resultToJSON(result: TraceResult, interpretationMode?: InterpretationId): string {
  const mode = interpretationMode ?? "kg_co2e";
  const modeLabel = getMode(mode)?.shortLabel ?? mode;

  const totalF = interpret(result.totalKgCo2e, mode);
  const afterF = interpret(result.totalAfterReductions, mode);
  const reductionF = interpret(result.reductionPotentialKgCo2e, mode);

  const categoriesByShare = [...result.categories].sort((a, b) => b.kgCo2e - a.kgCo2e);
  const categoriesWithFormatted = categoriesByShare.map((c) => ({
    ...c,
    formatted: interpret(c.kgCo2e, mode).formatted,
  }));

  const reductionsByImpact = [...result.reductionOpportunities].sort(
    (a, b) => b.potentialSavingKgCo2e - a.potentialSavingKgCo2e
  );
  const reductionOpportunitiesWithFormatted = reductionsByImpact.map((r) => ({
    ...r,
    potentialSavingFormatted: interpret(r.potentialSavingKgCo2e, mode).formatted,
  }));

  return JSON.stringify(
    {
      exportType: "TRACE Carbon Footprint",
      exportedAt: new Date().toISOString(),
      interpretationMode: mode,
      interpretationLabel: modeLabel,
      projectTitle: result.projectTitle,
      calculatedAt: result.calculatedAt,
      totalKgCo2e: result.totalKgCo2e,
      totalFormatted: totalF.formatted,
      totalAfterReductions: result.totalAfterReductions,
      totalAfterReductionsFormatted: afterF.formatted,
      reductionPotentialKgCo2e: result.reductionPotentialKgCo2e,
      reductionPotentialFormatted: reductionF.formatted,
      confidence: result.confidence,
      largestCategory: result.largestCategory,
      categories: categoriesWithFormatted,
      reductionOpportunities: reductionOpportunitiesWithFormatted,
      assumptions: result.assumptions,
      estimatedInputsCount: result.estimatedInputsCount,
      optionalInputsCount: result.optionalInputsCount,
      uncertaintyNote: result.uncertaintyNote,
    },
    null,
    2
  );
}

export function downloadJSON(result: TraceResult, interpretationMode?: InterpretationId, filename?: string): void {
  const json = resultToJSON(result, interpretationMode);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `trace-export-${format(new Date(), "yyyy-MM-dd")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
