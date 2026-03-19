"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface SidebarUserPanelProps {
  user: {
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    school: string | null;
    department: string | null;
  };
}

export default function SidebarUserPanel({ user }: SidebarUserPanelProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const name =
    user.firstName || user.lastName
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user.username;
  const initial = (user.firstName?.[0] || user.username[0] || "?").toUpperCase();

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
    <div className="flex items-center gap-3 mb-4 px-2">
      <button
        type="button"
        onClick={() => router.push("/app/profile")}
        className="w-9 h-9 rounded-full bg-trace-mint text-white flex items-center justify-center font-semibold shadow-lg shadow-black/30 ring-2 ring-white/10 hover:ring-trace-mint/70 transition-all"
      >
        {initial}
      </button>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-trace-cream truncate">
          {name}
        </p>
        <p className="text-xs text-trace-cream/70 truncate">{user.email}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="ml-auto p-1.5 rounded-full hover:bg-white/10 text-trace-cream disabled:opacity-60 transition-colors"
        title="Log out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}

