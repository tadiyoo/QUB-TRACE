"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Save, Leaf, Loader2, ChevronRight } from "lucide-react";
import type { TraceResult } from "@/lib/types";
import type { InterpretationId } from "@/lib/interpretations";
import InterpretationSelector from "@/components/dashboard/InterpretationSelector";
import FootprintOverview from "@/components/dashboard/FootprintOverview";
import EmissionsBreakdown from "@/components/dashboard/EmissionsBreakdown";
import ReductionOpportunities from "@/components/dashboard/ReductionOpportunities";
import ScenarioComparison from "@/components/dashboard/ScenarioComparison";
import MethodologySection from "@/components/dashboard/MethodologySection";
import {
  downloadPDFReport,
  downloadSupervisorPDF,
  downloadThesisAppendixPDF,
} from "@/lib/exports/pdf";
import { downloadCSV } from "@/lib/exports/csv";
import { downloadJSON } from "@/lib/exports/json";
import { calculateTraceResult, type TraceInputs } from "@/lib/calc";
import { emptyTeamBInputs, mergeTeamBPartial } from "@/lib/teamB-schema";
import { TeamBReportStep } from "@/components/report-form/TeamBReportSteps";
import PageHero from "@/components/layout/PageHero";

type Step =
  | "intro"
  | "profile"
  | "space"
  | "travel"
  | "digital"
  | "research"
  | "results";

