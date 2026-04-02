"use client";

import { cn } from "@/lib/utils";

export const OPT_YES_NO = ["", "Yes", "No"];
export const OPT_YES_NO_NA = ["", "Yes", "No", "N/A", "Not applicable"];
export const OPT_YES_NO_NOTSURE = ["", "Yes", "No", "Not sure"];

/** Visual theme for expandable module headers (gradient bands). */
export type ExpandableModuleTone = "emerald" | "amber" | "rose" | "slate" | "cyan" | "mint";

const MODULE_HEADER: Record<
  ExpandableModuleTone,
  { bar: string; switchOn: string }
> = {
  emerald: {
    bar: "bg-gradient-to-r from-emerald-200/95 via-teal-100/90 to-cyan-100/70",
    switchOn: "shadow-emerald-300/50 ring-2 ring-emerald-400/40",
  },
  amber: {
    bar: "bg-gradient-to-r from-amber-200/90 via-lime-100/85 to-yellow-50/80",
    switchOn: "shadow-amber-300/45 ring-2 ring-amber-400/35",
  },
  rose: {
    bar: "bg-gradient-to-r from-rose-200/90 via-orange-100/80 to-amber-100/70",
    switchOn: "shadow-rose-300/45 ring-2 ring-rose-400/35",
  },
  slate: {
    bar: "bg-gradient-to-r from-slate-200/85 via-stone-100/90 to-amber-50/75",
    switchOn: "shadow-slate-400/30 ring-2 ring-slate-400/30",
  },
  cyan: {
    bar: "bg-gradient-to-r from-cyan-200/85 via-sky-100/90 to-indigo-100/60",
    switchOn: "shadow-cyan-300/50 ring-2 ring-cyan-400/40",
  },
  mint: {
    bar: "bg-gradient-to-r from-trace-mint/70 via-emerald-100/80 to-teal-100/75",
    switchOn: "shadow-teal-300/50 ring-2 ring-trace-teal/45",
  },
};

function FieldShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-trace-sand/55 bg-gradient-to-br from-white via-white to-trace-mint/[0.06] p-3.5 sm:p-4 shadow-sm shadow-trace-forest/[0.04] transition-all duration-200",
        "hover:border-trace-teal/30 hover:shadow-md hover:shadow-trace-teal/[0.08]",
        "focus-within:border-trace-teal/45 focus-within:ring-2 focus-within:ring-trace-teal/15 focus-within:shadow-md",
        className
      )}
    >
      <div
        className="pointer-events-none absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-gradient-to-b from-trace-teal via-trace-forest/50 to-trace-mint opacity-80 group-focus-within:opacity-100"
        aria-hidden
      />
      <div className="relative pl-2.5">{children}</div>
    </div>
  );
}

