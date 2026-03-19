"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteReportButton({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      setConfirmOpen(false);
      if (res.ok) {
        onDeleted?.();
        router.refresh();
      }
    });
  };

  const dialog = confirmOpen && typeof document !== "undefined" && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !pending && setConfirmOpen(false)}
        aria-hidden
      />
      <div
        className="relative z-[101] rounded-2xl bg-white shadow-2xl border border-trace-sand/60 text-left"
        style={{
          width: "90vw",
          maxWidth: "380px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <div style={{ padding: "1.5rem 1.75rem", boxSizing: "border-box", width: "100%", overflow: "hidden" }}>
          <h2
            id="delete-dialog-title"
            className="text-base sm:text-lg font-semibold text-trace-forest mb-3"
          >
            Delete this report?
          </h2>
          <p
            id="delete-dialog-desc"
            className="text-sm text-trace-stone leading-relaxed mb-6"
            style={{
              margin: 0,
              width: "100%",
              maxWidth: "100%",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              boxSizing: "border-box",
            }}
          >
            This action cannot be undone. The report and all its inputs will be permanently removed.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
              className="px-4 py-2.5 rounded-xl border border-trace-sand/70 bg-white text-trace-forest text-sm font-medium hover:bg-trace-cream/60 disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              Confirm delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 bg-rose-50/90 text-rose-800 hover:bg-rose-100 hover:border-rose-300 hover:shadow-sm text-[11px] font-semibold transition-all duration-200 disabled:opacity-60 disabled:hover:bg-rose-50/90 disabled:hover:shadow-none"
      >
        <Trash2 className="w-3 h-3 shrink-0" />
        <span>Delete</span>
      </button>
      {dialog && createPortal(dialog, document.body)}
    </>
  );
}

