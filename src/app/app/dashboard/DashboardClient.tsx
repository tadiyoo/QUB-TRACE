"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReportsTable from "./reports-table";

interface ReportRow {
  id: string;
  report_id: number | null;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalKgCo2e: number | null;
}

export default function DashboardClient() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetchReports = () => {
    fetch("/api/reports")
      .then((res) => {
        if (res.status === 401) return [];
        return res.json();
      })
      .then((data) => {
        setReports(data.reports ?? []);
      });
  };

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => {
        if (res.status === 401) return [];
        return res.json();
      })
      .then((data) => {
        setReports(data.reports ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <p className="text-trace-stone">Loading reports…</p>
      </div>
    );
  }

  const totalReports = reports.length;
  const submitted = reports.filter((r) => r.status === "submitted").length;
  const drafts = totalReports - submitted;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="mb-6 w-full rounded-3xl bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal text-trace-cream p-5 sm:p-6 shadow-card relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border border-white/10" />
        <div className="flex items-start justify-between gap-6 relative z-10 w-full">
          <div className="flex-1 min-w-0 space-y-1 pr-6">
            <h1 className="text-2xl sm:text-3xl font-semibold">Your TRACE reports</h1>
            <p className="text-xs sm:text-sm text-trace-cream/90">
              Browse, search, and manage carbon footprint reports for your research projects. Use{" "}
              <strong>New report</strong> to capture a fresh project footprint.
            </p>
          </div>
          <Link
            href="/app/new-report"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 text-trace-forest text-sm font-medium hover:bg-trace-cream/90 shrink-0"
          >
            New report
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="rounded-2xl bg-white/10 px-3 py-2">
            <p className="text-trace-cream/80 mb-1">Total reports</p>
            <p className="text-lg sm:text-xl font-semibold text-white">{totalReports}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2">
            <p className="text-trace-cream/80 mb-1">Submitted</p>
            <p className="text-lg sm:text-xl font-semibold text-white">{submitted}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2">
            <p className="text-trace-cream/80 mb-1">Drafts</p>
            <p className="text-lg sm:text-xl font-semibold text-white">{drafts}</p>
          </div>
        </div>
      </div>
      <ReportsTable reports={reports} onReportDeleted={refetchReports} />
    </div>
  );
}
