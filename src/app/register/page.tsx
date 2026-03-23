"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    school: "",
    department: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        router.push("/app");
      }
    } catch (_err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  }

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
                  className="block w-full h-full object-cover object-[75%_center]"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 lg:w-1/2">
            <div className="h-full bg-white/95 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-trace-forest mb-1">Create account</h2>
              <p className="text-sm text-trace-stone mb-5">
                Use your university email address so we can link reports to your institution.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium text-trace-forest mb-1"
                      htmlFor="firstName"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-trace-forest mb-1"
                      htmlFor="lastName"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-trace-forest mb-1"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                    placeholder="tmamo01"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium text-trace-forest mb-1"
                      htmlFor="school"
                    >
                      School
                    </label>
                    <input
                      id="school"
                      name="school"
                      value={form.school}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                      placeholder="School of Medicine, Dentistry and Biomedical Sciences"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-trace-forest mb-1"
                      htmlFor="department"
                    >
                      Department
                    </label>
                    <input
                      id="department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                      placeholder="e.g. AI & Data Science"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-trace-forest mb-1"
                    htmlFor="email"
                  >
                    University email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
                    placeholder="you@qub.ac.uk"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-trace-forest mb-1"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
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
                  <span>Create account</span>
                </button>
              </form>
              <p className="mt-4 text-xs text-trace-stone">
                Already using TRACE?{" "}
                <button
                  type="button"
                  className="text-trace-teal underline underline-offset-2"
                  onClick={() => router.push("/login")}
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

