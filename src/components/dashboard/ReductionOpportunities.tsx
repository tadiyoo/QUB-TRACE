"use client";

import { ArrowRight } from "lucide-react";
import type { TraceResult } from "@/lib/types";
import type { InterpretationId } from "@/lib/interpretations";
import { interpret } from "@/lib/interpretations";
import { EASE_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ReductionOpportunitiesProps {
  result: TraceResult;
  interpretationMode: InterpretationId;
  className?: string;
}

const easeStyles: Record<string, string> = {
  low: "bg-trace-mint/20 text-trace-sage",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-trace-sand/50 text-trace-stone",
};

export default function ReductionOpportunities({
  result,
  interpretationMode,
  className,
}: ReductionOpportunitiesProps) {
  const sorted = [...result.reductionOpportunities].sort(
    (a, b) => b.potentialSavingKgCo2e - a.potentialSavingKgCo2e
  );

  return (
    <section
      id="reductions"
      className={cn("max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6", className)}
      aria-labelledby="reductions-heading"
    >
      <h2 id="reductions-heading" className="text-xl font-semibold text-trace-forest mb-3">
        Reduction opportunities
      </h2>
      <p className="text-base text-trace-stone mb-5">
        Before offsetting, review the top reduction options. Most of your footprint comes from
        activities that may still be adjustable.
      </p>
      <div className="space-y-4">
        {sorted.map((opp) => {
          const savingF = interpret(opp.potentialSavingKgCo2e, interpretationMode);
          return (
            <div
              key={opp.id}
              className="rounded-2xl border border-trace-sand/60 bg-white p-5 shadow-card hover:shadow-cardHover transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-trace-forest text-base">
                      {opp.title}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        easeStyles[opp.ease] ?? easeStyles.medium
                      )}
                    >
                      {EASE_LABELS[opp.ease] ?? opp.ease}
                    </span>
                  </div>
                  <p className="text-sm text-trace-stone mt-2 flex items-center gap-1">
                    <ArrowRight className="w-4 h-4 shrink-0" />
                    {opp.suggestedAction}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-trace-stone">Potential saving</p>
                  <p className="font-semibold text-trace-teal text-lg">
                    −{savingF.formatted}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {sorted[0] && (
        <div className="mt-6 p-4 rounded-xl bg-trace-sand/30 border border-trace-sand/50 text-base text-trace-forest">
          <strong>Best next step:</strong> {sorted[0].title} (
          {interpret(sorted[0].potentialSavingKgCo2e, interpretationMode).formatted} potential
          saving).
        </div>
      )}
    </section>
  );
}
