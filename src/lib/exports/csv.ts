/**
 * TRACE — CSV export of footprint result (uses selected interpretation when provided)
 */

import type { TraceResult } from "../types";
import type { InterpretationId } from "../interpretations";
import { interpret, getMode } from "../interpretations";
import { format } from "date-fns";

export function resultToCSV(result: TraceResult, interpretationMode?: InterpretationId): string {
  const mode = interpretationMode ?? "kg_co2e";
  const modeLabel = getMode(mode)?.shortLabel ?? mode;

  const totalF = interpret(result.totalKgCo2e, mode);
  const afterF = interpret(result.totalAfterReductions, mode);
  const reductionF = interpret(result.reductionPotentialKgCo2e, mode);

  const rows: string[][] = [
    ["TRACE Export", "Carbon footprint summary"],
    ["Interpretation", modeLabel],
    ["Project", result.projectTitle],
    ["Calculated", format(new Date(result.calculatedAt), "yyyy-MM-dd")],
    ["Total (selected unit)", totalF.formatted],
    ["Total kg CO2e (raw)", String(result.totalKgCo2e)],
    ["After reductions (selected unit)", afterF.formatted],
    ["Reduction potential (selected unit)", reductionF.formatted],
    ["Confidence", result.confidence],
    [],
    ["Category", `Value (${modeLabel})`, "kg CO2e (raw)", "Percentage"],
    ...[...result.categories].sort((a, b) => b.kgCo2e - a.kgCo2e).map((c) => {
      const f = interpret(c.kgCo2e, mode);
      return [c.label, f.formatted, String(c.kgCo2e), String(c.percentage)];
    }),
    [],
    ["Reduction opportunity", "Suggested action", `Potential saving (${modeLabel})`, "kg CO2e (raw)", "Ease"],
    ...[...result.reductionOpportunities].sort((a, b) => b.potentialSavingKgCo2e - a.potentialSavingKgCo2e).map((r) => {
      const f = interpret(r.potentialSavingKgCo2e, mode);
      return [r.title, r.suggestedAction, f.formatted, String(r.potentialSavingKgCo2e), r.ease];
    }),
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadCSV(result: TraceResult, interpretationMode?: InterpretationId, filename?: string): void {
  const csv = resultToCSV(result, interpretationMode);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `trace-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
