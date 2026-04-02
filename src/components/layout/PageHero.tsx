"use client";

import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeroProps {
  /** Short uppercase line, e.g. "TRACE · Dashboard" */
  kicker: string;
  title: string;
  /** Main blurb — plain text or JSX */
  description?: React.ReactNode;
  /** Icon in the kicker row; defaults to Leaf */
  icon?: React.ReactNode;
  /** Right column: buttons, links */
  actions?: React.ReactNode;
  /** Optional link row under title (e.g. quick links pills) */
  footerLinks?: React.ReactNode;
  /** Stat tiles or extra content below the headline row */
  children?: React.ReactNode;
  className?: string;
  /** Narrow kicker+title column; description beside it with max width; actions stack on lg (home / guide) */
  compactIntro?: boolean;
  /** Extra classes for the actions column (e.g. fixed-width stacked buttons) */
  actionsClassName?: string;
}

/**
 * Shared hero panel: same visual language as the admin console (forest gradient, orbs, kicker pill).
 */
export default function PageHero({
  kicker,
  title,
  description,
  icon,
  actions,
  footerLinks,
  children,
  className,
  compactIntro = false,
  actionsClassName,
}: PageHeroProps) {
  return (
    <div
      className={cn(
        "mb-4 sm:mb-6 w-full rounded-2xl bg-gradient-to-br from-trace-forest via-emerald-900 to-trace-teal text-trace-cream p-4 sm:p-5 md:p-6 shadow-[0_16px_48px_rgba(13,59,44,0.28)] relative overflow-hidden",
        className
      )}
    >
      <div
        className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-trace-mint/15 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-24 h-40 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" aria-hidden />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6 xl:gap-8 min-w-0">
        <div className="flex flex-col gap-3 min-w-0 flex-1 lg:min-w-0">
          {compactIntro ? (
            <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:gap-6 min-w-0">
              <div className="flex flex-col gap-2 shrink-0 lg:max-w-[16.5rem] xl:max-w-[18rem]">
                <div className="inline-flex w-max max-w-full items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-trace-cream/90">
                  <span className="text-trace-mint shrink-0 [&_svg]:w-3 [&_svg]:h-3">
                    {icon ?? <Leaf className="w-3 h-3" />}
                  </span>
                  {kicker}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-trace-cream text-balance">
                  {title}
                </h1>
              </div>
              {description != null && description !== "" && (
                <div className="text-xs sm:text-sm text-trace-cream/85 leading-snug min-w-0 flex-1 max-w-2xl lg:border-l lg:border-white/15 lg:pl-6 space-y-2">
                  {description}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 shrink-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-trace-cream/90">
                  <span className="text-trace-mint shrink-0 [&_svg]:w-3 [&_svg]:h-3">
                    {icon ?? <Leaf className="w-3 h-3" />}
                  </span>
                  {kicker}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-trace-cream">
                  {title}
                </h1>
              </div>
              {description != null && description !== "" && (
                <div className="text-xs sm:text-sm text-trace-cream/85 leading-snug min-w-0 flex-1 lg:border-l lg:border-white/15 lg:pl-6 space-y-2">
                  {description}
                </div>
              )}
            </div>
          )}
          {footerLinks ? (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">{footerLinks}</div>
          ) : null}
        </div>
        {actions ? (
          <div
            className={cn(
              "shrink-0 lg:pt-0.5",
              compactIntro
                ? "flex flex-col gap-2.5 w-full sm:w-auto lg:items-end lg:pt-0"
                : "flex flex-wrap items-center gap-2",
              actionsClassName
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
      {children ? <div className="relative z-10 mt-4 sm:mt-5">{children}</div> : null}
    </div>
  );
}

const statAccent = {
  sky: "from-sky-400/25 to-cyan-600/20",
  amber: "from-amber-400/20 to-orange-500/15",
  emerald: "from-emerald-400/25 to-teal-600/20",
  violet: "from-violet-400/20 to-fuchsia-500/15",
  mint: "from-trace-mint/30 to-teal-500/20",
  cream: "from-white/20 to-white/5",
} as const;

export type PageHeroStatAccent = keyof typeof statAccent;

/** Decorative stat tile (display-only), matches admin StatTile look */
export function PageHeroStat({
  icon,
  label,
  value,
  hint,
  accent = "cream",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  accent?: PageHeroStatAccent;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 py-2.5 px-3 sm:py-3 sm:px-3.5 bg-gradient-to-br shadow-sm",
        statAccent[accent]
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-trace-cream border border-white/10">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-trace-cream/80">
            {label}
          </span>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 leading-tight">
            <span className="text-lg sm:text-xl font-bold tabular-nums text-trace-cream leading-none">{value}</span>
            {hint ? <span className="text-[11px] text-trace-cream/70">· {hint}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageHeroStatGrid({
  children,
  columns = 4,
}: {
  children: React.ReactNode;
  /** Use 3 for dashboard-style rows; 4 matches admin console */
  columns?: 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:gap-3",
        columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      )}
    >
      {children}
    </div>
  );
}
