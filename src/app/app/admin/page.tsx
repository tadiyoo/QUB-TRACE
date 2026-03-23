"use client";

import { useEffect, useMemo, useState } from "react";

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

  const userStats = useMemo(() => {
    const submitted = reports.filter((r) => r.status === "submitted").length;
    const drafts = reports.length - submitted;
    return { submitted, drafts };
  }, [reports]);

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <p className="text-trace-stone">Loading admin console…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="mb-5 rounded-3xl bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal text-trace-cream p-6 shadow-card">
        <h1 className="text-2xl sm:text-3xl font-semibold">Admin Console</h1>
        <p className="text-sm text-trace-cream/90 mt-1">
          Manage users, inspect reports, and review admin support requests.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
          <StatCard label="Users" value={users.length} />
          <StatCard label="Reports" value={reports.length} />
          <StatCard label="Submitted" value={userStats.submitted} />
          <StatCard label="Drafts" value={userStats.drafts} />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <TabBtn active={tab === "users"} onClick={() => setTab("users")} label="Users" />
        <TabBtn active={tab === "reports"} onClick={() => setTab("reports")} label="Reports" />
        <TabBtn active={tab === "requests"} onClick={() => setTab("requests")} label="Requests" />
      </div>

      {tab === "users" && (
        <div className="rounded-2xl border border-trace-sand/60 bg-white shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-trace-cream/70 text-trace-stone">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">School / Department</th>
                <th className="text-left px-3 py-2">Reports</th>
                <th className="text-left px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const userReports = reportsByUser.get(u.id) ?? [];
                return (
                  <tr key={u.id} className="border-t border-trace-sand/50 align-top">
                    <td className="px-3 py-2">
                      <p className="font-medium text-trace-forest">
                        {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username}
                      </p>
                      <p className="text-xs text-trace-stone">@{u.username}</p>
                    </td>
                    <td className="px-3 py-2 text-trace-stone">{u.email}</td>
                    <td className="px-3 py-2 text-trace-stone">
                      <p>{u.school ?? "—"}</p>
                      <p className="text-xs">{u.department ?? "—"}</p>
                    </td>
                    <td className="px-3 py-2 text-trace-stone">{userReports.length}</td>
                    <td className="px-3 py-2 text-trace-stone">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reports" && (
        <div className="rounded-2xl border border-trace-sand/60 bg-white shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-trace-cream/70 text-trace-stone">
              <tr>
                <th className="text-left px-3 py-2">Title</th>
                <th className="text-left px-3 py-2">User</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Total kg CO2e</th>
                <th className="text-left px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const owner = users.find((u) => u.id === r.userId);
                return (
                  <tr key={r.id} className="border-t border-trace-sand/50">
                    <td className="px-3 py-2 text-trace-forest font-medium">{r.title}</td>
                    <td className="px-3 py-2 text-trace-stone">{owner?.email ?? r.userId}</td>
                    <td className="px-3 py-2 text-trace-stone">{r.status}</td>
                    <td className="px-3 py-2 text-trace-stone">{r.totalKgCo2e ?? "—"}</td>
                    <td className="px-3 py-2 text-trace-stone">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-3">
          {adminRequests.length === 0 && (
            <div className="rounded-xl border border-trace-sand/60 bg-white p-4 text-sm text-trace-stone">
              No admin requests yet.
            </div>
          )}
          {adminRequests.map((req) => (
            <article
              key={req.id}
              className="rounded-2xl border border-trace-sand/60 bg-white p-4 shadow-card"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-trace-forest">{req.subject}</h3>
                  <p className="text-xs text-trace-stone mt-1">
                    {req.email} · {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-trace-stone mt-3 whitespace-pre-wrap">{req.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm border transition ${
        active
          ? "bg-trace-forest text-trace-cream border-trace-forest"
          : "bg-white text-trace-stone border-trace-sand/70 hover:bg-trace-cream/60"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 p-3">
      <p className="text-xs text-trace-cream/85">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