export function FieldSelect({
  label,
  hint,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <FieldShell className={className}>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-trace-forest/80 mb-1">
        {label}
      </label>
      {hint && <p className="text-[11px] text-trace-stone leading-snug mb-2">{hint}</p>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-xl border-2 border-trace-sand/50 bg-white/95 px-3.5 py-2.5 pr-10 text-sm font-medium text-trace-forest",
            "outline-none transition-colors cursor-pointer",
            "hover:border-trace-teal/40 hover:bg-trace-cream/20",
            "focus:border-trace-teal focus:bg-white"
          )}
        >
          {options.map((o) => (
            <option key={o || "__empty"} value={o}>
              {o === "" ? "— Select —" : o}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-trace-forest/40 text-[10px]"
          aria-hidden
        >
          ▼
        </span>
      </div>
    </FieldShell>
  );
}

export function FieldText({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  const cls = cn(
    "w-full rounded-xl border-2 border-trace-sand/50 bg-white/95 px-3.5 py-2.5 text-sm font-medium text-trace-forest",
    "placeholder:text-trace-stone/45 placeholder:font-normal",
    "outline-none transition-colors",
    "hover:border-trace-teal/35 hover:bg-trace-cream/15",
    "focus:border-trace-teal focus:bg-white focus:ring-0"
  );
  return (
    <FieldShell className={className}>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-trace-forest/80 mb-1">
        {label}
      </label>
      {hint && <p className="text-[11px] text-trace-stone leading-snug mb-2">{hint}</p>}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(cls, "min-h-[5.5rem] resize-y")}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </FieldShell>
  );
}

export function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-trace-sand/50 bg-gradient-to-br from-white via-trace-cream/30 to-trace-mint/25 p-4 sm:p-5 mb-5 shadow-sm shadow-trace-forest/5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-trace-teal/10 blur-2xl" aria-hidden />
      <div className="absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-trace-mint/30 blur-xl" aria-hidden />
      <div className="relative space-y-2">
        {kicker && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-trace-teal">
            {kicker}
          </p>
        )}
        <h2 className="text-lg sm:text-xl font-semibold text-trace-forest border-l-[3px] border-trace-teal pl-3 leading-snug">
          {title}
        </h2>
        {description && <p className="text-sm text-trace-stone leading-relaxed pl-4 max-w-3xl">{description}</p>}
      </div>
    </div>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-trace-forest/85 bg-gradient-to-r from-trace-cream/95 to-trace-mint/25 border border-trace-sand/65 rounded-full inline-flex px-3.5 py-1.5 mt-6 mb-3 shadow-sm">
      {children}
    </h3>
  );
}

/**
 * Switch in the same row as the title; fields expand directly underneath — one place only.
 */
export function ExpandableModule({
  id,
  title,
  description,
  enabled,
  onEnabledChange,
  tone = "mint",
  children,
}: {
  id: string;
  title: string;
  description?: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  tone?: ExpandableModuleTone;
  children: React.ReactNode;
}) {
  const th = MODULE_HEADER[tone];
  return (
    <div
      className={cn(
        "rounded-2xl border-2 overflow-hidden shadow-md shadow-trace-forest/[0.06] transition-shadow duration-300",
        enabled
          ? "border-trace-teal/35 shadow-lg shadow-trace-teal/10"
          : "border-trace-sand/60 bg-white"
      )}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-white/40",
          th.bar
        )}
      >
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm sm:text-base font-semibold text-trace-forest tracking-tight drop-shadow-sm">
            {title}
          </p>
          {description && (
            <p className="text-xs text-trace-forest/75 leading-snug max-w-prose">{description}</p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-controls={`${id}-panel`}
          aria-checked={enabled}
          id={id}
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative shrink-0 inline-flex h-10 w-[3.5rem] items-center rounded-full border-2 border-white/60 bg-white/90 backdrop-blur-sm transition-all duration-300",
            enabled
              ? cn("border-white/80 bg-trace-forest/95", th.switchOn, "shadow-lg")
              : "shadow-inner"
          )}
        >
          <span
            className={cn(
              "inline-block h-7 w-7 transform rounded-full bg-gradient-to-br from-white to-trace-cream shadow-md border border-white/80 transition-transform duration-300 ease-out",
              enabled ? "translate-x-[1.35rem]" : "translate-x-1"
            )}
          />
          <span className="sr-only">{enabled ? "On" : "Off"}</span>
        </button>
      </div>
      <div id={`${id}-panel`} role="region" aria-labelledby={id}>
        {enabled ? (
          <div className="px-4 py-5 sm:px-5 sm:py-6 bg-gradient-to-b from-white to-trace-cream/20 space-y-4 border-t border-trace-sand/30">
            {children}
          </div>
        ) : (
          <p className="px-4 py-3.5 sm:px-5 text-sm text-trace-stone/90 bg-trace-cream/15 border-t border-trace-sand/25 italic">
            Switch on to show the fields for this section.
          </p>
        )}
      </div>
    </div>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">{children}</div>;
}