/** Labels + one-line hints for the horizontal step strip and intro cards (keep in sync). */
const WIZARD_TAB_STEPS: { id: Exclude<Step, "intro">; label: string; blurb: string }[] = [
  { id: "profile", label: "Profile", blurb: "Who you are, funding, and how the project is framed." },
  { id: "space", label: "Space", blurb: "Lab, office, and how you use university space." },
  { id: "travel", label: "Travel", blurb: "Commuting and work-related trips." },
  { id: "digital", label: "Digital", blurb: "IT, cloud, AI, and high performance computing." },
  { id: "research", label: "Research", blurb: "Equipment, consumables, fieldwork, animals, other materials." },
  { id: "results", label: "Results", blurb: "Totals, breakdown, downloads, and submit." },
];

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("intro");
  const initialReportId = searchParams.get("reportId");
  const [reportId, setReportId] = useState<string | null>(initialReportId);
  const isEditingFromDashboard = !!initialReportId;
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamB, setTeamB] = useState(emptyTeamBInputs);

  const saveDraft = async (nextStep?: Step, finalSubmit = false) => {
    if (!title) {
      setError("Please give your report a title before continuing.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title,
        data: { teamB } satisfies TraceInputs,
      };
      let res;
      if (!reportId) {
        res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/reports/${reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            data: payload.data,
            status: finalSubmit ? "submitted" : "draft",
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save report");
        return;
      }
      if (!reportId) {
        setReportId(data.report.id);
      }
      const targetId = reportId || data.report?.id;
      if (finalSubmit && targetId) {
        router.push(`/app/report/${targetId}`);
        return;
      }
      if (nextStep) setStep(nextStep);
    } catch (e) {
      setError("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  const disabled = saving;

  useEffect(() => {
    if (!isEditingFromDashboard || !reportId) return;
    (async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) return;
        const data = await res.json();
        const r = data.report;
        if (!r) return;
        if (r.title) setTitle(r.title);
        if (r.dataJson) {
          try {
            const parsed = JSON.parse(r.dataJson) as { teamB?: unknown };
            setTeamB(mergeTeamBPartial(parsed.teamB));
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [isEditingFromDashboard, reportId]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <PageHero
        kicker="TRACE · Carbon calculator"
        title="Carbon footprint calculator"
        description="Using the TRACE carbon calculator — save as you go."
        icon={<Leaf className="w-3 h-3" />}
        actions={
          <>
            <Link
              href="/app/documentation"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/15 px-3 py-2 text-[11px] sm:text-xs font-semibold text-trace-cream hover:bg-white/25 shrink-0"
            >
              User guide
            </Link>
            {isEditingFromDashboard ? (
              <button
                type="button"
                onClick={() => router.push("/app/dashboard")}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/40 bg-white/10 text-[11px] font-semibold text-trace-cream hover:bg-white/20"
              >
                Cancel editing & return to dashboard
              </button>
            ) : null}
          </>
        }
      />

      <div className="mb-6 rounded-2xl border-2 border-trace-sand/50 bg-gradient-to-r from-white via-trace-cream/30 to-trace-mint/15 shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6">
          <label
            htmlFor="title"
            className="shrink-0 text-base sm:text-lg font-semibold text-trace-forest flex items-center gap-3 sm:w-52"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-trace-teal/25 to-trace-mint/40 text-trace-teal border border-trace-teal/20 shadow-sm">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-trace-stone/60">
                Required
              </span>
              <span>Report title</span>
            </span>
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. PhD project 2024–2025, Lab A annual footprint…"
            className="flex-1 min-w-0 rounded-2xl border-2 border-trace-sand/55 bg-white/90 px-4 py-3.5 text-base sm:text-lg font-medium text-trace-forest placeholder:text-trace-stone/45 outline-none focus:border-trace-teal focus:ring-2 focus:ring-trace-teal/20 shadow-inner transition-shadow"
          />
        </div>
      </div>

      <StepTabs step={step} />

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-4 rounded-2xl border-2 border-trace-sand/55 bg-gradient-to-br from-white via-trace-cream/15 to-white p-5 sm:p-6 shadow-card">
        {step === "intro" && (
          <IntroStep onNext={() => saveDraft("profile")} disabled={disabled} />
        )}
        {step === "profile" && (
          <div className="space-y-6">
            <TeamBReportStep step="profile" teamB={teamB} setTeamB={setTeamB} />
            <WizardNav
              onBack={() => setStep("intro")}
              onNext={() => saveDraft("space")}
              disabled={disabled}
            />
          </div>
        )}
        {step === "space" && (
          <div className="space-y-6">
            <TeamBReportStep step="space" teamB={teamB} setTeamB={setTeamB} />
            <WizardNav
              onBack={() => setStep("profile")}
              onNext={() => saveDraft("travel")}
              disabled={disabled}
            />
          </div>
        )}
        {step === "travel" && (
          <div className="space-y-6">
            <TeamBReportStep step="travel" teamB={teamB} setTeamB={setTeamB} />
            <WizardNav
              onBack={() => setStep("space")}
              onNext={() => saveDraft("digital")}
              disabled={disabled}
            />
          </div>
        )}
        {step === "digital" && (
          <div className="space-y-6">
            <TeamBReportStep step="digital" teamB={teamB} setTeamB={setTeamB} />
            <WizardNav
              onBack={() => setStep("travel")}
              onNext={() => saveDraft("research")}
              disabled={disabled}
            />
          </div>
        )}
        {step === "research" && (
          <div className="space-y-6">
            <TeamBReportStep step="research" teamB={teamB} setTeamB={setTeamB} />
            <WizardNav
              onBack={() => setStep("digital")}
              onNext={() => saveDraft("results")}
              disabled={disabled}
            />
          </div>
        )}
        {step === "results" && (
          <ResultsStep
            reportTitle={title}
            reportId={reportId}
            isEditing={isEditingFromDashboard}
            onBack={() => setStep("research")}
            onSubmitFinal={() => saveDraft(undefined, true)}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

function WizardNav({
  onBack,
  onNext,
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-between gap-3 pt-4 border-t-2 border-trace-sand/40">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-trace-teal/40 bg-white text-trace-forest text-sm font-semibold hover:bg-trace-mint/25 hover:border-trace-teal/60 shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-trace-forest to-emerald-900 text-trace-cream text-sm font-semibold shadow-md shadow-trace-forest/20 hover:from-trace-sage hover:to-emerald-800 disabled:opacity-60 transition-all"
      >
        <ArrowRight className="w-4 h-4" />
        Save &amp; Continue
      </button>
    </div>
  );
}

function StepTabs({ step }: { step: Step }) {
  const stepOrder: Step[] = [
    "intro",
    "profile",
    "space",
    "travel",
    "digital",
    "research",
    "results",
  ];
  const currentIndex = stepOrder.indexOf(step);

  return (
    <div className="mb-6 w-full">
      <div className="rounded-2xl border border-trace-sand/60 bg-white shadow-card overflow-hidden w-full">
        <div className="w-full px-2 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-trace-cream/90 via-white to-trace-mint/25 border-b border-trace-sand/40">
          <div className="w-full overflow-x-auto pb-1">
            <div className="grid grid-cols-6 gap-0 min-w-[36rem] sm:min-w-[42rem]">
              {WIZARD_TAB_STEPS.map((s, index) => {
                const isActive = step === s.id;
                const isPast = stepOrder.indexOf(s.id) < currentIndex;
                const stepNum = index + 1;
                const isLast = index === WIZARD_TAB_STEPS.length - 1;
                return (
                  <div key={s.id} className="flex items-center min-w-0 col-span-1">
                    <div
                      className={`relative flex flex-1 min-w-0 items-center justify-center gap-2 py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl select-none pointer-events-none transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-trace-forest via-trace-forest to-emerald-900/90 text-trace-cream shadow-lg shadow-trace-forest/35 scale-[1.02] z-10 ring-2 ring-trace-teal/60"
                          : isPast
                            ? "bg-gradient-to-br from-trace-teal/20 to-trace-mint/30 text-trace-forest border-2 border-trace-teal/35"
                            : "bg-white/90 text-trace-stone/55 border-2 border-trace-sand/45"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full text-[10px] sm:text-xs font-bold tabular-nums ${
                          isActive
                            ? "bg-trace-cream/25 text-trace-cream border border-trace-cream/40"
                            : isPast
                              ? "bg-trace-teal text-white border border-trace-teal"
                              : "bg-trace-sand/60 text-trace-stone/80 border border-trace-sand"
                        }`}
                      >
                        {stepNum}
                      </span>
                      <span className="font-semibold text-[11px] sm:text-sm truncate text-center">
                        {s.label}
                      </span>
                    </div>
                    {!isLast && (
                      <ChevronRight
                        className={`shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 self-center mx-0.5 ${
                          isPast ? "text-trace-teal" : "text-trace-forest/55"
                        }`}
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntroStep({ onNext, disabled }: { onNext: () => void; disabled: boolean }) {
  return (
    <div className="space-y-6 text-sm text-trace-stone">
      <div className="relative overflow-hidden rounded-2xl border-2 border-trace-sand/50 bg-gradient-to-br from-white via-trace-cream/40 to-trace-mint/20 p-5 sm:p-6 shadow-sm">
        <div className="absolute -right-6 top-0 h-28 w-28 rounded-full bg-trace-teal/15 blur-2xl" aria-hidden />
        <h2 className="relative text-lg sm:text-xl font-semibold text-trace-forest border-l-[3px] border-trace-teal pl-3">
          Get started
        </h2>
        <p className="relative mt-3 text-sm text-trace-stone leading-relaxed max-w-3xl">
          Work through the tabs above in order. Below is what each section covers—open{" "}
          <strong className="text-trace-forest">Save &amp; Continue</strong> when you are ready to enter your first answers
          on <strong className="text-trace-forest">Profile</strong>.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {WIZARD_TAB_STEPS.map((s, i) => (
          <div
            key={s.id}
            className="rounded-2xl border-2 border-trace-sand/45 bg-gradient-to-br from-white to-trace-cream/25 p-4 shadow-sm hover:border-trace-teal/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-trace-teal/20 to-trace-mint/40 text-xs font-bold text-trace-forest border border-trace-teal/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-trace-forest/80">{s.label}</p>
                <p className="mt-1.5 text-sm text-trace-stone leading-snug">{s.blurb}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-trace-forest to-emerald-900 text-trace-cream text-sm font-semibold shadow-lg shadow-trace-forest/25 hover:from-trace-sage hover:to-emerald-800 disabled:opacity-60 transition-all"
      >
        <ArrowRight className="w-4 h-4" />
        Save &amp; Continue
      </button>
    </div>
  );
}

function ResultsStep({
  reportTitle,
  reportId,
  isEditing,
  onBack,
  onSubmitFinal,
  disabled,
}: {
  reportTitle: string;
  reportId: string | null;
  isEditing: boolean;
  onBack: () => void;
  onSubmitFinal: () => void;
  disabled: boolean;
}) {
  const [mode, setMode] = useState<InterpretationId>("kg_co2e");
  const [exportType, setExportType] = useState<
    "pdf_report" | "pdf_supervisor" | "pdf_thesis" | "csv" | "json"
  >("pdf_report");
  const [exporting, setExporting] = useState(false);
  const [previewResult, setPreviewResult] = useState<TraceResult | null>(null);
  const [previewInputs, setPreviewInputs] = useState<TraceInputs | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load the calculated result for this draft from the API / DB
  useEffect(() => {
    if (!reportId) {
      setPreviewResult(null);
      setPreviewInputs(undefined);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) {
          throw new Error("Failed to load report preview");
        }
        const data = await res.json();
        const r = data.report;
        if (!r || cancelled) return;

        let inputs: TraceInputs | undefined;
        try {
          inputs = JSON.parse(r.dataJson || "{}") as TraceInputs;
        } catch {
          inputs = undefined;
        }

        if (inputs) {
          setPreviewInputs(inputs);
          setPreviewResult(
            calculateTraceResult(
              r.title || reportTitle || "Untitled report",
              inputs,
              new Date(r.updatedAt)
            )
          );
          return;
        }

        if (r.resultJson) {
          setPreviewInputs(undefined);
          setPreviewResult(JSON.parse(r.resultJson) as TraceResult);
          return;
        }

        const fallback: TraceResult = {
          projectTitle: r.title || reportTitle || "Untitled report",
          calculatedAt: r.updatedAt,
          totalKgCo2e: r.totalKgCo2e ?? 0,
          totalAfterReductions: r.totalKgCo2e ?? 0,
          reductionPotentialKgCo2e: 0,
          confidence: "medium",
          largestCategory: {
            id: "wizard_travel",
            label: "Travel — commute, field days & conferences (T1–T3)",
            shortLabel: "Travel",
            kgCo2e: r.totalKgCo2e ?? 0,
            percentage: 100,
          },
          categories: [],
          reductionOpportunities: [],
          assumptions: [],
          estimatedInputsCount: 0,
          optionalInputsCount: 0,
          uncertaintyNote:
            "No saved TRACE calculator data found for this draft. Save the report from the editor to store TRACE B answers.",
        };
        setPreviewInputs(undefined);
        setPreviewResult(fallback);
      } catch (e) {
        if (!cancelled) {
          setLoadError("Could not load preview for this report yet. Try saving again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [reportId, reportTitle]);

  const handleExport = async () => {
    if (!previewResult || exporting) return;
    if (exporting) return;
    setExporting(true);
    try {
      switch (exportType) {
        case "pdf_report":
          await downloadPDFReport(previewResult, mode);
          break;
        case "pdf_supervisor":
          await downloadSupervisorPDF(previewResult, mode);
          break;
        case "pdf_thesis":
          await downloadThesisAppendixPDF(previewResult, mode);
          break;
        case "csv":
          downloadCSV(previewResult, mode);
          break;
        case "json":
          downloadJSON(previewResult, mode);
          break;
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4 text-sm text-trace-stone">
      <h2 className="text-lg font-semibold text-trace-forest border-l-4 border-trace-teal pl-3">
        Results
      </h2>
      {!reportId && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Save the report once to load the preview below.
        </p>
      )}

      {loadError && (
        <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {loadError}
        </p>
      )}

      {previewResult && (
        <>
          <div className="mt-4 rounded-2xl bg-white/80 border border-trace-sand/60 px-3 sm:px-4 py-3 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                <span className="font-medium text-trace-stone">Export as</span>
                <select
                  value={exportType}
                  onChange={(e) =>
                    setExportType(e.target.value as
                      | "pdf_report"
                      | "pdf_supervisor"
                      | "pdf_thesis"
                      | "csv"
                      | "json")
                  }
                  className="rounded-xl border border-trace-sand/70 bg-white px-2.5 py-1.5 text-[11px] sm:text-xs text-trace-forest outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                >
                  <option value="pdf_report">Full PDF report</option>
                  <option value="pdf_supervisor">Supervisor one-pager</option>
                  <option value="pdf_thesis">Thesis appendix (PDF)</option>
                  <option value="csv">CSV (data)</option>
                  <option value="json">JSON (data)</option>
                </select>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-trace-forest text-trace-cream px-3 py-1.5 text-[11px] font-medium hover:bg-trace-sage disabled:opacity-60"
                >
                  {exporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Export</span>
                  )}
                </button>
              </div>
              <div className="flex-1 flex justify-end">
                <InterpretationSelector value={mode} onChange={setMode} />
              </div>
            </div>
          </div>

          <div className="border border-trace-sand/60 rounded-2xl bg-white">
            <FootprintOverview result={previewResult} interpretationMode={mode} className="py-6" />
            <EmissionsBreakdown result={previewResult} interpretationMode={mode} className="pt-0" />
            <ReductionOpportunities
              result={previewResult}
              interpretationMode={mode}
              className="pt-0"
            />
            <ScenarioComparison result={previewResult} interpretationMode={mode} className="pt-0" />
            <MethodologySection
              className="pt-0"
              inputs={previewInputs}
              reportTotalKgCo2e={previewResult?.totalKgCo2e}
              interpretationMode={mode}
            />
          </div>
        </>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-trace-stone">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading preview…</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-trace-teal/50 bg-trace-mint/30 text-trace-forest text-sm font-medium hover:bg-trace-mint/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmitFinal}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isEditing ? "Save & update report" : "Submit report"}
        </button>
      </div>
    </div>
  );
}
