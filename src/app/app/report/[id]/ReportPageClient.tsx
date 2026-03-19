"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import type { TraceResult } from "@/lib/types";
import { getCategoryBreakdowns, type TraceInputs } from "@/lib/calc";
import ReportClient from "./ReportClient";

interface ReportFromApi {
  id: string;
  report_id: number | null;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalKgCo2e: number | null;
  dataJson: string;
  resultJson?: string | null;
}

function defaultResult(report: ReportFromApi): TraceResult {
  return {
    projectTitle: report.title || "Untitled report",
    calculatedAt: report.updatedAt,
    totalKgCo2e: report.totalKgCo2e ?? 0,
    totalAfterReductions: report.totalKgCo2e ?? 0,
    reductionPotentialKgCo2e: 0,
    confidence: "medium",
    largestCategory: {
      id: "travel_fieldwork",
      label: "Travel / fieldwork",
      shortLabel: "Travel",
      kgCo2e: report.totalKgCo2e ?? 0,
      percentage: 100,
    },
    categories: [],
    reductionOpportunities: [],
    assumptions: [],
    estimatedInputsCount: 0,
    optionalInputsCount: 0,
    uncertaintyNote:
      "This report was created before the calculation engine was wired to the database. Results are limited.",
  };
}

export default function ReportPageClient() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [report, setReport] = useState<ReportFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/reports/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.report) setReport(data.report);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <p className="text-trace-stone">Loading report…</p>
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <p className="text-trace-stone">Report not found.</p>
        <Link href="/app/dashboard" className="text-trace-teal hover:underline mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  let traceResult: TraceResult =
    (report.resultJson && (JSON.parse(report.resultJson) as TraceResult)) || defaultResult(report);

  let reportInputs: TraceInputs | undefined;
  try {
    reportInputs = JSON.parse(report.dataJson || "{}") as TraceInputs;
  } catch {
    reportInputs = undefined;
  }

  // Enrich categories with per-input breakdown from dataJson when missing (e.g. report saved before breakdown was added)
  if (reportInputs) {
    const breakdowns = getCategoryBreakdowns(reportInputs);
    const hasMissingBreakdown = traceResult.categories.some(
      (c) => !c.breakdown || c.breakdown.length === 0
    );
    if (hasMissingBreakdown) {
      traceResult = {
        ...traceResult,
        categories: traceResult.categories.map((cat) => ({
          ...cat,
          breakdown: cat.breakdown?.length ? cat.breakdown : breakdowns[cat.id] ?? [],
        })),
      };
    }
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <header className="mb-6 w-full rounded-3xl bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal text-trace-cream p-5 sm:p-6 shadow-card relative overflow-hidden print:shadow-md print:border print:border-gray-300">
        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full border border-white/10 print:hidden" />
        <div className="flex items-start justify-between gap-6 relative z-10 w-full">
          <div className="flex-1 min-w-0 space-y-1 pr-6 w-full">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/15 text-[11px] print:bg-gray-200 print:text-gray-700">
              <Leaf className="w-3.5 h-3.5 text-trace-mint print:text-gray-600" />
              <span className="uppercase tracking-[0.18em] text-trace-cream/80 font-semibold print:text-gray-700">
                TRACE · Carbon footprint report
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-trace-cream">
              Report overview
            </h1>
            <p className="text-xs sm:text-sm text-trace-cream/90 w-full">
              Review this project&apos;s footprint, export to PDF or data, and use the controls below
              to switch units (kg CO₂e, kWh, £, etc.). Report title and date appear in the section
              below and are included in exports.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 print:hidden shrink-0">
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-trace-forest text-[11px] font-medium hover:bg-trace-cream/90"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <ReportClient
        result={traceResult}
        reportId={report.id}
        inputs={reportInputs}
        reportMeta={{
          title: report.title || "Untitled report",
          status: report.status === "submitted" ? "submitted" : "draft",
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
          report_id: report.report_id,
        }}
      />
    </div>
  );
}
