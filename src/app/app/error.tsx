"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-xl font-semibold text-trace-forest mb-2">Something went wrong</h1>
      <p className="text-sm text-trace-stone mb-6">
        An error occurred loading this page. Please try again.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage"
        >
          Try again
        </button>
        <a
          href="/app/dashboard"
          className="px-4 py-2 rounded-xl border border-trace-sand/70 bg-white text-trace-forest text-sm font-medium hover:bg-trace-cream/80"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
