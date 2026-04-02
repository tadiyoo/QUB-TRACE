"use client";

import { useState } from "react";
import DonutChart from "@/components/charts/DonutChart";
import EmissionsBarChart from "@/components/charts/BarChart";
import type { TraceResult } from "@/lib/types";
import type { InterpretationId } from "@/lib/interpretations";
import { interpret } from "@/lib/interpretations";
import { formatPercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EmissionsBreakdownProps {
  result: TraceResult;
  interpretationMode: InterpretationId;
  className?: string;
}

export default function EmissionsBreakdown({
  result,
  interpretationMode,
  className,
}: EmissionsBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedCategories = [...result.categories].sort((a, b) => b.kgCo2e - a.kgCo2e);

  const donutData = sortedCategories.map((c) => ({
    name: c.shortLabel,
    value: c.kgCo2e,
  }));

  const barData = sortedCategories.map((c) => ({
    name: c.shortLabel,
    value: c.kgCo2e,
  }));

  return (
    <section
      id="breakdown"
      className={cn("max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6", className)}
      aria-labelledby="breakdown-heading"
    >
      <h2 id="breakdown-heading" className="text-xl font-semibold text-trace-forest mb-2">
        Emissions breakdown
      </h2>
      <p className="text-sm text-trace-stone mb-6">
        Categories, chart slices, and bars are sorted by emissions (largest first). Expand a category to
        see each answered field and its illustrative kg CO₂e (fields also sorted by kg).
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-trace-sand/60 bg-white p-6 shadow-card">
          <DonutChart data={donutData} height={300} />
        </div>
        <div className="rounded-2xl border border-trace-sand/60 bg-white p-6 shadow-card">
          <EmissionsBarChart
            data={barData}
            height={300}
            interpretationMode={interpretationMode}
          />
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-trace-sand/60 bg-white overflow-hidden shadow-card">
        <ul className="divide-y divide-trace-sand/40">
          {sortedCategories.map((cat) => {
            const isExpanded = expandedId === cat.id;
            const formatted = interpret(cat.kgCo2e, interpretationMode);
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                  className="w-full px-6 py-4 text-left hover:bg-trace-sand/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex-1 font-medium text-trace-forest text-base">
                      {cat.label}
                    </span>
                    <span className="w-40 text-right text-trace-stone text-sm shrink-0">
                      {formatted.formatted} · {formatPercentage(cat.percentage)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-trace-stone" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-trace-stone" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4 text-sm border-t border-trace-sand/40 pt-3">
                    {cat.breakdown && cat.breakdown.length > 0 ? (
                      <div className="space-y-2">
                        <ul className="space-y-1.5">
                          {[...cat.breakdown]
                            .sort(
                              (a, b) =>
                                b.kgCo2e - a.kgCo2e || a.label.localeCompare(b.label)
                            )
                            .map((item, idx) => {
                            const itemFormatted = interpret(item.kgCo2e, interpretationMode);
                            return (
                              <li
                                key={`${cat.id}-${idx}-${item.label.slice(0, 80)}`}
                                className="flex items-center justify-between gap-4 py-1 text-trace-forest"
                              >
                                <span className="text-trace-stone min-w-0 pr-2">{item.label}</span>
                                <span className="font-medium shrink-0 tabular-nums">
                                  {item.kgCo2e > 0
                                    ? itemFormatted.formatted
                                    : "—"}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-trace-sand/40">
                          <span className="font-semibold text-trace-forest">Total</span>
                          <span className="font-semibold text-trace-forest">
                            {formatted.formatted}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1" />
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-trace-forest">
                            {formatted.formatted}
                          </p>
                          <p className="text-xs text-trace-stone">
                            {formatPercentage(cat.percentage)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
