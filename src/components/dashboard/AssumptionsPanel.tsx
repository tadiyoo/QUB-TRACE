"use client";

import { FileText, AlertCircle } from "lucide-react";
import type { TraceResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AssumptionsPanelProps {
  result: TraceResult;
  className?: string;
}

export default function AssumptionsPanel({ result, className }: AssumptionsPanelProps) {
  return (
    <section
      id="assumptions"
      className={cn("max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6", className)}
      aria-labelledby="assumptions-heading"
    >
      <h2 id="assumptions-heading" className="text-xl font-semibold text-trace-forest mb-3">
        Assumptions & transparency
      </h2>
      <p className="text-base text-trace-stone mb-5">
        TRACE does not pretend the number is perfectly exact. Below are the main assumptions and
        data quality notes.
      </p>
      <div className="rounded-2xl border border-trace-sand/60 bg-white p-6 shadow-card">
        <blockquote className="text-base text-trace-stone border-l-4 border-trace-mint pl-5 py-2 mb-5">
          {result.uncertaintyNote}
        </blockquote>
        {(result.estimatedInputsCount > 0 || result.optionalInputsCount > 0) && (
          <p className="text-sm text-trace-forest mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {result.estimatedInputsCount} value(s) were estimated; {result.optionalInputsCount}{" "}
            optional input(s) used. Confidence is lower where inputs are missing or estimated.
          </p>
        )}
        <ul className="space-y-2">
          {result.assumptions.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-baseline gap-2 text-sm"
            >
              <span className="font-medium text-trace-forest">{a.label}:</span>
              <span className="text-trace-stone">{a.value}</span>
              {a.source && (
                <span className="text-xs text-trace-stone">({a.source})</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
