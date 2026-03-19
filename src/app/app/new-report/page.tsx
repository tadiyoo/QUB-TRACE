"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info, ArrowRight, ArrowLeft, Save, Leaf, Loader2, ChevronRight } from "lucide-react";
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
import { getCategoryBreakdowns, type TraceInputs } from "@/lib/calc";

type Step = "intro" | "utilities" | "travel" | "waste" | "procurement" | "results";

interface GeneralData {
  personnelFteOnProject: string;
  personnelGroupSize: string;
  // energy
  labAcademic: string;
  officeAdmin: string;
  officeAcademic: string;
  // water
  labPhysical: string;
  labEngineering: string;
  labMedical: string;
  officeWater: string;
  // computing / IT
  cloudComputeHours: string;
  cloudStorageGbMonths: string;
  onPremComputeHours: string;
  onPremStorageTbMonths: string;
  // printing / admin
  pagesPrinted: string;
  adminHoursPerWeek: string;
}

interface TravelData {
  // air
  shortHaulEcoUk: string;
  shortHaulBizUk: string;
  longHaulEcoUk: string;
  longHaulBizUk: string;
  ecoIntlNonUk: string;
  bizIntlNonUk: string;
  // sea
  ferry: string;
  // land
  car: string;
  motorbike: string;
  taxis: string;
  localBus: string;
  coach: string;
  nationalRail: string;
  internationalRail: string;
  tram: string;
}

interface WasteData {
  mixedRecycling: string;
  weeeRecycling: string;
  generalWaste: string;
  clinicalWaste: string;
  chemicalWaste: string;
  biologicalWaste: string;
}

