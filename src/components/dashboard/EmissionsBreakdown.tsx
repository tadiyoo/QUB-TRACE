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

  // Always show categories in descending order by emissions (largest first)
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
      <h2 id="breakdown-heading" className="text-xl font-semibold text-trace-forest mb-6">
        Emissions breakdown
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-trace-sand/60 bg-white p-6 shadow-card">
          <p className="text-sm text-trace-stone mb-3">Share by category</p>
          <DonutChart data={donutData} height={300} />
        </div>
        <div className="rounded-2xl border border-trace-sand/60 bg-white p-6 shadow-card">
          <p className="text-sm text-trace-stone mb-3">By category (in your chosen interpretation)</p>
          <EmissionsBarChart
            data={barData}
            height={300}
            interpretationMode={interpretationMode}
          />
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-trace-sand/60 bg-white overflow-hidden shadow-card">
        <p className="text-sm text-trace-stone px-6 pt-5 pb-2">Expand category details</p>
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
                            .sort((a, b) => b.kgCo2e - a.kgCo2e)
                            .map((item) => {
                            const itemFormatted = interpret(item.kgCo2e, interpretationMode);
                            return (
                              <li
                                key={item.label}
                                className="flex items-center justify-between gap-4 py-1 text-trace-forest"
                              >
                                <span className="text-trace-stone">{item.label}</span>
                                <span className="font-medium shrink-0">{itemFormatted.formatted}</span>
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
                        <p className="text-xs text-trace-stone mt-1">
                          {formatPercentage(cat.percentage)} of total footprint
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <p className="flex-1 text-trace-stone">
                          {cat.description ?? `Emissions from ${cat.label.toLowerCase()}.`}
                        </p>
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
