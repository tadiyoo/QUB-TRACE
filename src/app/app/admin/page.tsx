"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FilePenLine,
  FileText,
  Hash,
  Inbox,
  Leaf,
  Mail,
  MessageSquare,
  Pencil,
  Send,
  User,
  Users,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import PageHero from "@/components/layout/PageHero";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  school: string | null;
  department: string | null;
  createdAt: string;
};

type AdminReport = {
  id: string;
  report_id: number | null;
  userId: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalKgCo2e: number | null;
};

type AdminRequest = {
  id: string;
  userId: string;
  type: string;
  subject: string;
  message: string;
  createdAt: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
};

type Tab = "users" | "reports" | "requests";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "submitted" | "draft">("all");
  const [reportUserFilter, setReportUserFilter] = useState<string | null>(null);
  const [requestUserFilter, setRequestUserFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(async (res) => {
        if (!res.ok) throw new Error("Forbidden");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users ?? []);
        setReports(data.reports ?? []);
        setAdminRequests(data.adminRequests ?? []);
      })
      .catch(() => {
        setError("You do not have permission to view admin data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const reportsByUser = useMemo(() => {
    const map = new Map<string, AdminReport[]>();
    reports.forEach((r) => {
      const arr = map.get(r.userId) ?? [];
      arr.push(r);
      map.set(r.userId, arr);
    });
    return map;
  }, [reports]);

  const requestsByUser = useMemo(() => {
    const m = new Map<string, number>();
    adminRequests.forEach((r) => {
      m.set(r.userId, (m.get(r.userId) ?? 0) + 1);
    });
    return m;
  }, [adminRequests]);

  const userStats = useMemo(() => {
    const submitted = reports.filter((r) => r.status === "submitted").length;
    const drafts = reports.length - submitted;
    return { submitted, drafts };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportUserFilter && r.userId !== reportUserFilter) return false;
      if (reportStatusFilter === "all") return true;
      return r.status === reportStatusFilter;
    });
  }, [reports, reportUserFilter, reportStatusFilter]);

  const filteredUserLabel = useMemo(() => {
    if (!reportUserFilter) return null;
    const u = users.find((x) => x.id === reportUserFilter);
    if (!u) return "Selected user";
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    return name || u.username;
  }, [reportUserFilter, users]);

  const filteredRequests = useMemo(() => {
    if (!requestUserFilter) return adminRequests;
    return adminRequests.filter((r) => r.userId === requestUserFilter);
  }, [adminRequests, requestUserFilter]);

  const requestFilterLabel = useMemo(() => {
    if (!requestUserFilter) return null;
    const u = users.find((x) => x.id === requestUserFilter);
    if (!u) return "Selected user";
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    return name || u.username;
  }, [requestUserFilter, users]);

  const goToReports = (opts?: { userId?: string | null; status?: "all" | "submitted" | "draft" }) => {
    setTab("reports");
    setRequestUserFilter(null);
    if (opts?.userId !== undefined) setReportUserFilter(opts.userId);
    if (opts?.status) setReportStatusFilter(opts.status);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="flex items-center gap-3 text-trace-stone">
          <span className="inline-block h-5 w-5 animate-pulse rounded-full bg-trace-teal/40" />
          Loading admin console…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <PageHero
        kicker="Admin"
        title="Admin console"
        icon={<Leaf className="w-3 h-3" />}
        description="Stat tiles jump to filtered views; the Footprints column view icon filters reports by user."
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatTile
            icon={<Users className="w-5 h-5" />}
            label="Users"
            value={users.length}
            hint="Accounts"
            accent="from-sky-400/25 to-cyan-600/20"
            onClick={() => {
              setTab("users");
              setReportUserFilter(null);
              setRequestUserFilter(null);
            }}
            active={tab === "users"}
          />
          <StatTile
            icon={<FileText className="w-5 h-5" />}
            label="Reports"
            value={reports.length}
            hint="All footprints"
            accent="from-amber-400/20 to-orange-500/15"
            onClick={() => goToReports({ userId: null, status: "all" })}
            active={tab === "reports" && reportStatusFilter === "all" && !reportUserFilter}
          />
          <StatTile
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Submitted"
            value={userStats.submitted}
            hint="Finalised"
            accent="from-emerald-400/25 to-teal-600/20"
            onClick={() => goToReports({ userId: null, status: "submitted" })}
            active={tab === "reports" && reportStatusFilter === "submitted" && !reportUserFilter}
          />
          <StatTile
            icon={<FilePenLine className="w-5 h-5" />}
            label="Drafts"
            value={userStats.drafts}
            hint="In progress"
            accent="from-violet-400/20 to-fuchsia-500/15"
            onClick={() => goToReports({ userId: null, status: "draft" })}
            active={tab === "reports" && reportStatusFilter === "draft" && !reportUserFilter}
          />
        </div>
      </PageHero>

      {/* Tabs */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="inline-flex w-full sm:w-max p-1 rounded-2xl bg-gradient-to-r from-trace-cream/90 via-white to-trace-mint/20 border border-trace-sand/70 shadow-sm">
          <TabPill
            active={tab === "users"}
            onClick={() => {
              setTab("users");
              setRequestUserFilter(null);
            }}
            icon={<Users className="w-4 h-4" />}
            label="Users"
            badge={users.length}
          />
          <TabPill
            active={tab === "reports"}
            onClick={() => {
              setTab("reports");
              setRequestUserFilter(null);
            }}
            icon={<ClipboardList className="w-4 h-4" />}
            label="Reports"
            badge={reports.length}
          />
          <TabPill
            active={tab === "requests"}
            onClick={() => setTab("requests")}
            icon={<Inbox className="w-4 h-4" />}
            label="Requests"
            badge={adminRequests.length}
          />
        </div>
      </div>

      {tab === "users" && (
        <div className="rounded-3xl bg-white/90 border border-trace-sand/70 shadow-card overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-trace-sand/70 bg-gradient-to-r from-trace-cream via-white to-trace-mint/30">
            <h2 className="text-sm font-semibold text-trace-forest flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-trace-forest/10 text-trace-forest">
                <Users className="w-4 h-4" />
              </span>
              Directory
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-trace-stone/80 bg-trace-cream/80">
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <User className="w-3.5 h-3.5 text-trace-teal" />
                      Name
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Mail className="w-3.5 h-3.5 text-trace-teal" />
                      Email
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-trace-teal" />
                      School / Dept
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-trace-teal" />
                      Footprints
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <MessageSquare className="w-3.5 h-3.5 text-trace-teal" />
                      Requests
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-trace-teal" />
                      Joined
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-trace-stone text-sm bg-white">
                      No users yet.
                    </td>
                  </tr>
                )}
                {users.map((u, index) => {
                  const userReports = reportsByUser.get(u.id) ?? [];
                  const submitted = userReports.filter((r) => r.status === "submitted").length;
                  const drafts = userReports.length - submitted;
                  const reqN = requestsByUser.get(u.id) ?? 0;
                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        "group align-top transition-colors hover:bg-trace-mint/10",
                        index % 2 === 0 ? "bg-white" : "bg-trace-cream/40"
                      )}
                    >
                      <td className="py-3 px-4 border-b border-trace-sand/50">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-trace-teal/20 to-trace-mint/40 text-trace-forest text-sm font-bold border border-trace-sand/50">
                            {((u.firstName?.[0] ?? u.username[0]) + (u.lastName?.[0] ?? "")).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-trace-forest leading-tight">
                              {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username}
                            </p>
                            <p className="text-xs text-trace-stone">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40 text-trace-stone text-xs sm:text-sm break-all">
                        {u.email}
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40 text-trace-stone text-xs">
                        <p>{u.school ?? "—"}</p>
                        <p className="text-trace-stone/80">{u.department ?? "—"}</p>
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-trace-forest/10 text-trace-forest px-2 py-0.5 text-[11px] font-semibold border border-trace-forest/15">
                            {userReports.length} total
                          </span>
                          {submitted > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 text-emerald-800 px-2 py-0.5 text-[11px] font-medium border border-emerald-200/80">
                              <CheckCircle2 className="w-3 h-3" />
                              {submitted}
                            </span>
                          )}
                          {drafts > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 text-amber-900 px-2 py-0.5 text-[11px] font-medium border border-amber-200/80">
                              <FilePenLine className="w-3 h-3" />
                              {drafts}
                            </span>
                          )}
                          {userReports.length > 0 && (
                            <button
                              type="button"
                              onClick={() => goToReports({ userId: u.id, status: "all" })}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-trace-teal/35 bg-teal-50/90 text-trace-teal hover:bg-teal-100 hover:text-trace-forest transition-colors shrink-0"
                              title="View this user’s reports"
                              aria-label="View this user’s reports"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40">
                        {reqN > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setRequestUserFilter(u.id);
                              setTab("requests");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 text-violet-900 px-2.5 py-1 text-[11px] font-semibold border border-violet-200 hover:bg-violet-500/15 transition-colors"
                          >
                            <Inbox className="w-3.5 h-3.5" />
                            {reqN} open
                          </button>
                        ) : (
                          <span className="text-xs text-trace-stone/60">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40 text-xs text-trace-stone whitespace-nowrap">
                        {format(new Date(u.createdAt), "d MMM yyyy")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="rounded-3xl bg-white/90 border border-trace-sand/70 shadow-card overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-trace-sand/70 bg-gradient-to-r from-trace-cream via-white to-trace-mint/30 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-sm font-semibold text-trace-forest flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-900">
                  <ClipboardList className="w-4 h-4" />
                </span>
                All reports
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "submitted", "draft"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReportStatusFilter(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all",
                      s === "all" && reportStatusFilter === s && "bg-trace-forest text-trace-cream border-trace-forest shadow-sm",
                      s === "submitted" &&
                        reportStatusFilter === s &&
                        "bg-emerald-600 text-white border-emerald-600 shadow-sm",
                      s === "draft" &&
                        reportStatusFilter === s &&
                        "bg-amber-500 text-white border-amber-500 shadow-sm",
                      reportStatusFilter !== s &&
                        "bg-white/80 text-trace-stone border-trace-sand/70 hover:bg-trace-cream/80"
                    )}
                  >
                    {s === "all" && "All"}
                    {s === "submitted" && "Submitted"}
                    {s === "draft" && "Drafts"}
                  </button>
                ))}
              </div>
            </div>
            {reportUserFilter && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-trace-stone">Filtered to user:</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-trace-teal/15 border border-trace-teal/30 pl-3 pr-1 py-1 font-semibold text-trace-forest">
                  {filteredUserLabel}
                  <button
                    type="button"
                    onClick={() => setReportUserFilter(null)}
                    className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] hover:bg-white border border-trace-sand/60"
                  >
                    Clear
                  </button>
                </span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-trace-stone/80 bg-trace-cream/80">
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-trace-teal" />
                      Title
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <User className="w-3.5 h-3.5 text-trace-teal" />
                      Owner
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Hash className="w-3.5 h-3.5 text-trace-teal" />
                      ID
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Send className="w-3.5 h-3.5 text-trace-teal" />
                      Status
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Leaf className="w-3.5 h-3.5 text-trace-teal" />
                      kg CO₂e
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-trace-teal" />
                      Updated
                    </span>
                  </th>
                  <th className="text-center py-3 px-4 border-b border-trace-sand/60 border-l border-trace-sand/50">
                    <span className="inline-flex items-center justify-center gap-1.5 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-trace-teal" />
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-trace-stone text-sm bg-white">
                      No reports match this filter.
                    </td>
                  </tr>
                )}
                {filteredReports.map((r, index) => {
                  const owner = users.find((u) => u.id === r.userId);
                  const isSubmitted = r.status === "submitted";
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "transition-colors hover:bg-trace-mint/10",
                        index % 2 === 0 ? "bg-white" : "bg-trace-cream/40"
                      )}
                    >
                      <td className="py-3 px-4 border-b border-trace-sand/50 font-medium text-trace-forest max-w-[200px]">
                        <span className="line-clamp-2">{r.title}</span>
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40 text-xs text-trace-stone">
                        <p className="font-medium text-trace-forest break-all">
                          {owner?.email ?? r.userId.slice(0, 8) + "…"}
                        </p>
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40 text-xs text-trace-stone whitespace-nowrap">
                        {r.report_id ?? "—"}
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
                            isSubmitted
                              ? "bg-emerald-500/10 text-emerald-800 border-emerald-200"
                              : "bg-amber-500/10 text-amber-900 border-amber-200"
                          )}
                        >
                          {isSubmitted ? "Submitted" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40 text-xs text-trace-stone whitespace-nowrap">
                        {typeof r.totalKgCo2e === "number" ? `${r.totalKgCo2e.toFixed(1)}` : "—"}
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40 text-xs text-trace-stone whitespace-nowrap">
                        {format(new Date(r.updatedAt), "d MMM yyyy")}
                      </td>
                      <td className="py-3 px-4 border-b border-trace-sand/50 border-l border-trace-sand/40">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <Link
                            href={`/app/new-report?reportId=${r.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-200 bg-amber-50/90 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold transition-all"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Link>
                          <Link
                            href={`/app/report/${r.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-teal-200 bg-teal-50/90 text-teal-900 hover:bg-teal-100 text-[11px] font-semibold transition-all"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-4">
          {requestUserFilter && (
            <div className="flex flex-wrap items-center gap-2 text-xs rounded-2xl border border-trace-sand/70 bg-white/90 px-4 py-3 shadow-sm">
              <Inbox className="w-4 h-4 text-violet-600 shrink-0" />
              <span className="text-trace-stone">Showing requests from</span>
              <span className="font-semibold text-trace-forest">{requestFilterLabel}</span>
              <button
                type="button"
                onClick={() => setRequestUserFilter(null)}
                className="ml-auto rounded-full bg-trace-cream border border-trace-sand/70 px-3 py-1 text-[11px] font-semibold text-trace-forest hover:bg-trace-mint/20"
              >
                Show all requests
              </button>
            </div>
          )}
          {adminRequests.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-trace-sand/70 bg-gradient-to-br from-white to-trace-cream/40 p-10 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-trace-mint/30 text-trace-forest mb-4">
                <Inbox className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium text-trace-forest">No admin requests yet</p>
              <p className="text-xs text-trace-stone mt-2 max-w-sm mx-auto">
                When researchers use Request admin, messages will appear here with a clear link back
                to their account and footprints.
              </p>
            </div>
          )}
          {adminRequests.length > 0 && filteredRequests.length === 0 && requestUserFilter && (
            <div className="rounded-2xl border border-trace-sand/70 bg-white p-6 text-center text-sm text-trace-stone">
              No requests from this user with the current filter.
              <button
                type="button"
                onClick={() => setRequestUserFilter(null)}
                className="block mx-auto mt-3 text-xs font-semibold text-trace-teal hover:underline"
              >
                Show all requests
              </button>
            </div>
          )}
          {filteredRequests.map((req, i) => {
            const owner = users.find((u) => u.id === req.userId);
            const name =
              `${req.firstName ?? ""} ${req.lastName ?? ""}`.trim() || req.username;
            return (
              <article
                key={req.id}
                className={cn(
                  "relative rounded-3xl border border-trace-sand/70 bg-white shadow-card overflow-hidden transition-shadow hover:shadow-lg",
                  "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:content-[''] before:bg-gradient-to-b before:from-violet-500 before:to-trace-teal"
                )}
              >
                <div className="pl-5 pr-5 py-5 sm:pl-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-trace-teal/20 text-trace-forest font-bold border border-trace-sand/60">
                        {(name[0] ?? "?").toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-trace-forest leading-snug">{req.subject}</h3>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-trace-stone/70 bg-trace-cream px-2 py-0.5 rounded-full border border-trace-sand/60">
                            {req.type}
                          </span>
                        </div>
                        <p className="text-xs text-trace-stone mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3 h-3 text-trace-teal" />
                            {req.email}
                          </span>
                          <span className="text-trace-sand">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-trace-teal" />
                            {format(new Date(req.createdAt), "d MMM yyyy, HH:mm")}
                          </span>
                        </p>
                        <p className="text-sm text-trace-stone mt-4 whitespace-pre-wrap leading-relaxed border-t border-trace-sand/50 pt-4">
                          {req.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 lg:w-48">
                      <button
                        type="button"
                        onClick={() => goToReports({ userId: req.userId, status: "all" })}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-trace-teal/40 bg-teal-50/80 px-3 py-2 text-xs font-semibold text-teal-900 hover:bg-teal-100/80 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Their reports
                      </button>
                      {owner && (
                        <p className="text-[10px] text-trace-stone/80 leading-snug">
                          Match: {owner.school ?? "—"} · {owner.department ?? "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-2 bg-trace-cream/40 border-t border-trace-sand/50 text-[10px] text-trace-stone/70 font-mono">
                  #{i + 1} · request {req.id.slice(0, 8)}…
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
  accent,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  accent: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border py-2.5 px-3 sm:py-3 sm:px-3.5 transition-all duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-trace-cream/80",
        "bg-gradient-to-br shadow-sm",
        accent,
        active ? "border-white/40 ring-2 ring-white/45" : "border-white/10 hover:border-white/22"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-trace-cream border border-white/10">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-trace-cream/80">
            {label}
          </span>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 leading-tight">
            <span className="text-lg sm:text-xl font-bold tabular-nums text-trace-cream leading-none">{value}</span>
            <span className="text-[11px] text-trace-cream/70">· {hint}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-trace-cream/45 shrink-0 hidden sm:block self-center" aria-hidden />
      </div>
    </button>
  );
}

function TabPill({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
        active
          ? "bg-trace-forest text-trace-cream shadow-md shadow-trace-forest/30"
          : "text-trace-stone hover:bg-white/70"
      )}
    >
      <span className={cn("shrink-0", active ? "text-trace-mint" : "text-trace-teal")}>{icon}</span>
      {label}
      <span
        className={cn(
          "ml-0.5 min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
          active ? "bg-white/20 text-trace-cream" : "bg-trace-sand/60 text-trace-forest"
        )}
      >
        {badge}
      </span>
    </button>
  );
}
