"use client";

import { TrendingDown, Leaf, AlertCircle, Target, Info } from "lucide-react";
import type { TraceResult } from "@/lib/types";
import type { InterpretationId } from "@/lib/interpretations";
import { interpret } from "@/lib/interpretations";
import {
  formatPercentage,
  CONFIDENCE_LABELS,
  getEmissionLevel,
  getEmissionLevelLabel,
  getEmissionLevelDescription,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FootprintOverviewProps {
  result: TraceResult;
  interpretationMode: InterpretationId;
  className?: string;
}

const cardClass =
  "rounded-2xl border border-trace-sand/60 bg-white p-6 shadow-card hover:shadow-cardHover transition-shadow";

export default function FootprintOverview({
  result,
  interpretationMode,
  className,
}: FootprintOverviewProps) {
  const confidenceLabel = CONFIDENCE_LABELS[result.confidence] ?? result.confidence;
  const reductionPct =
    result.totalKgCo2e > 0
      ? Math.round((result.reductionPotentialKgCo2e / result.totalKgCo2e) * 100)
      : 0;

  const totalF = interpret(result.totalKgCo2e, interpretationMode);
  const reductionF = interpret(result.reductionPotentialKgCo2e, interpretationMode);
  const residualF = interpret(result.totalAfterReductions, interpretationMode);
  const emissionLevel = getEmissionLevel(result.totalKgCo2e);
  const levelLabel = getEmissionLevelLabel(emissionLevel);
  const levelDescription = getEmissionLevelDescription();

  return (
    <section
      id="overview"
      className={cn("max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6", className)}
      aria-labelledby="overview-heading"
    >
      <h2 id="overview-heading" className="text-xl font-semibold text-trace-forest mb-6">
        Footprint overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-trace-stone text-sm mb-2">
            <Leaf className="w-5 h-5" />
            Total estimated footprint
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-semibold text-trace-forest">
              {totalF.formatted}
            </p>
            <div className="inline-flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  emissionLevel === "low" && "bg-emerald-100 text-emerald-800",
                  emissionLevel === "medium" && "bg-amber-100 text-amber-800",
                  emissionLevel === "high" && "bg-rose-100 text-rose-800"
                )}
              >
                {levelLabel}
              </span>
              <span
                className="inline-flex text-trace-stone/80 hover:text-trace-forest cursor-help shrink-0"
                title={levelDescription}
                aria-label="How is this level determined?"
              >
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-trace-stone text-sm mb-2">
            <Target className="w-5 h-5" />
            Largest source
          </div>
          <p className="text-xl font-semibold text-trace-forest">
            {result.largestCategory.shortLabel} ({formatPercentage(result.largestCategory.percentage)})
          </p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-trace-stone text-sm mb-2">
            <TrendingDown className="w-5 h-5" />
            Reduction potential
          </div>
          <p className="text-xl font-semibold text-trace-teal">
            −{reductionF.formatted} ({reductionPct}%)
          </p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-trace-stone text-sm mb-2">
            <AlertCircle className="w-5 h-5" />
            Residual after changes
          </div>
          <p className="text-xl font-semibold text-trace-forest">
            {residualF.formatted}
          </p>
          <p className="text-sm text-trace-stone mt-2">Confidence: {confidenceLabel}</p>
        </div>
      </div>
      <div className="mt-6 p-4 rounded-xl bg-trace-sand/30 border border-trace-sand/50 text-base text-trace-forest">
        <strong>{result.largestCategory.shortLabel} accounts for {formatPercentage(result.largestCategory.percentage)} of this project&apos;s footprint.</strong>{" "}
        Review reduction opportunities below to see where changes could have the most impact.
      </div>
    </section>
  );
}
