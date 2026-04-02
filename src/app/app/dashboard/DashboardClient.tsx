"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, FilePenLine } from "lucide-react";
import PageHero, { PageHeroStat, PageHeroStatGrid } from "@/components/layout/PageHero";
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
      <PageHero
        kicker="TRACE · Dashboard"
        title="Your TRACE reports"
        description={
          <>
            Browse, search, and manage carbon footprint reports for your research projects. Use{" "}
            <strong>New report</strong> to capture a fresh project footprint.
          </>
        }
        actions={
          <Link
            href="/app/new-report"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 text-trace-forest text-sm font-semibold hover:bg-trace-cream shadow-sm border border-white/30"
          >
            New report
          </Link>
        }
      >
        <PageHeroStatGrid columns={3}>
          <PageHeroStat
            icon={<ClipboardList className="w-5 h-5" />}
            label="Total reports"
            value={totalReports}
            hint="All footprints"
            accent="sky"
          />
          <PageHeroStat
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Submitted"
            value={submitted}
            hint="Finalised"
            accent="emerald"
          />
          <PageHeroStat
            icon={<FilePenLine className="w-5 h-5" />}
            label="Drafts"
            value={drafts}
            hint="In progress"
            accent="violet"
          />
        </PageHeroStatGrid>
      </PageHero>
      <ReportsTable reports={reports} onReportDeleted={refetchReports} />
    </div>
  );
}
