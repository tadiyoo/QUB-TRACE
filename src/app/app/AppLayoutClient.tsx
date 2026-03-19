"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, LayoutDashboard, MessageCircle, Shield, Leaf } from "lucide-react";
import Link from "next/link";
import SidebarUserPanel from "./SidebarUserPanel";

type User = {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  school: string | null;
  department: string | null;
};

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((res) => {
        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-trace-cream via-white to-trace-mint/30">
        <p className="text-trace-stone">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-trace-cream via-white to-trace-mint/30 overflow-hidden">
      <aside className="w-72 bg-gradient-to-b from-trace-forest via-trace-mint to-trace-forest text-trace-cream border-r border-trace-sand/60 flex flex-col justify-between py-5 px-4 backdrop-blur-sm flex-shrink-0">
        <div>
          <SidebarUserPanel user={user} />
          <nav className="mt-4 space-y-2">
            <NavItem href="/app/new-report" icon={<FilePlus2 className="w-4 h-4" />} label="New report" />
            <NavItem href="/app/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
            <NavItem href="/app/feedback" icon={<MessageCircle className="w-4 h-4" />} label="Give feedback" />
            <NavItem href="/app/request-admin" icon={<Shield className="w-4 h-4" />} label="Request admin" />
          </nav>
        </div>
        <div className="px-2 text-[11px] text-trace-cream/85">
          <img
            src="/qub-logo.png"
            alt="Queen's University Belfast logo"
            className="block w-full h-auto"
          />
          <div className="mt-2 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-trace-forest text-trace-cream shadow-md shadow-black/40 border border-white/10">
              <Leaf className="w-3.5 h-3.5 text-trace-mint" />
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase">Trace</span>
              <span className="text-[11px] text-trace-cream whitespace-nowrap">
                Research Carbon Footprint
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-16 border-b border-trace-sand/60 bg-gradient-to-r from-white via-trace-mint/10 to-white backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shadow-sm shadow-trace-mint/30">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/85 border border-trace-sand/60 shadow-card">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-trace-forest text-trace-cream shadow-md shadow-trace-forest/40">
              <Leaf className="w-4 h-4 text-trace-mint" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-trace-forest">
                Trace
              </span>
              <span className="text-[11px] text-trace-stone/80">
                Tool for Research Accounting of Carbon &amp; Emissions
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-trace-stone/80">
            <span className="px-3 py-1 rounded-full bg-trace-cream/80 border border-trace-sand/70">
              TRACE · Research Carbon Footprint dashboard
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
        <footer className="h-10 border-t border-trace-sand/60 bg-gradient-to-r from-trace-cream/80 via-white to-trace-mint/20 px-4 sm:px-6 flex items-center justify-center text-[10px] sm:text-[11px] text-trace-stone/80">
          <div className="text-center">
            <span>Prototype dashboard for doctoral and research project emissions.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-trace-cream/90 bg-white/5 hover:bg-white/15 border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-all"
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/25 text-trace-mint shadow-inner">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
