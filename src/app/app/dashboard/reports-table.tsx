"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import Link from "next/link";
import { Eye, Info, Pencil } from "lucide-react";
import DeleteReportButton from "./delete-button";
import { getEmissionLevel, getEmissionLevelLabel, getEmissionLevelDescription } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ReportRow {
  id: string;
  report_id: number | null;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalKgCo2e: number | null;
}

type SortKey = "createdAt" | "updatedAt" | "title" | "totalKgCo2e" | "report_id";
type SortDir = "asc" | "desc";

export default function ReportsTable({
  reports,
  onReportDeleted,
}: {
  reports: ReportRow[];
  onReportDeleted?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "submitted">("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [dateField, setDateField] = useState<"createdAt" | "updatedAt">("createdAt");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const emissionLevelDescription = getEmissionLevelDescription();

  const filtered = reports
    .filter((r) => {
      const q = query.toLowerCase();
      const matchesText =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.report_id !== null && String(r.report_id).includes(q));
      const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;

      let matchesDate = true;
      if (dateFrom || dateTo) {
        const baseDate = new Date(r[dateField]);
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (baseDate < from) matchesDate = false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          // include the whole "to" day
          to.setHours(23, 59, 59, 999);
          if (baseDate > to) matchesDate = false;
        }
      }

      return matchesText && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const va =
        sortKey === "title"
          ? a.title.toLowerCase()
          : sortKey === "totalKgCo2e"
          ? a.totalKgCo2e ?? -Infinity
          : sortKey === "report_id"
          ? a.report_id ?? -Infinity
          : new Date(a[sortKey]).getTime();
      const vb =
        sortKey === "title"
          ? b.title.toLowerCase()
          : sortKey === "totalKgCo2e"
          ? b.totalKgCo2e ?? -Infinity
          : sortKey === "report_id"
          ? b.report_id ?? -Infinity
          : new Date(b[sortKey]).getTime();

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

  const toggleSort = (key: SortKey) => {
    setSortKey((currentKey) => {
      if (currentKey === key) {
        setSortDir((currentDir) => (currentDir === "asc" ? "desc" : "asc"));
        return currentKey;
      }
      setSortDir("asc");
      return key;
    });
  };

  return (
    <div className="mt-4 rounded-3xl bg-white/90 border border-trace-sand/70 shadow-card overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-trace-sand/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-trace-cream via-white to-trace-cream/80">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-trace-stone/90">
            Available reports
          </span>
          <span className="text-[11px] text-trace-stone/80">
            Browse, filter and reopen your TRACE footprints.
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex gap-1.5 rounded-full bg-white/70 border border-trace-sand/80 px-1.5 py-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                statusFilter === "all"
                  ? "bg-trace-forest text-trace-cream shadow-sm"
                  : "text-trace-stone hover:bg-trace-cream/80"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                statusFilter === "draft"
                  ? "bg-amber-500/90 text-white shadow-sm"
                  : "text-trace-stone hover:bg-trace-cream/80"
              }`}
            >
              Drafts
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("submitted")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                statusFilter === "submitted"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-trace-stone hover:bg-trace-cream/80"
              }`}
            >
              Submitted
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or Report ID"
              className="w-full sm:w-64 rounded-xl border border-trace-sand/80 bg-white/95 px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            />
            <button
              type="button"
              onClick={() => setDateDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-trace-sand/80 bg-white/80 px-3 py-2 text-[11px] font-medium text-trace-forest hover:bg-trace-cream/80"
            >
              <span>Filter by date</span>
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center justify-center rounded-full bg-trace-forest text-[9px] text-trace-cream px-1.5 py-0.5">
                  Active
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-trace-sand/60 bg-white shadow-card min-w-0 w-full overflow-x-auto">
        <table className="w-full max-w-full text-sm border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "2%" }} />
            <col style={{ width: "26%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "28%" }} />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-trace-stone/80 bg-trace-cream/80">
              <th className="py-2.5 px-3 text-left align-middle border-b border-trace-sand/60 whitespace-nowrap">
                #
              </th>
              <th className="py-2.5 px-3 text-left align-middle border-b border-trace-sand/60 border-l border-trace-sand/50">
                <button
                  type="button"
                  onClick={() => toggleSort("title")}
                  className="inline-flex items-center gap-1 text-left"
                >
                  <span>Title</span>
                  {sortKey === "title" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
              <th className="py-2.5 px-3 text-left align-middle border-b border-trace-sand/60 border-l border-trace-sand/50 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort("report_id")}
                  className="inline-flex items-center gap-1"
                >
                  <span>Report ID</span>
                  {sortKey === "report_id" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
              <th className="py-2.5 px-3 text-left align-middle border-b border-trace-sand/60 border-l border-trace-sand/50 whitespace-nowrap">
                Status
              </th>
              <th className="py-2.5 px-3 text-left align-middle border-b border-trace-sand/60 border-l border-trace-sand/50 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="inline-flex items-center gap-1"
                >
                  <span>Created</span>
                  {sortKey === "createdAt" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
              <th className="py-2.5 px-3 text-left align-middle border-b border-trace-sand/60 border-l border-trace-sand/50 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort("updatedAt")}
                  className="inline-flex items-center gap-1"
                >
                  <span>Updated</span>
                  {sortKey === "updatedAt" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
              <th className="py-2.5 px-3 text-right align-middle border-b border-trace-sand/60 border-l border-trace-sand/50 whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSort("totalKgCo2e")}
                    className="inline-flex items-center gap-1"
                  >
                    <span>Total emissions</span>
                    {sortKey === "totalKgCo2e" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </button>
                  <span
                    className="inline-flex text-trace-stone/80 hover:text-trace-forest cursor-help shrink-0"
                    title={emissionLevelDescription}
                    aria-label="How is the Low / Medium / High label determined?"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
              </th>
              <th className="py-2.5 px-3 text-center align-middle border-b border-trace-sand/60 border-l border-trace-sand/50 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-xs text-trace-stone bg-white"
                >
                  No reports yet. Use <span className="font-medium">New report</span> to create
                  your first TRACE footprint.
                </td>
              </tr>
            )}
            {filtered.map((r, index) => {
              const isSubmitted = r.status === "submitted";
              const created = format(new Date(r.createdAt), "d MMM yyyy");
              const updated = format(new Date(r.updatedAt), "d MMM yyyy");
              const idChip = `${r.id.slice(0, 8)}…`;

              return (
                <tr
                  key={r.id}
                  className={`group hover:bg-trace-mint/10 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-trace-cream/40"
                  }`}
                >
                  <td className="py-2.5 px-3 align-middle text-xs text-trace-stone border-b border-trace-sand/50 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3 align-middle border-b border-trace-sand/50 border-l border-trace-sand/50 min-w-0 overflow-hidden">
                    <span className="block text-sm text-trace-forest line-clamp-2 break-words">
                      {r.title}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 align-middle text-[11px] text-trace-stone border-b border-trace-sand/50 border-l border-trace-sand/50 whitespace-nowrap">
                    {r.report_id ?? "–"}
                  </td>
                  <td className="py-2.5 px-3 align-middle border-b border-trace-sand/50 border-l border-trace-sand/50 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isSubmitted
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-100"
                          : "bg-amber-500/10 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {isSubmitted ? "Submitted" : "Draft"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 align-middle text-[11px] text-trace-stone border-b border-trace-sand/50 border-l border-trace-sand/50 whitespace-nowrap">
                    {created}
                  </td>
                  <td className="py-2.5 px-3 align-middle text-[11px] text-trace-stone border-b border-trace-sand/50 border-l border-trace-sand/50 whitespace-nowrap">
                    {updated}
                  </td>
                  <td className="py-2.5 px-3 align-middle text-right text-[11px] text-trace-stone border-b border-trace-sand/50 border-l border-trace-sand/50 whitespace-nowrap">
                    {typeof r.totalKgCo2e === "number" ? (() => {
                      const level = getEmissionLevel(r.totalKgCo2e);
                      return (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <span>{r.totalKgCo2e.toFixed(1)} kg CO₂e</span>
                          <span
                            className={cn(
                              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                              level === "low" && "bg-emerald-100 text-emerald-800",
                              level === "medium" && "bg-amber-100 text-amber-800",
                              level === "high" && "bg-rose-100 text-rose-800"
                            )}
                          >
                            {getEmissionLevelLabel(level)}
                          </span>
                        </div>
                      );
                    })() : (
                      "—"
                    )}
                  </td>
                  <td className="py-2.5 px-3 align-middle text-center text-xs border-b border-trace-sand/50 border-l border-trace-sand/50 whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <Link
                        href={`/app/new-report?reportId=${r.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-200 bg-amber-50/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 hover:shadow-sm text-[11px] font-semibold transition-all duration-200"
                      >
                        <Pencil className="w-3 h-3 shrink-0" />
                        <span>Edit</span>
                      </Link>
                      <Link
                        href={`/app/report/${r.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-teal-200 bg-teal-50/90 text-teal-800 hover:bg-teal-100 hover:border-teal-300 hover:shadow-sm text-[11px] font-semibold transition-all duration-200"
                      >
                        <Eye className="w-3 h-3 shrink-0" />
                        <span>View</span>
                      </Link>
                      <DeleteReportButton id={r.id} onDeleted={onReportDeleted} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dateDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="relative z-50 w-full max-w-md rounded-2xl bg-white shadow-card border border-trace-sand/70 p-4 sm:p-5 text-sm text-trace-stone">
            <h3 className="text-base font-semibold text-trace-forest mb-2">
              Filter reports by date
            </h3>
            <p className="text-xs mb-3">
              Choose whether to filter by when reports were created or last updated, then set an
              optional date range.
            </p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-trace-forest">Field</span>
                <div className="inline-flex rounded-full bg-trace-cream/70 border border-trace-sand/80 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setDateField("createdAt")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                      dateField === "createdAt"
                        ? "bg-trace-forest text-trace-cream"
                        : "text-trace-stone hover:bg-white"
                    }`}
                  >
                    Created date
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateField("updatedAt")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                      dateField === "updatedAt"
                        ? "bg-trace-forest text-trace-cream"
                        : "text-trace-stone hover:bg-white"
                    }`}
                  >
                    Updated date
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-trace-forest">Date range (optional)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1 rounded-lg border border-trace-sand/80 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-trace-teal focus:border-trace-teal"
                  />
                  <span className="text-[11px] text-trace-stone">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1 rounded-lg border border-trace-sand/80 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-trace-teal focus:border-trace-teal"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setDateDialogOpen(false);
                }}
                className="px-3 py-1.5 rounded-full border border-trace-sand/80 bg-white text-trace-stone hover:bg-trace-cream/70"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setDateDialogOpen(false)}
                className="px-3 py-1.5 rounded-full bg-trace-forest text-trace-cream hover:bg-trace-sage"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

