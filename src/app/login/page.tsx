"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/app/dashboard");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-trace-forest via-trace-mint to-trace-cream">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_55%),radial-gradient(circle_at_bottom,_#00000020,_transparent_55%)]" />
      <div className="relative z-10 max-w-5xl w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        <div className="text-center text-trace-cream">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-7 h-7" />
            <span className="text-sm uppercase tracking-wide">TRACE · QUB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold mb-2">
            TRACE — Research Carbon Footprint
          </h1>
          <p className="text-xs sm:text-sm text-trace-cream/90 max-w-2xl mx-auto">
            Build carbon footprint reports for your research projects, explore emissions hotspots,
            and export supervisor-ready summaries.
          </p>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-0 max-w-5xl mx-auto rounded-3xl bg-white/90 shadow-card overflow-hidden border border-trace-sand/70 lg:min-h-[380px]">
          <div className="hidden lg:block lg:w-1/2 bg-gradient-to-b from-trace-forest via-trace-mint to-trace-forest">
            <div className="h-full flex items-center justify-center p-0">
              <div className="h-full w-full overflow-hidden">
                <img
                  src="/carbon-calculator2.png"
                  alt="TRACE carbon calculator illustration"
                  className="block w-full h-full object-cover object-right"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 lg:w-1/2">
            <div className="h-full bg-white/95 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-trace-forest mb-1">Welcome back</h2>
              <p className="text-sm text-trace-stone mb-5">
                Enter your QUB email and password to continue.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                    placeholder="you@qub.ac.uk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium py-2.5 mt-2 hover:bg-trace-sage transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Log in</span>
                </button>
              </form>
              <p className="mt-4 text-xs text-trace-stone">
                New to TRACE?{" "}
                <button
                  type="button"
                  className="text-trace-teal underline underline-offset-2"
                  onClick={() => router.push("/register")}
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

