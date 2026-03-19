"use client";

import { useState } from "react";
import type { TraceResult } from "@/lib/types";
import type { TraceInputs } from "@/lib/calc";
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
import { Loader2 } from "lucide-react";
import ReportTitleSection from "@/components/dashboard/ReportTitleSection";

export interface ReportMeta {
  title: string;
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
  report_id: number | null;
}

interface ReportClientProps {
  result: TraceResult;
  reportId: string;
  /** When provided, methodology section shows this report's input values and calculated emissions per row */
  inputs?: TraceInputs;
  /** When provided, a title section (title, date, ID) is shown after the export panel */
  reportMeta?: ReportMeta;
}

type ExportKind = "pdf_report" | "pdf_supervisor" | "pdf_thesis" | "csv" | "json";

export default function ReportClient({ result, reportId, inputs, reportMeta }: ReportClientProps) {
  const [mode, setMode] = useState<InterpretationId>("kg_co2e");
  const [exportType, setExportType] = useState<ExportKind>("pdf_report");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!exportType || exporting) return;
    setExporting(true);
    try {
      if (exportType === "csv") {
        downloadCSV(result, mode);
      } else if (exportType === "json") {
        downloadJSON(result, mode);
      } else if (exportType === "pdf_report") {
        await downloadPDFReport(result, mode);
      } else if (exportType === "pdf_supervisor") {
        await downloadSupervisorPDF(result, mode);
      } else if (exportType === "pdf_thesis") {
        await downloadThesisAppendixPDF(result, mode);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 pt-2 print:hidden">
        <div className="rounded-2xl bg-white/80 border border-trace-sand/60 px-3 sm:px-4 py-2 shadow-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="font-medium text-trace-stone">Export as</span>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as ExportKind)}
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
      </section>
      {reportMeta && (
        <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 pt-2">
          <ReportTitleSection
            title={reportMeta.title}
            status={reportMeta.status}
            createdAt={reportMeta.createdAt}
            updatedAt={reportMeta.updatedAt}
            reportId={reportMeta.report_id}
            className="print:break-inside-avoid"
          />
        </section>
      )}
      <FootprintOverview result={result} interpretationMode={mode} />
      <EmissionsBreakdown result={result} interpretationMode={mode} />
      <ReductionOpportunities result={result} interpretationMode={mode} />
      <ScenarioComparison result={result} interpretationMode={mode} />
      <MethodologySection
        inputs={inputs}
        reportTotalKgCo2e={result.totalKgCo2e}
        interpretationMode={mode}
      />
    </>
  );
}
