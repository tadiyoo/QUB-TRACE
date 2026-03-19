"use client";

import { useState } from "react";
import {
  FileText,
  FileDown,
  BookOpen,
  Table,
  Code,
  Loader2,
} from "lucide-react";
import type { TraceResult } from "@/lib/types";
import type { InterpretationId } from "@/lib/interpretations";
import { cn } from "@/lib/utils";
import {
  downloadPDFReport,
  downloadSupervisorPDF,
  downloadThesisAppendixPDF,
} from "@/lib/exports/pdf";
import { downloadCSV } from "@/lib/exports/csv";
import { downloadJSON } from "@/lib/exports/json";

interface ExportPanelProps {
  result: TraceResult;
  interpretationMode: InterpretationId;
  className?: string;
}

type ExportType =
  | "pdf_report"
  | "pdf_supervisor"
  | "pdf_thesis"
  | "csv"
  | "json"
  | null;

export default function ExportPanel({ result, interpretationMode, className }: ExportPanelProps) {
  const [loading, setLoading] = useState<ExportType>(null);

  const handleExport = async (type: ExportType) => {
    if (!type) return;
    setLoading(type);
    try {
      switch (type) {
        case "pdf_report":
          await downloadPDFReport(result, interpretationMode);
          break;
        case "pdf_supervisor":
          await downloadSupervisorPDF(result, interpretationMode);
          break;
        case "pdf_thesis":
          await downloadThesisAppendixPDF(result, interpretationMode);
          break;
        case "csv":
          downloadCSV(result, interpretationMode);
          break;
        case "json":
          downloadJSON(result, interpretationMode);
          break;
      }
    } finally {
      setLoading(null);
    }
  };

  const buttons: { type: ExportType; label: string; icon: React.ReactNode }[] = [
    { type: "pdf_report", label: "Full PDF report", icon: <FileText className="w-4 h-4" /> },
    { type: "pdf_supervisor", label: "Supervisor one-pager", icon: <FileDown className="w-4 h-4" /> },
    { type: "pdf_thesis", label: "Thesis appendix (PDF)", icon: <BookOpen className="w-4 h-4" /> },
    { type: "csv", label: "Export CSV", icon: <Table className="w-4 h-4" /> },
    { type: "json", label: "Export JSON", icon: <Code className="w-4 h-4" /> },
  ];

  return (
    <section
      id="export"
      className={cn("max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6", className)}
      aria-labelledby="export-heading"
    >
      <h2 id="export-heading" className="text-xl font-semibold text-trace-forest mb-3">
        Export & reports
      </h2>
      <p className="text-base text-trace-stone mb-5">
        Share with your supervisor, attach to your thesis appendix, or reuse data for institutional
        reporting. <strong>Exports use the interpretation currently selected in the header</strong> (e.g. kg CO₂e, kWh, £, car km).
      </p>
      <div className="flex flex-wrap gap-4">
        {buttons.map(({ type, label, icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleExport(type)}
            disabled={loading !== null}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-trace-sand/60 bg-white text-trace-forest text-sm font-medium shadow-card hover:shadow-cardHover hover:bg-trace-cream/50 transition-all disabled:opacity-60",
              loading === type && "pointer-events-none"
            )}
          >
            {loading === type ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              icon
            )}
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
