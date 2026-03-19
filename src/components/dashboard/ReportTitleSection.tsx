"use client";

import { format } from "date-fns";
import { FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportTitleSectionProps {
  title: string;
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
  reportId: number | null;
  className?: string;
}

export default function ReportTitleSection({
  title,
  status,
  createdAt,
  updatedAt,
  reportId,
  className,
}: ReportTitleSectionProps) {
  const created = format(new Date(createdAt), "d MMMM yyyy");
  const updated = format(new Date(updatedAt), "d MMMM yyyy");

  return (
    <section
      className={cn(
        "rounded-2xl border border-trace-sand/60 bg-white shadow-card overflow-hidden print:shadow-none print:border-gray-300",
        className
      )}
      aria-labelledby="report-title-heading"
    >
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-trace-teal via-trace-mint to-trace-forest print:bg-gray-400" />
        <div className="pl-5 sm:pl-6 pr-4 sm:pr-6 py-5 sm:py-6">
          <h2 id="report-title-heading" className="sr-only">
            Report information
          </h2>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-trace-stone text-xs mb-1.5">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="uppercase tracking-wider font-medium">Report title</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-trace-forest leading-tight">
                {title || "Untitled report"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-trace-stone">
              {reportId != null && (
                <span>
                  <span className="text-trace-stone/80">Report ID:</span>{" "}
                  <strong className="text-trace-forest">{reportId}</strong>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-trace-stone/70 shrink-0" />
                <span>
                  {status === "submitted" ? (
                    <strong className="text-trace-forest">{updated}</strong>
                  ) : (
                    <>
                      <span className="text-trace-stone/80">Last updated</span>{" "}
                      <strong className="text-trace-forest">{updated}</strong>
                    </>
                  )}
                </span>
              </span>
              <span className="hidden print:inline-flex">
                <span className="text-trace-stone/80">Created </span>
                <strong className="text-trace-forest">{created}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
