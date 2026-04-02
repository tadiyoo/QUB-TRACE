"use client";

import { Calculator, BarChart3, Info } from "lucide-react";
import {
  METHODOLOGY_INTRO,
  METHODOLOGY_SOURCES,
  getCalculatorMethodologyLines,
  TRACE_B_RULES_SUMMARY,
} from "@/lib/methodology";
import type { TraceInputs } from "@/lib/calc";
import {
  INTERPRETATION_METHODOLOGY,
  interpret,
  getMode,
  type InterpretationId,
} from "@/lib/interpretations";
import { cn } from "@/lib/utils";

interface MethodologySectionProps {
  className?: string;
  inputs?: TraceInputs;
  reportTotalKgCo2e?: number;
  interpretationMode?: InterpretationId;
  compact?: boolean;
}

function groupLinesByReportCategory(
  lines: ReturnType<typeof getCalculatorMethodologyLines>
): Map<string, typeof lines> {
  const map = new Map<string, typeof lines>();
  for (const row of lines) {
    const list = map.get(row.reportCategory) ?? [];
    list.push(row);
    map.set(row.reportCategory, list);
  }
  return map;
}

function categorySubtotal(rows: ReturnType<typeof getCalculatorMethodologyLines>): number {
  return rows.reduce((s, r) => s + r.kgCo2e, 0);
}

