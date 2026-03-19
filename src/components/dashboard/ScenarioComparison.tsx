"use client";

import type { TraceResult } from "@/lib/types";
import type { InterpretationId } from "@/lib/interpretations";
import { interpret } from "@/lib/interpretations";
import { cn } from "@/lib/utils";

interface ScenarioComparisonProps {
  result: TraceResult;
  interpretationMode: InterpretationId;
  className?: string;
}

export default function ScenarioComparison({
  result,
  interpretationMode,
  className,
}: ScenarioComparisonProps) {
  const current = result.totalKgCo2e;
  const potentialReduction = result.reductionPotentialKgCo2e;
  const residual = result.totalAfterReductions;
  const maxVal = Math.max(current, residual, 1);

  const currentF = interpret(current, interpretationMode);
  const reductionF = interpret(potentialReduction, interpretationMode);
  const residualF = interpret(residual, interpretationMode);

  return (
    <section
      id="scenario"
      className={cn("max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6", className)}
      aria-labelledby="scenario-heading"
    >
      <h2 id="scenario-heading" className="text-xl font-semibold text-trace-forest mb-3">
        Scenario comparison
      </h2>
      <p className="text-base text-trace-stone mb-5">
        Measure → Reduce → Recalculate. Only then consider offsetting the residual.
      </p>
      <div className="rounded-2xl border border-trace-sand/60 bg-white p-8 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="text-sm text-trace-stone mb-2">Current footprint</p>
            <p className="font-semibold text-2xl text-trace-forest">
              {currentF.formatted}
            </p>
            <div className="mt-3 h-3 rounded-full bg-trace-sand/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-trace-forest"
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-trace-stone mb-2">Potential reduction</p>
            <p className="font-semibold text-2xl text-trace-teal">
              {reductionF.formatted}
            </p>
            <div className="mt-3 h-3 rounded-full bg-trace-sand/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-trace-teal"
                style={{
                  width: `${maxVal > 0 ? (potentialReduction / maxVal) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-trace-stone mb-2">Residual (for offset)</p>
            <p className="font-semibold text-2xl text-trace-sage">
              {residualF.formatted}
            </p>
            <div className="mt-3 h-3 rounded-full bg-trace-sand/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-trace-sage"
                style={{
                  width: `${maxVal > 0 ? (residual / maxVal) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-trace-stone italic">
          Offsetting should only be considered for residual emissions that cannot reasonably be
          avoided within the scope of the doctoral project.
        </p>
      </div>
    </section>
  );
}
