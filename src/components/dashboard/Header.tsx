"use client";

import { Calendar } from "lucide-react";
import { format } from "date-fns";
import type { TraceResult } from "@/lib/types";
import type { InterpretationId } from "@/lib/interpretations";
import { cn } from "@/lib/utils";
import InterpretationSelector from "./InterpretationSelector";

interface HeaderProps {
  result: TraceResult;
  interpretationMode: InterpretationId;
  onInterpretationChange: (id: InterpretationId) => void;
  onExportClick?: () => void;
  className?: string;
}

export default function Header({
  result,
  interpretationMode,
  onInterpretationChange,
  onExportClick,
  className,
}: HeaderProps) {
  const dateLabel = format(new Date(result.calculatedAt), "d MMM yyyy");

  return (
    <header
      className={cn(
        "border-b border-trace-sand/60 bg-white/90 backdrop-blur-sm sticky top-0 z-10 no-print",
        className
      )}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-trace-forest">
            TRACE Dashboard
          </h1>
          <p className="text-trace-stone text-base mt-1">{result.projectTitle}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-trace-stone">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Calculated {dateLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <InterpretationSelector
            value={interpretationMode}
            onChange={onInterpretationChange}
          />
          <a
            href="#export"
            onClick={(e) => {
              e.preventDefault();
              onExportClick?.();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage transition-colors shadow-card"
          >
            Export & reports
          </a>
        </div>
      </div>
    </header>
  );
}