interface ProcurementItem {
  id: string;
  category: string;
  description: string;
  amount: string;
  currency: string;
}

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

  const [general, setGeneral] = useState<GeneralData>({
    personnelFteOnProject: "",
    personnelGroupSize: "",
    labAcademic: "",
    officeAdmin: "",
    officeAcademic: "",
    labPhysical: "",
    labEngineering: "",
    labMedical: "",
    officeWater: "",
    cloudComputeHours: "",
    cloudStorageGbMonths: "",
    onPremComputeHours: "",
    onPremStorageTbMonths: "",
    pagesPrinted: "",
    adminHoursPerWeek: "",
  });
  const [travel, setTravel] = useState<TravelData>({
    shortHaulEcoUk: "",
    shortHaulBizUk: "",
    longHaulEcoUk: "",
    longHaulBizUk: "",
    ecoIntlNonUk: "",
    bizIntlNonUk: "",
    ferry: "",
    car: "",
    motorbike: "",
    taxis: "",
    localBus: "",
    coach: "",
    nationalRail: "",
    internationalRail: "",
    tram: "",
  });
  const [waste, setWaste] = useState<WasteData>({
    mixedRecycling: "",
    weeeRecycling: "",
    generalWaste: "",
    clinicalWaste: "",
    chemicalWaste: "",
    biologicalWaste: "",
  });
  const [procurement, setProcurement] = useState<ProcurementItem[]>([]);

  const updateProcItem = (id: string, patch: Partial<ProcurementItem>) => {
    setProcurement((items) =>
      items.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const addProcItem = () => {
    setProcurement((items) => [
      ...items,
      {
        id: Math.random().toString(36).slice(2),
        category: "",
        description: "",
        amount: "",
        currency: "GBP",
      },
    ]);
  };

  const removeProcItem = (id: string) => {
    setProcurement((items) => items.filter((it) => it.id !== id));
  };

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
        data: { general, travel, waste, procurement },
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
            const parsed = JSON.parse(r.dataJson) as {
              general?: GeneralData;
              travel?: TravelData;
              waste?: WasteData;
              procurement?: ProcurementItem[];
            };
            if (parsed.general) setGeneral(parsed.general);
            if (parsed.travel) setTravel(parsed.travel);
            if (parsed.waste) setWaste(parsed.waste);
            if (parsed.procurement) setProcurement(parsed.procurement);
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
      <div className="mb-6 w-full rounded-3xl bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal text-trace-cream p-5 sm:p-7 shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full border border-white/10" />
        <div className="flex items-start justify-between gap-4 relative z-10 w-full">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-1 shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0 flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl font-semibold">
                TRACE · Carbon Footprint Calculator
              </h1>
              <p className="text-xs sm:text-sm text-trace-cream/90 space-y-0.5 w-full">
                <span className="block">
                  Create a research report that estimates the annual carbon footprint of your project,
                  based on your own utilities, travel, waste and procurement data.
                </span>
              </p>
            </div>
          </div>
          {isEditingFromDashboard && (
            <button
              type="button"
              onClick={() => router.push("/app/dashboard")}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/40 bg-white/10 text-[11px] font-medium text-trace-cream hover:bg-white/20"
            >
              Cancel editing & return to dashboard
            </button>
          )}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs sm:text-sm text-trace-cream/90 relative z-10 w-full">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-1 min-w-0 flex-1 w-full">
            <p>
              Need help choosing values? Contact your supervisor or TRACE admin for guidance on
              typical figures in your discipline.
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <span>Want more detailed methodology and examples?</span>
              <a
                href="https://researchfootprinttool.com/Carbon%20Footprinting%20Tool%20Guidance.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/10 px-3 py-1.5 text-[11px] sm:text-xs font-medium hover:bg-white/20"
              >
                <span>Download the supporting guidance (PDF)</span>
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border-2 border-trace-sand/50 bg-white shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6">
          <label
            htmlFor="title"
            className="shrink-0 text-base sm:text-lg font-semibold text-trace-forest flex items-center gap-2 sm:w-48"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-trace-teal/15 text-trace-teal">
              <Leaf className="w-4 h-4" />
            </span>
            Report title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. PhD project 2024–2025, Lab A annual footprint…"
            className="flex-1 min-w-0 rounded-xl border-2 border-trace-sand/60 bg-trace-cream/30 px-4 py-3.5 text-base sm:text-lg font-medium text-trace-forest placeholder:text-trace-stone/50 outline-none focus:border-trace-teal focus:ring-2 focus:ring-trace-teal/20 transition-shadow"
          />
        </div>
      </div>

      <StepTabs step={step} />

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-4 rounded-2xl border border-trace-sand/70 bg-white p-5 shadow-card">
        {step === "intro" && (
          <IntroStep onNext={() => saveDraft("utilities")} disabled={disabled} />
        )}
        {step === "utilities" && (
          <UtilitiesTab general={general} setGeneral={setGeneral} onBack={() => setStep("intro")} onNext={() => saveDraft("travel")} disabled={disabled} />
        )}
        {step === "travel" && (
          <TravelTab travel={travel} setTravel={setTravel} onBack={() => setStep("utilities")} onNext={() => saveDraft("waste")} disabled={disabled} />
        )}
        {step === "waste" && (
          <WasteTab waste={waste} setWaste={setWaste} onBack={() => setStep("travel")} onNext={() => saveDraft("procurement")} disabled={disabled} />
        )}
        {step === "procurement" && (
          <ProcurementStep
            items={procurement}
            addItem={addProcItem}
            updateItem={updateProcItem}
            removeItem={removeProcItem}
            onBack={() => setStep("waste")}
            onNext={() => saveDraft("results")}
            disabled={disabled}
          />
        )}
        {step === "results" && (
          <ResultsStep
            reportTitle={title}
            reportId={reportId}
            isEditing={isEditingFromDashboard}
            onBack={() => setStep("procurement")}
            onSubmitFinal={() => saveDraft(undefined, true)}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

function StepTabs({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "utilities", label: "Utilities" },
    { id: "travel", label: "Travel" },
    { id: "waste", label: "Waste" },
    { id: "procurement", label: "Procurement" },
    { id: "results", label: "Results" },
  ];
  const stepOrder: Step[] = ["intro", "utilities", "travel", "waste", "procurement", "results"];
  const currentIndex = stepOrder.indexOf(step);

  return (
    <div className="mb-6 w-full">
      <div className="rounded-2xl border border-trace-sand/60 bg-white shadow-card overflow-hidden w-full">
        <div className="w-full px-2 py-2 sm:px-4 sm:py-3 bg-trace-cream/70">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-trace-stone/70 mb-2.5">
            Complete in order
          </p>
          <div className="grid grid-cols-5 w-full gap-0">
            {steps.map((s, index) => {
              const isActive = step === s.id;
              const isPast = stepOrder.indexOf(s.id) < currentIndex;
              const stepNum = index + 1;
              const isLast = index === steps.length - 1;
              return (
                <div key={s.id} className="flex items-center min-w-0 col-span-1">
                  <div
                    className={`relative flex flex-1 min-w-0 items-center justify-center gap-2 py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl select-none pointer-events-none transition-all duration-200 ${
                      isActive
                        ? "bg-trace-forest text-trace-cream shadow-lg shadow-trace-forest/30 scale-[1.03] z-10 ring-2 ring-trace-teal/50"
                        : isPast
                          ? "bg-trace-teal/15 text-trace-forest border border-trace-teal/30"
                          : "bg-white/80 text-trace-stone/60 border border-trace-sand/50"
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
                      className={`shrink-0 w-4 h-4 sm:w-5 sm:h-5 mx-0.5 sm:mx-1 ${
                        isPast ? "text-trace-teal" : "text-trace-forest/60"
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
  );
}

function IntroStep({ onNext, disabled }: { onNext: () => void; disabled: boolean }) {
  return (
    <div className="space-y-4 text-sm text-trace-stone">
      <h2 className="text-lg font-semibold text-trace-forest border-l-4 border-trace-teal pl-3">
        Getting started
      </h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Utilities:</strong> Enter staff numbers, lab space types and areas to estimate
          energy and water.
        </li>
        <li>
          <strong>Travel:</strong> Enter distances for research travel and conference attendance,
          remembering return trips.
        </li>
        <li>
          <strong>Waste:</strong> Estimate annual waste. Weigh one week and multiply by 52 for a
          simple estimate.
        </li>
      </ul>
      <h3 className="text-base font-semibold text-trace-forest mt-4">Procurement</h3>
      <p>
        Add project-related procurement lines. This mirrors tools like HESCET and can be refined
        later with institution-specific data.
      </p>
      <h3 className="text-base font-semibold text-trace-forest mt-4">Results</h3>
      <p>
        View a summary of your estimated annual footprint. After submitting, reports appear on the
        dashboard and can be revisited, edited, and exported.
      </p>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
      >
        <ArrowRight className="w-4 h-4" />
        Save &amp; Continue
      </button>
    </div>
  );
}

function UtilitiesTab({
  general,
  setGeneral,
  onBack,
  onNext,
  disabled,
}: {
  general: GeneralData;
  setGeneral: (g: GeneralData) => void;
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
}) {
  const handle = (field: keyof GeneralData, value: string) =>
    setGeneral({ ...general, [field]: value });

  return (
    <div className="space-y-5 text-sm text-trace-stone">
      <h2 className="text-lg font-semibold text-trace-forest border-l-4 border-trace-teal pl-3">
        Utilities
      </h2>
      <h3 className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        Personnel
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-trace-forest mb-1">
            Number of FTE staff on project
          </label>
          <p className="text-xs text-trace-stone mb-1">
            Total number of staff that will work directly on the project.
          </p>
          <input
            value={general.personnelFteOnProject}
            onChange={(e) => handle("personnelFteOnProject", e.target.value)}
            className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            placeholder="Enter number of staff"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-trace-forest mb-1">
            Total number of FTE research group members
          </label>
          <p className="text-xs text-trace-stone mb-1">
            Total number of staff that are members of the lab group, including any not working on the project.
          </p>
          <input
            value={general.personnelGroupSize}
            onChange={(e) => handle("personnelGroupSize", e.target.value)}
            className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            placeholder="Enter number of staff"
          />
        </div>
      </div>

      <div className="h-px w-full bg-trace-sand/60 my-2" />

      <h3 className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        ENERGY
      </h3>
      <p className="text-xs text-trace-stone mb-2">
        Enter the floor area for each type of space to calculate electricity and gas consumption.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Academic Laboratory"
          placeholder="Enter floor space in m²"
          value={general.labAcademic}
          onChange={(v) => handle("labAcademic", v)}
        />
        <Field
          label="Supporting Admin Office (non‑research related)"
          placeholder="Enter floor space in m²"
          value={general.officeAdmin}
          onChange={(v) => handle("officeAdmin", v)}
        />
        <Field
          label="Academic Office (research related)"
          placeholder="Enter floor space in m²"
          value={general.officeAcademic}
          onChange={(v) => handle("officeAcademic", v)}
        />
      </div>

      <div className="h-px w-full bg-trace-sand/60 my-2" />

      <h3 className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        WATER
      </h3>
      <p className="text-xs text-trace-stone mb-2">
        Enter the floor area for each type of space to calculate water consumption. For lab space types, select the most appropriate for your lab(s). If your lab is multidisciplinary then enter a ratio for lab space according to the work done. For example, if you have a lab space of 100 m², and work involves 30% of your time spent doing chemistry related activities, and the other 70% life science activities, enter 30 m² in Physical Sciences Laboratory, and 70 m² in Medical/Life Sciences Laboratory.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Physical Sciences Laboratory"
          placeholder="Enter area in m²"
          value={general.labPhysical}
          onChange={(v) => handle("labPhysical", v)}
        />
        <Field
          label="Engineering Laboratory"
          placeholder="Enter area in m²"
          value={general.labEngineering}
          onChange={(v) => handle("labEngineering", v)}
        />
        <Field
          label="Medical/Life Sciences Laboratory"
          placeholder="Enter area in m²"
          value={general.labMedical}
          onChange={(v) => handle("labMedical", v)}
        />
        <Field
          label="Office/Admin Space"
          placeholder="Enter area in m²"
          value={general.officeWater}
          onChange={(v) => handle("officeWater", v)}
        />
      </div>

      <div className="h-px w-full bg-trace-sand/60 my-2" />

      <h3 className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        Computing / cloud / IT
      </h3>
      <p className="text-xs text-trace-stone mb-2">
        These placeholders capture computing-related emissions until the official TRACE engine is
        available. Use rough estimates based on typical usage.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Cloud compute (total hours)"
          placeholder="Enter total compute hours (e.g. VMs, jobs)"
          value={general.cloudComputeHours}
          onChange={(v) => handle("cloudComputeHours", v)}
        />
        <Field
          label="Cloud storage (GB-months)"
          placeholder="GB stored × months (e.g. 100 GB for 6 months = 600)"
          value={general.cloudStorageGbMonths}
          onChange={(v) => handle("cloudStorageGbMonths", v)}
        />
        <Field
          label="On-prem compute (total hours)"
          placeholder="Server / HPC hours on local hardware"
          value={general.onPremComputeHours}
          onChange={(v) => handle("onPremComputeHours", v)}
        />
        <Field
          label="On-prem storage (TB-months)"
          placeholder="TB stored × months on local systems"
          value={general.onPremStorageTbMonths}
          onChange={(v) => handle("onPremStorageTbMonths", v)}
        />
      </div>

      <div className="h-px w-full bg-trace-sand/60 my-2" />

      <h3 className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        Printing and admin activity
      </h3>
      <p className="text-xs text-trace-stone mb-2">
        Rough indicators of paper use and administrative overhead. These feed into the printing /
        admin category in the dashboard.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Pages printed (per year)"
          placeholder="Approximate total number of pages"
          value={general.pagesPrinted}
          onChange={(v) => handle("pagesPrinted", v)}
        />
        <Field
          label="Admin / coordination hours per week"
          placeholder="Average hours of admin work per week"
          value={general.adminHoursPerWeek}
          onChange={(v) => handle("adminHoursPerWeek", v)}
        />
      </div>

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
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
        >
          <ArrowRight className="w-4 h-4" />
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
}

function TravelTab({
  travel,
  setTravel,
  onBack,
  onNext,
  disabled,
}: {
  travel: TravelData;
  setTravel: (t: TravelData) => void;
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
}) {
  const handle = (field: keyof TravelData, value: string) =>
    setTravel({ ...travel, [field]: value });

  return (
    <div className="space-y-5 text-sm text-trace-stone">
      <h2 className="text-lg font-semibold text-trace-forest border-l-4 border-trace-teal pl-3">
        Travel
      </h2>
      <h3 className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        AIR TRAVEL
      </h3>
      <p className="text-xs text-trace-stone mb-2">
        Remember to account for return trips.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Economy Short‑Haul, To/From UK"
          placeholder="Enter distance travelled (km)"
          value={travel.shortHaulEcoUk}
          onChange={(v) => handle("shortHaulEcoUk", v)}
        />
        <Field
          label="Business Short‑Haul, To/From UK"
          placeholder="Enter distance travelled (km)"
          value={travel.shortHaulBizUk}
          onChange={(v) => handle("shortHaulBizUk", v)}
        />
        <Field
          label="Economy Long‑Haul, To/From UK"
          placeholder="Enter distance travelled (km)"
          value={travel.longHaulEcoUk}
          onChange={(v) => handle("longHaulEcoUk", v)}
        />
        <Field
          label="Business Long‑Haul, To/From UK"
          placeholder="Enter distance travelled (km)"
          value={travel.longHaulBizUk}
          onChange={(v) => handle("longHaulBizUk", v)}
        />
        <Field
          label="Economy International, To/From Non‑UK"
          placeholder="Enter distance travelled (km)"
          value={travel.ecoIntlNonUk}
          onChange={(v) => handle("ecoIntlNonUk", v)}
        />
        <Field
          label="Business International, To/From Non‑UK"
          placeholder="Enter distance travelled (km)"
          value={travel.bizIntlNonUk}
          onChange={(v) => handle("bizIntlNonUk", v)}
        />
      </div>

      <div className="h-px w-full bg-trace-sand/60 my-2" />

      <h3 className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        SEA TRAVEL
      </h3>
      <p className="text-xs text-trace-stone mb-2">
        Any distances travelled by ferry. Remember to account for return trips.
      </p>
      <Field
        label="Ferry"
        placeholder="Enter distance travelled (km)"
        value={travel.ferry}
        onChange={(v) => handle("ferry", v)}
      />

      <div className="h-px w-full bg-trace-sand/60 my-2" />

      <h3 className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        LAND TRAVEL
      </h3>
      <p className="text-xs text-trace-stone mb-2">
        Any land-based travel related to research, learning or promotion of the work being done. This is not meant to include commuting by staff. Remember to account for return trips.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Car" placeholder="Enter distance travelled (km)" value={travel.car} onChange={(v) => handle("car", v)} />
        <Field label="Motorbike" placeholder="Enter distance travelled (km)" value={travel.motorbike} onChange={(v) => handle("motorbike", v)} />
        <Field label="Taxis" placeholder="Enter distance travelled (km)" value={travel.taxis} onChange={(v) => handle("taxis", v)} />
        <Field label="Local Bus" placeholder="Enter distance travelled (km)" value={travel.localBus} onChange={(v) => handle("localBus", v)} />
        <Field label="Coach" placeholder="Enter distance travelled (km)" value={travel.coach} onChange={(v) => handle("coach", v)} />
        <Field label="National Rail" placeholder="Enter distance travelled (km)" value={travel.nationalRail} onChange={(v) => handle("nationalRail", v)} />
        <Field label="International Rail" placeholder="Enter distance travelled (km)" value={travel.internationalRail} onChange={(v) => handle("internationalRail", v)} />
        <Field label="Light Rail and Tram" placeholder="Enter distance travelled (km)" value={travel.tram} onChange={(v) => handle("tram", v)} />
      </div>

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
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
        >
          <ArrowRight className="w-4 h-4" />
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
}

function WasteTab({
  waste,
  setWaste,
  onBack,
  onNext,
  disabled,
}: {
  waste: WasteData;
  setWaste: (w: WasteData) => void;
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
}) {
  const handle = (field: keyof WasteData, value: string) =>
    setWaste({ ...waste, [field]: value });

  return (
    <div className="space-y-5 text-sm text-trace-stone">
      <h2 className="text-lg font-semibold text-trace-forest border-l-4 border-trace-teal pl-3">
        Waste
      </h2>
      <p className="text-xs text-trace-stone mb-2">
        Enter approximate waste production over either the period of the project, or for a calendar year. Try and be consistent over each field. Weighing waste production over the course of a week and then multiplying by 52 is an acceptable means of determining yearly waste production. As with lab types on the first page, enter data in the waste categories according to what feels most suitable. For liquid waste, make a conversion from volume to weight as appropriate. Note that all weights are in tonnes; convert from kg by dividing by 1000.
      </p>
      <h3 className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        RECYCLING
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Mixed Recycling"
          placeholder="Enter weight in tonnes"
          value={waste.mixedRecycling}
          onChange={(v) => handle("mixedRecycling", v)}
        />
        <Field
          label="WEEE Mixed Recycling"
          placeholder="Enter weight in tonnes"
          value={waste.weeeRecycling}
          onChange={(v) => handle("weeeRecycling", v)}
        />
      </div>

      <div className="h-px w-full bg-trace-sand/60 my-2" />

      <h3 className="mt-4 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        WASTE
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="General Waste"
          placeholder="Enter weight in tonnes"
          value={waste.generalWaste}
          onChange={(v) => handle("generalWaste", v)}
        />
        <Field
          label="Clinical Waste"
          placeholder="Enter weight in tonnes"
          value={waste.clinicalWaste}
          onChange={(v) => handle("clinicalWaste", v)}
        />
        <Field
          label="Chemical Waste"
          placeholder="Enter weight in tonnes"
          value={waste.chemicalWaste}
          onChange={(v) => handle("chemicalWaste", v)}
        />
        <Field
          label="Biological Waste"
          placeholder="Enter weight in tonnes"
          value={waste.biologicalWaste}
          onChange={(v) => handle("biologicalWaste", v)}
        />
      </div>

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
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
        >
          <ArrowRight className="w-4 h-4" />
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
}

function ProcurementStep({
  items,
  addItem,
  updateItem,
  removeItem,
  onBack,
  onNext,
  disabled,
}: {
  items: ProcurementItem[];
  addItem: () => void;
  updateItem: (id: string, patch: Partial<ProcurementItem>) => void;
  removeItem: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-5 text-sm text-trace-stone">
      <h2 className="text-lg font-semibold text-trace-forest border-l-4 border-trace-teal pl-3">
        Procurement
      </h2>
      <p className="text-xs text-trace-stone mb-2">
        Click + to add new lines. It is recommended to use the search to identify the correct category. Enter expenditure in GBP.
      </p>
      <div className="h-px w-full bg-trace-sand/60 my-2" />
      <h3 className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-trace-forest/80 bg-trace-cream/80 border border-trace-sand/70 rounded-full inline-flex items-center px-3 py-1">
        Procurement lines
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end border border-trace-sand/60 rounded-xl p-3 bg-trace-cream/40"
          >
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-trace-forest mb-1">
                Category
              </label>
              <input
                value={item.category}
                onChange={(e) => updateItem(item.id, { category: e.target.value })}
                className="w-full rounded-xl border border-trace-sand/70 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                placeholder="Select or search a category..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-trace-forest mb-1">
                Description
              </label>
              <input
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                className="w-full rounded-xl border border-trace-sand/70 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                placeholder="Short description"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-trace-forest mb-1">
                Expenditure, GBP
              </label>
              <input
                value={item.amount}
                onChange={(e) => updateItem(item.id, { amount: e.target.value })}
                className="w-full rounded-xl border border-trace-sand/70 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-2 items-center justify-between">
              <div className="flex-1">
                <label className="block text-xs font-medium text-trace-forest mb-1">
                  Currency
                </label>
                <input
                  value={item.currency}
                  onChange={(e) => updateItem(item.id, { currency: e.target.value })}
                  className="w-full rounded-xl border border-trace-sand/70 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs text-trace-stone hover:text-red-600 mt-5"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-trace-sand/70 bg-white text-xs font-medium text-trace-forest hover:bg-trace-sand/30"
      >
        Add procurement line
      </button>
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
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
        >
          <ArrowRight className="w-4 h-4" />
          Save &amp; Continue
        </button>
      </div>
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
        if (r.resultJson) {
          let result = JSON.parse(r.resultJson) as TraceResult;
          let inputs: TraceInputs | undefined;
          try {
            inputs = JSON.parse(r.dataJson || "{}") as TraceInputs;
            const breakdowns = getCategoryBreakdowns(inputs);
            if (result.categories?.some((c) => !c.breakdown?.length)) {
              result = {
                ...result,
                categories: result.categories.map((cat) => ({
                  ...cat,
                  breakdown: cat.breakdown?.length ? cat.breakdown : breakdowns[cat.id] ?? [],
                })),
              };
            }
          } catch (_) {
            inputs = undefined;
          }
          setPreviewInputs(inputs);
          setPreviewResult(result);
        } else {
          try {
            const inputs = JSON.parse(r.dataJson || "{}") as TraceInputs;
            setPreviewInputs(inputs);
          } catch {
            setPreviewInputs(undefined);
          }
          // Fallback minimal structure if resultJson is missing (legacy reports)
          const fallback: TraceResult = {
            projectTitle: r.title || reportTitle || "Untitled report",
            calculatedAt: r.updatedAt,
            totalKgCo2e: r.totalKgCo2e ?? 0,
            totalAfterReductions: r.totalKgCo2e ?? 0,
            reductionPotentialKgCo2e: 0,
            confidence: "medium",
            largestCategory: {
              id: "travel_fieldwork",
              label: "Travel / fieldwork",
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
              "This preview uses limited data because the calculation engine was not yet fully wired when this report was first created.",
          };
          setPreviewResult(fallback);
        }
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
      <p>
        When you {isEditing ? "save" : "submit"}, TRACE will store your inputs and open a full
        dashboard-style view of this report, including overview, breakdown, reduction
        opportunities, scenarios, and export options.
      </p>
      <p>
        You&apos;ll also be able to return to this view any time from the Dashboard by using the
        &quot;View&quot; action on your report.
      </p>

      {!reportId && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Save your report at least once using the Next buttons before this step to see a live
          preview of the calculated dashboard.
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
          <span>Loading live preview of your calculated report…</span>
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

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-trace-forest mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
      />
    </div>
  );
}