export default function MethodologySection({
  className,
  inputs,
  reportTotalKgCo2e,
  interpretationMode,
  compact = false,
}: MethodologySectionProps) {
  const mode = interpretationMode ?? "kg_co2e";
  const modeLabel = getMode(mode)?.shortLabel ?? "kg CO₂e";
  const lines = getCalculatorMethodologyLines(inputs);
  const byCategory = groupLinesByReportCategory(lines);
  const categories = Array.from(byCategory.keys()).sort(
    (a, b) => categorySubtotal(byCategory.get(b) ?? []) - categorySubtotal(byCategory.get(a) ?? [])
  );
  const hasInputs = inputs != null;
  const methodologyTotal = lines.reduce((s, r) => s + r.kgCo2e, 0);

  if (compact) {
    return (
      <div className={cn("space-y-4 text-sm", className)}>
        {METHODOLOGY_INTRO ? <p className="text-trace-stone">{METHODOLOGY_INTRO}</p> : null}
        <ul className="list-disc pl-5 space-y-1 text-trace-stone">
          {TRACE_B_RULES_SUMMARY.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="text-xs text-trace-stone">{METHODOLOGY_SOURCES}</p>
        <div>
          <h4 className="font-semibold text-trace-forest mb-2">Interpretation conversions</h4>
          <ul className="space-y-1.5 text-trace-stone">
            {INTERPRETATION_METHODOLOGY.slice(0, 5).map((m) => (
              <li key={m.id}>
                <span className="font-medium text-trace-forest">{m.shortLabel}:</span> {m.formula}
              </li>
            ))}
            <li className="text-xs">And others (see full methodology below).</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div
      id="methodology"
      role="region"
      aria-labelledby="methodology-heading"
      className={cn("max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6", className)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-6 h-6 text-trace-teal" aria-hidden />
        <h2 id="methodology-heading" className="text-xl font-semibold text-trace-forest">
          How we obtained these results
        </h2>
      </div>
      <div className="space-y-6 mt-2">
        <div className="rounded-2xl border border-trace-sand/60 bg-white overflow-hidden shadow-card">
          <div className="px-5 py-3 bg-trace-cream/50 border-b border-trace-sand/60 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-trace-forest/80" />
            <h3 className="text-sm font-semibold text-trace-forest uppercase tracking-wide">
              Calculator steps → kg CO₂e (this report)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            {METHODOLOGY_INTRO ? (
              <p className="text-sm text-trace-stone mb-4">{METHODOLOGY_INTRO}</p>
            ) : null}

            {!hasInputs && (
              <div className="mb-6 rounded-xl border border-trace-sand/50 bg-trace-cream/30 p-4">
                <p className="text-sm font-medium text-trace-forest mb-2">Placeholder rules (summary)</p>
                <ul className="list-disc pl-5 text-sm text-trace-stone space-y-1">
                  {TRACE_B_RULES_SUMMARY.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasInputs && categories.length === 0 && (
              <p className="text-sm text-trace-stone italic">No answered fields yet — totals stay at zero.</p>
            )}

            <div className="space-y-6">
              {categories.map((cat) => {
                const rowsUnsorted = byCategory.get(cat) ?? [];
                const rows = [...rowsUnsorted].sort(
                  (a, b) => b.kgCo2e - a.kgCo2e || a.fieldLabel.localeCompare(b.fieldLabel)
                );
                const subtotal = rows.reduce((sum, row) => sum + row.kgCo2e, 0);
                return (
                  <div key={cat} className="space-y-1">
                    <h4 className="text-xs font-semibold text-trace-forest/90 uppercase tracking-wider mb-2">
                      {cat}
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-trace-sand/50">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-trace-sand/30 border-b border-trace-sand/60">
                            <th className="text-left py-2.5 px-3 text-trace-stone font-medium">Section</th>
                            <th className="text-left py-2.5 px-3 text-trace-stone font-medium">Field</th>
                            <th className="text-left py-2.5 px-3 text-trace-stone font-medium min-w-[8rem]">
                              Your answer
                            </th>
                            <th className="text-left py-2.5 px-2 text-trace-stone font-medium">
                              Illustrative factor
                            </th>
                            <th className="text-right py-2.5 px-3 text-trace-teal font-medium">
                              kg CO₂e ({modeLabel === "kg CO₂e" ? "kg" : "equiv."})
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr
                              key={`${cat}-${row.stepRef}-${row.fieldLabel}-${i}`}
                              className={cn(
                                "border-b border-trace-sand/40 last:border-0",
                                i % 2 === 1 && "bg-trace-cream/20"
                              )}
                            >
                              <td className="py-2 px-3 text-trace-forest/90 text-xs align-top whitespace-nowrap">
                                {row.stepRef}
                              </td>
                              <td className="py-2 px-3 text-trace-forest font-medium align-top">{row.fieldLabel}</td>
                              <td className="py-2 px-3 text-trace-stone text-xs align-top break-words max-w-[14rem]">
                                {row.valueText}
                              </td>
                              <td className="py-2 px-2 text-trace-stone text-[11px] sm:text-xs align-top max-w-[11rem] sm:max-w-xs break-words">
                                {row.factorRule}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-trace-teal tabular-nums align-top">
                                {interpret(row.kgCo2e, mode).formatted}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-trace-sage/15 border-t border-trace-sand/60 font-semibold">
                            <td className="py-2.5 px-3 text-trace-forest" colSpan={4}>
                              Subtotal — {cat}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-trace-teal tabular-nums">
                              {interpret(subtotal, mode).formatted}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasInputs && (
              <div className="mt-6 pt-4 border-t-2 border-trace-teal/40">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-base font-semibold text-trace-forest">Total</p>
                  <p className="text-lg font-mono font-semibold text-trace-teal tabular-nums">
                    {interpret(methodologyTotal, mode).formatted}
                  </p>
                </div>
                {reportTotalKgCo2e != null && (
                  <p className="text-sm text-trace-stone mt-1">
                    Report total: {interpret(reportTotalKgCo2e, mode).formatted}
                    {Math.abs(methodologyTotal - reportTotalKgCo2e) < 0.02 ? " (matches)" : ""}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-trace-sand/60 bg-white overflow-hidden shadow-card">
          <div className="px-5 py-3 bg-trace-cream/50 border-b border-trace-sand/60 flex items-center gap-2">
            <Info className="w-5 h-5 text-trace-forest/80" />
            <h3 className="text-sm font-semibold text-trace-forest uppercase tracking-wide">
              Interpretation units
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm text-trace-stone mb-4">Unit conversions from kg CO₂e.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-trace-sand/60">
                    <th className="text-left py-2 pr-3 text-trace-stone font-medium">Unit</th>
                    <th className="text-left py-2 pr-3 text-trace-stone font-medium">Conversion formula</th>
                    <th className="text-left py-2 text-trace-stone font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERPRETATION_METHODOLOGY.map((m) => (
                    <tr key={m.id} className="border-b border-trace-sand/40 last:border-0">
                      <td className="py-2 pr-3 font-medium text-trace-forest">{m.shortLabel}</td>
                      <td className="py-2 pr-3 font-mono text-trace-teal text-xs">{m.formula}</td>
                      <td className="py-2 text-trace-stone text-xs">{m.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p className="text-xs text-trace-stone italic">{METHODOLOGY_SOURCES}</p>
      </div>
    </div>
  );
}
