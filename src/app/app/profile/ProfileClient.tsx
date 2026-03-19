"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Leaf } from "lucide-react";

interface ProfileClientProps {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    school: string | null;
    department: string | null;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [localUser, setLocalUser] = useState(user);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const initial =
    (localUser.firstName?.[0] || localUser.username[0] || "?").toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localUser),
      });
      const data = await res.json();
      if (res.ok) {
        setLocalUser((prev) => ({ ...prev, ...data }));
        setMessage("Profile updated.");
        setEditing(false);
      } else {
        setMessage(data.error || "Failed to update profile.");
      }
    } catch {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="mb-6 w-full rounded-3xl bg-gradient-to-r from-trace-forest via-trace-mint to-trace-teal text-trace-cream p-5 sm:p-6 shadow-card relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border border-white/10" />
        <div className="flex items-start justify-between gap-6 relative z-10 w-full">
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold">Your TRACE profile</h1>
            <p className="text-xs sm:text-sm text-trace-cream/90">
              Control how your name and affiliation appear across TRACE. This helps supervisors and
              admins recognise your research footprint in shared dashboards.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-trace-sand/60 shadow-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-trace-mint text-white flex items-center justify-center font-semibold text-lg">
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-trace-forest">
              {localUser.firstName || localUser.lastName
                ? `${localUser.firstName ?? ""} ${localUser.lastName ?? ""}`.trim()
                : localUser.username}
            </p>
            <p className="text-xs text-trace-stone">{localUser.email}</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editing) void handleSave();
          }}
          className="space-y-3 text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="First name"
              value={localUser.firstName ?? ""}
              onChange={(v) => setLocalUser((u) => ({ ...u, firstName: v }))}
              readOnly={!editing}
            />
            <Field
              label="Last name"
              value={localUser.lastName ?? ""}
              onChange={(v) => setLocalUser((u) => ({ ...u, lastName: v }))}
              readOnly={!editing}
            />
          </div>
          <Field
            label="Username"
            value={localUser.username}
            onChange={(v) => setLocalUser((u) => ({ ...u, username: v }))}
            readOnly={!editing}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="School"
              value={localUser.school ?? ""}
              onChange={(v) => setLocalUser((u) => ({ ...u, school: v }))}
              readOnly={!editing}
            />
            <Field
              label="Department"
              value={localUser.department ?? ""}
              onChange={(v) => setLocalUser((u) => ({ ...u, department: v }))}
              readOnly={!editing}
            />
          </div>
          <p className="text-xs text-trace-stone">
            Email is fixed for this account. Contact admin if you need to change your institutional
            address.
          </p>
          {message && (
            <p className="text-xs text-trace-sage bg-trace-mint/10 border border-trace-mint/40 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            {editing ? (
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-trace-mint text-white text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save profile"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setLocalUser(user);
                    setEditing(false);
                    setMessage(null);
                  }}
                  className="text-xs text-trace-stone hover:text-trace-forest"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage"
              >
                Edit profile
              </button>
            )}
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-trace-sand/70 text-trace-forest text-sm font-medium hover:bg-trace-sand/40 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-trace-forest mb-0.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal ${
          readOnly ? "bg-trace-cream/40 cursor-default" : ""
        }`}
      />
    </div>
  );
}

