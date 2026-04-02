import Link from "next/link";
import { ArrowLeft, BookMarked, Download, Leaf } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import {
  GUIDE_PDF_HREF,
  guideSections,
  labConsumableExamples,
  labEquipmentColumns,
} from "@/content/user-guide";

export const metadata = {
  title: "User guide · TRACE",
  description: "How to use the TRACE carbon calculator, procurement codes, and example lab lists.",
};

export default function DocumentationPage() {
  return (
    <div className="min-h-full bg-[#faf6ef] text-trace-forest">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-trace-forest/10 via-trace-teal/5 to-transparent pointer-events-none" aria-hidden />

      <div className="relative w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm font-medium text-trace-teal hover:text-trace-forest mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <PageHero
          className="mb-10 sm:mb-12"
          compactIntro
          kicker="TRACE · User guide"
          title="Using the TRACE carbon calculator"
          icon={<BookMarked className="w-3 h-3" />}
          description={guideSections.intro}
          actionsClassName="[&>*]:inline-flex [&>*]:justify-center [&>:first-child]:whitespace-nowrap [&>:first-child]:w-full [&>:first-child]:sm:w-auto [&>:last-child]:w-full [&>:last-child]:lg:w-[13.75rem]"
          actions={
            <>
              <a
                href={GUIDE_PDF_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="items-center gap-2 rounded-xl bg-white/20 border border-white/35 px-5 py-2.5 text-sm font-semibold text-trace-cream shadow-sm hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4 shrink-0" />
                Download guidance (PDF)
              </a>
              <Link
                href="/app/new-report"
                className="items-center gap-2 rounded-xl border-2 border-white/50 bg-white/10 px-4 py-2.5 text-sm font-semibold text-trace-cream hover:bg-white/20 transition-colors"
              >
                <Leaf className="w-4 h-4 shrink-0 text-trace-mint" />
                Create a report
              </Link>
            </>
          }
        />

        <div className="space-y-6 sm:space-y-8">
          <GuideBlock kicker="01" title={guideSections.navigation.title} lines={guideSections.navigation.body} accent="from-teal-50 to-emerald-50/80" />
          <GuideBlock kicker="02" title={guideSections.input.title} lines={guideSections.input.body} accent="from-amber-50/90 to-lime-50/50" />
          <GuideBlock kicker="03" title={guideSections.limitations.title} lines={guideSections.limitations.body} accent="from-stone-100/90 to-trace-cream/80" />
          <GuideBlock kicker="04" title={guideSections.hpc.title} lines={guideSections.hpc.body} accent="from-cyan-50 to-sky-50/70" />
          <GuideBlock kicker="05" title={guideSections.procurement.title} lines={guideSections.procurement.body} accent="from-trace-mint/30 to-teal-50/60" />
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-trace-forest mb-2 border-l-4 border-trace-teal pl-4">
            Lab consumables — examples by category
          </h2>
          <p className="text-sm text-trace-stone mb-6 max-w-3xl">
            Examples from the TRACE documentation to help you map what you use to the consumable questions. Your own items may vary; use the closest match.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labConsumableExamples.map((col) => (
              <div
                key={col.category}
                className="rounded-2xl border border-trace-sand/70 bg-white/90 p-4 shadow-sm hover:shadow-md hover:border-trace-teal/25 transition-shadow"
              >
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-trace-teal mb-3">{col.category}</h3>
                <ul className="text-sm text-trace-stone space-y-1.5 leading-snug max-h-48 overflow-y-auto pr-1">
                  {col.examples.map((ex) => (
                    <li key={ex} className="flex gap-2">
                      <span className="text-trace-mint shrink-0">·</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-trace-forest mb-2 border-l-4 border-trace-teal pl-4">
            Lab equipment — example themes
          </h2>
          <p className="text-sm text-trace-stone mb-6 max-w-3xl">
            Equipment is grouped in the TRACE calculator (e.g. sterilisation, molecular biology, microscopy). These lists illustrate what typically falls under each theme.
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:thin]">
            {labEquipmentColumns.map((col) => (
              <div
                key={col.title}
                className="snap-start shrink-0 w-[min(100%,280px)] rounded-2xl border-2 border-trace-sand/60 bg-gradient-to-b from-white to-trace-cream/40 p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-trace-forest mb-3 pb-2 border-b border-trace-sand/60">{col.title}</h3>
                <ul className="text-xs text-trace-stone space-y-2 leading-snug">
                  {col.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 rounded-2xl border-2 border-dashed border-trace-teal/30 bg-white/60 p-6 text-center">
          <p className="text-sm text-trace-stone mb-4">
            Prefer a printable document? The official Carbon Footprinting Tool guidance PDF includes additional detail and may be updated by your institution.
          </p>
          <a
            href={GUIDE_PDF_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-trace-teal hover:text-trace-forest underline underline-offset-4"
          >
            <Download className="w-4 h-4" />
            Open guidance PDF
          </a>
        </footer>
      </div>
    </div>
  );
}

function GuideBlock({
  kicker,
  title,
  lines,
  accent,
}: {
  kicker: string;
  title: string;
  lines: string[];
  accent: string;
}) {
  return (
    <article
      className={`rounded-2xl border border-trace-sand/70 bg-gradient-to-br ${accent} p-6 sm:p-7 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trace-forest text-trace-cream text-sm font-bold shadow-md">
          {kicker}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-trace-forest mb-3">{title}</h2>
          <ul className="space-y-2.5 text-sm text-trace-stone leading-relaxed">
            {lines.map((line, i) => (
              <li key={i} className="pl-1">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
