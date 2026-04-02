"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import PageHero from "@/components/layout/PageHero";

export default function FeedbackPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feedback", subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send feedback");
      } else {
        setDone(true);
        setSubject("");
        setMessage("");
      }
    } catch {
      setError("Failed to send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <PageHero
        kicker="TRACE · Feedback"
        title="Give TRACE feedback"
        icon={<MessageCircle className="w-3 h-3" />}
        description="Tell us what works, what's confusing, or what you'd love TRACE to do next. Your input helps shape a better low‑carbon research tool for everyone."
      />
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-trace-sand/60 shadow-card p-5 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            placeholder="e.g. New feature idea, usability issue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-trace-forest mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-trace-sand/70 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-trace-teal focus:border-trace-teal"
            placeholder="Share as much detail as you like…"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {done && (
          <p className="text-sm text-trace-sage bg-trace-mint/15 border border-trace-mint/40 rounded-lg px-3 py-2">
            Thank you — your feedback has been recorded.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-trace-forest text-trace-cream text-sm font-medium hover:bg-trace-sage disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Send feedback</span>
        </button>
      </form>
    </div>
  );
}

