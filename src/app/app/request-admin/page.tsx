 "use client";

import { useEffect, useState } from "react";
import { Shield, Loader2, FileSearch } from "lucide-react";

interface ReportSummary {
  id: string;
  report_id: number | null;
  title: string;
}

type Reason =
  | "project_data_issue"
  | "technical_issue"
  | "sustainability_support"
  | "account_access"
  | "other";

export default function RequestAdminPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [relatedReportId, setRelatedReportId] = useState("");
  const [reason, setReason] = useState<Reason>("project_data_issue");
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) return;
        const data = await res.json();
        const items =
          (data.reports as any[])?.map((r) => ({
            id: r.id as string,
            report_id: (r.report_id as number) ?? null,
            title: r.title as string,
          })) ?? [];
        setReports(items);
      } catch {
        // ignore
      }
    };
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDone(false);
    try {
      const decoratedSubject = `${reasonLabel(reason)}${
        relatedReportId ? ` · Report ${relatedReportId.slice(0, 8)}…` : ""
      } — ${subject || "TRACE admin request"}`;
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "admin", subject: decoratedSubject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send request");
      } else {
        setDone(true);
        setSubject("");
        setMessage("");
        setRelatedReportId("");
        setReason("project_data_issue");
      }
    } catch {
      setError("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="mb-6 w-full rounded-3xl bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal text-trace-cream p-5 sm:p-6 shadow-card relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border border-white/10" />
        <div className="flex items-start justify-between gap-6 relative z-10 w-full">
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold">Request TRACE admin support</h1>
            <p className="text-xs sm:text-sm text-trace-cream/90">
              Reach out to the TRACE admin team to fix project data or report technical issues. You
              can also ask for sustainability guidance on your research footprint.
            </p>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-trace-sand/60 shadow-card p-5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="reason">
              What do you need help with?
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as Reason)}
              className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            >
              <option value="project_data_issue">Project data / footprint issue</option>
              <option value="technical_issue">Technical problem with TRACE</option>
              <option value="sustainability_support">Request sustainability expert support</option>
              <option value="account_access">Account / access issue</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="report">
              Related report (optional)
            </label>
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-trace-teal" />
              <select
                id="report"
                value={relatedReportId}
                onChange={(e) => setRelatedReportId(e.target.value)}
                className="flex-1 rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
              >
                <option value="">No specific report</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} {r.report_id != null ? `(Report ID ${r.report_id})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="subject">
            Short title for your request
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            placeholder="e.g. Emissions from travel look too high"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="message">
            Details
          </label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            placeholder="Explain what you need help with. Include context, steps to reproduce any issues, and what a good outcome looks like."
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {done && (
          <p className="text-sm text-trace-sage bg-trace-mint/15 border border-trace-mint/40 rounded-lg px-3 py-2">
            Thank you — your request has been sent to the admin team.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Send request</span>
        </button>
      </form>
    </div>
  );
}

function reasonLabel(reason: Reason): string {
  switch (reason) {
    case "project_data_issue":
      return "Project data / footprint issue";
    case "technical_issue":
      return "Technical problem";
    case "sustainability_support":
      return "Request sustainability support";
    case "account_access":
      return "Account / access issue";
    case "other":
    default:
      return "Other";
  }
}


