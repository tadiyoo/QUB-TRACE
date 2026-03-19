"use client";

/**
 * Root error boundary. Kept minimal and does not use next/navigation
 * to avoid "Cannot read properties of null (reading 'useContext')" when
 * Next's router context is unavailable during error recovery.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ fontFamily: "system-ui", margin: 0, padding: 24, minHeight: "100vh", background: "#f5f0e8", color: "#0d3b2c" }}>
      <div style={{ maxWidth: 480, margin: "48px auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: 24 }}>
          An error occurred. Please try again or go back to the dashboard.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: "none",
              background: "#0d3b2c",
              color: "#f5f0e8",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/app/dashboard"
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: "1px solid #d4c4a8",
              background: "#fff",
              color: "#0d3b2c",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
