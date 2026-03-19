"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Info } from "lucide-react";
import type { InterpretationId } from "@/lib/interpretations";
import { INTERPRETATION_MODES, getMode } from "@/lib/interpretations";
import { cn } from "@/lib/utils";

interface InterpretationSelectorProps {
  value: InterpretationId;
  onChange: (id: InterpretationId) => void;
  className?: string;
}

export default function InterpretationSelector({
  value,
  onChange,
  className,
}: InterpretationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [hoverId, setHoverId] = useState<InterpretationId | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const current = getMode(value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-trace-stone mb-1.5">
        Show emissions as
        <span
          className="inline-flex text-trace-stone/80 hover:text-trace-forest cursor-help"
          title="Choose how to view emissions (e.g. kg CO₂e, kWh, £, car km, flights) so you can relate results to your field."
        >
          <Info className="w-3.5 h-3.5" aria-hidden />
        </span>
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 min-w-[200px] sm:min-w-[240px] px-4 py-2.5 rounded-xl border border-trace-sand/60 bg-white text-trace-forest text-sm font-medium shadow-card hover:shadow-cardHover transition-all"
      >
        <span>{current?.shortLabel ?? value}</span>
        <ChevronDown className={cn("w-4 h-4 text-trace-stone transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 w-full min-w-[280px] max-h-[70vh] overflow-y-auto rounded-xl border border-trace-sand/60 bg-white shadow-card py-1">
          {INTERPRETATION_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                onChange(mode.id);
                setOpen(false);
              }}
              onMouseEnter={() => setHoverId(mode.id)}
              onMouseLeave={() => setHoverId(null)}
              className={cn(
                "w-full text-left px-4 py-2.5 flex flex-col gap-0.5",
                value === mode.id ? "bg-trace-sage/15 text-trace-forest font-medium" : "text-trace-forest hover:bg-trace-sand/30"
              )}
            >
              <span className="text-sm">{mode.shortLabel}</span>
              {(hoverId === mode.id || value === mode.id) && (
                <span className="text-xs text-trace-stone">{mode.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
