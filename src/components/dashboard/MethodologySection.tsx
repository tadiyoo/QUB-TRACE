"use client";

import { Calculator, BarChart3, Info } from "lucide-react";
import {
  EMISSION_FACTORS,
  METHODOLOGY_INTRO,
  METHODOLOGY_SOURCES,
  getInputValue,
  formatInputValue,
  type EmissionFactorRow,
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
  /** When set, emission values are shown in this unit (same as "Show emissions as"). Defaults to kg CO₂e. */
  interpretationMode?: InterpretationId;
  compact?: boolean;
}

function groupByCategory(rows: EmissionFactorRow[]): Map<string, EmissionFactorRow[]> {
  const map = new Map<string, EmissionFactorRow[]>();
  for (const r of rows) {
    const list = map.get(r.category) ?? [];
    list.push(r);
    map.set(r.category, list);
  }
  return map;
}

function formatEmissionInMode(kg: number, mode: InterpretationId): string {
  return interpret(kg, mode).formatted;
}

interface FullBlockProps {
  className?: string;
  inputs?: TraceInputs;
  reportTotalKgCo2e?: number;
  interpretationMode: InterpretationId;
  byCategory: Map<string, EmissionFactorRow[]>;
  categories: string[];
  hasInputs: boolean;
}

function MethodologyFullBlock({
  className,
  inputs,
  reportTotalKgCo2e,
  interpretationMode,
  byCategory,
  categories,
  hasInputs,
}: FullBlockProps) {
  const modeLabel = getMode(interpretationMode)?.shortLabel ?? "kg CO₂e";
  const formatEmission = (kg: number) => formatEmissionInMode(kg, interpretationMode);

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
      <p className="text-base text-trace-stone mb-6">
        {hasInputs
          ? `Below are the emission factors and this report input values. Each row shows the calculation (input × factor = emission). Values are shown in the selected view: ${modeLabel}. Subtotals by category and the total match the report footprint when data is present.`
          : "Below are the emission factors and conversion formulas used to calculate the footprint. When viewing a report with saved data, this section also shows your input values and the calculated emission per row in the unit you select (Show emissions as)."}
      </p>

      <div className="space-y-6">
        <div className="rounded-2xl border border-trace-sand/60 bg-white overflow-hidden shadow-card">
          <div className="px-5 py-3 bg-trace-cream/50 border-b border-trace-sand/60 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-trace-forest/80" />
            <h3 className="text-sm font-semibold text-trace-forest uppercase tracking-wide">
              Emission factors and {hasInputs ? "this report calculation" : "formulas"}
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm text-trace-stone mb-4">{METHODOLOGY_INTRO}</p>
            <div className="space-y-6">
              {categories.map((cat) => {
                const rows = byCategory.get(cat) ?? [];
                const categorySubtotal = rows.reduce((sum, row) => {
                  const val = getInputValue(inputs, row.inputKey);
                  return sum + val * row.factorNum;
                }, 0);
                return (
                  <div key={cat} className="space-y-1">
                    <h4 className="text-xs font-semibold text-trace-forest/90 uppercase tracking-wider mb-2">
                      {cat}
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-trace-sand/50">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-trace-sand/30 border-b border-trace-sand/60">
                            <th className="text-left py-2.5 px-3 text-trace-stone font-medium">Input</th>
                            <th className="text-left py-2.5 px-2 text-trace-stone font-medium">Unit</th>
                            <th className="text-left py-2.5 px-2 text-trace-stone font-medium">Factor</th>
                            <th className="text-left py-2.5 px-2 text-trace-stone font-medium hidden sm:table-cell">Note</th>
                            {hasInputs && (
                              <>
                                <th className="text-right py-2.5 px-3 text-trace-stone font-medium">Your input (this report)</th>
                                <th className="text-right py-2.5 px-3 text-trace-teal font-medium">Emission ({modeLabel})</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => {
                            const value = getInputValue(inputs, row.inputKey);
                            const emission = value * row.factorNum;
                            return (
                              <tr
                                key={i}
                                className={cn("border-b border-trace-sand/40 last:border-0", i % 2 === 1 && "bg-trace-cream/20")}
                              >
                                <td className="py-2 px-3 text-trace-forest font-medium">{row.input}</td>
                                <td className="py-2 px-2 text-trace-stone">{row.unit}</td>
                                <td className="py-2 px-2 font-mono text-trace-teal text-xs">{row.factor}</td>
                                <td className="py-2 px-2 text-trace-stone text-xs hidden sm:table-cell">{row.note ?? "—"}</td>
                                {hasInputs && (
                                  <>
                                    <td className="py-2 px-3 text-right text-trace-forest tabular-nums">{formatInputValue(value, row.unit, row)}</td>
                                    <td className="py-2 px-3 text-right font-mono text-trace-teal tabular-nums">{formatEmission(emission)}</td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                          {hasInputs && (
                            <tr className="bg-trace-sage/15 border-t border-trace-sand/60 font-semibold">
                              <td className="py-2.5 px-3 text-trace-forest" colSpan={4}>Subtotal — {cat}</td>
                              {hasInputs && (
                                <>
                                  <td className="py-2.5 px-3 text-right" />
                                  <td className="py-2.5 px-3 text-right font-mono text-trace-teal tabular-nums">{formatEmission(categorySubtotal)}</td>
                                </>
                              )}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasInputs && (() => {
              const methodologyTotal = categories.reduce((sum, cat) => {
                const rows = byCategory.get(cat) ?? [];
                return sum + rows.reduce((s, row) => s + getInputValue(inputs, row.inputKey) * row.factorNum, 0);
              }, 0);
              return (
              <div className="mt-6 pt-4 border-t-2 border-trace-teal/40">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-base font-semibold text-trace-forest">Total (from methodology above)</p>
                  <p className="text-lg font-mono font-semibold text-trace-teal tabular-nums">
                    {formatEmission(methodologyTotal)}
                  </p>
                </div>
                {reportTotalKgCo2e != null && (
                  <p className="text-sm text-trace-stone mt-1">
                    Report total: {formatEmission(reportTotalKgCo2e)}
                    {Math.abs(methodologyTotal - reportTotalKgCo2e) < 0.01 ? " (matches)" : ""}
                  </p>
                )}
              </div>
              );
            })()}
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
            <p className="text-sm text-trace-stone mb-4">
              The report can display the same footprint in different units (kg CO₂e, tonnes, kWh equivalent, car km, flights, etc.). Each option uses a conversion from kg CO₂e as below.
            </p>
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

export default function MethodologySection({
  className,
  inputs,
  reportTotalKgCo2e,
  interpretationMode,
  compact = false,
}: MethodologySectionProps) {
  const byCategory = groupByCategory(EMISSION_FACTORS);
  const categories = Array.from(byCategory.keys());
  const hasInputs = inputs != null;

  if (compact) {
    return (
      <div className={cn("space-y-4 text-sm", className)}>
        <p className="text-trace-stone">{METHODOLOGY_INTRO}</p>
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
    <MethodologyFullBlock
      className={className}
      inputs={inputs}
      reportTotalKgCo2e={reportTotalKgCo2e}
      interpretationMode={interpretationMode ?? "kg_co2e"}
      byCategory={byCategory}
      categories={categories}
      hasInputs={hasInputs}
    />
  );
}
