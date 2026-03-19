/**
 * TRACE — Report export (print-friendly HTML).
 * Opens report in new tab; user can Print → Save as PDF. Uses selected interpretation mode.
 */

import type { TraceResult } from "../../types";
import type { InterpretationId } from "../../interpretations";
import { interpret, getMode, INTERPRETATION_METHODOLOGY } from "../../interpretations";
import {
  EMISSION_FACTORS,
  METHODOLOGY_INTRO,
  METHODOLOGY_SOURCES,
} from "../../methodology";
import {
  formatPercentage,
  CONFIDENCE_LABELS,
  EASE_LABELS,
} from "../../utils";
import { format } from "date-fns";

const baseStyles = `
  body { font-family: system-ui, sans-serif; max-width: 700px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.5; }
  h1 { font-size: 1.5rem; margin-bottom: 4px; }
  h2 { font-size: 1.1rem; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #ddd; }
  .meta { color: #666; font-size: 0.9rem; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
  th { color: #666; font-weight: 600; }
  .footnote { font-size: 0.8rem; color: #666; margin-top: 24px; }
  @media print { body { padding: 16px; } .no-print { display: none; } }
  .no-print { margin-top: 16px; padding: 12px; background: #f0f7f0; border-radius: 8px; font-size: 0.9rem; }
  .methodology-table { font-size: 0.8rem; }
  .methodology-table th, .methodology-table td { padding: 4px 6px; }
`;

function openPrintWindow(html: string, title: string): void {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Please allow pop-ups to open the report.");
    return;
  }
  w.document.write(html);
  w.document.title = title;
  w.document.close();
  w.setTimeout(() => w.print(), 250);
}

function fullReportHTML(result: TraceResult, interpretationMode: InterpretationId): string {
  const metaLine = `${result.projectTitle} · ${format(new Date(result.calculatedAt), "d MMM yyyy")}`;
  const confidence = CONFIDENCE_LABELS[result.confidence] ?? result.confidence;
  const modeLabel = getMode(interpretationMode)?.shortLabel ?? interpretationMode;

  const totalF = interpret(result.totalKgCo2e, interpretationMode);
  const reductionF = interpret(result.reductionPotentialKgCo2e, interpretationMode);
  const residualF = interpret(result.totalAfterReductions, interpretationMode);

  const categoriesByShare = [...result.categories].sort((a, b) => b.kgCo2e - a.kgCo2e);
  const rows = categoriesByShare
    .map((c) => {
      const f = interpret(c.kgCo2e, interpretationMode);
      return `<tr><td>${escapeHtml(c.label)}</td><td>${escapeHtml(f.formatted)}</td><td>${formatPercentage(c.percentage)}</td></tr>`;
    })
    .join("");

  const reductionsByImpact = [...result.reductionOpportunities].sort(
    (a, b) => b.potentialSavingKgCo2e - a.potentialSavingKgCo2e
  );
  const reductions = reductionsByImpact
    .slice(0, 5)
    .map((r) => {
      const f = interpret(r.potentialSavingKgCo2e, interpretationMode);
      return `<tr><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.suggestedAction)}</td><td>−${escapeHtml(f.formatted)}</td><td>${EASE_LABELS[r.ease] ?? r.ease}</td></tr>`;
    })
    .join("");

  // Avoid spreading a Set for TS compatibility with older downlevel targets.
  const methodologyCategories: string[] = [];
  const seen: Record<string, true> = {};
  EMISSION_FACTORS.forEach((r) => {
    if (!seen[r.category]) {
      seen[r.category] = true;
      methodologyCategories.push(r.category);
    }
  });
  const methodologyEmissionTables = methodologyCategories
    .map((cat) => {
      const catRows = EMISSION_FACTORS.filter((r) => r.category === cat);
      const body = catRows
        .map(
          (r) =>
            `<tr><td>${escapeHtml(r.input)}</td><td>${escapeHtml(r.unit)}</td><td>${escapeHtml(r.factor)}</td><td>${escapeHtml(r.note ?? "—")}</td></tr>`
        )
        .join("");
      return `<h3 style="font-size:0.95rem;margin-top:12px;margin-bottom:4px;">${escapeHtml(cat)}</h3>
<table class="methodology-table"><thead><tr><th>Input</th><th>Unit</th><th>Factor</th><th>Note</th></tr></thead><tbody>${body}</tbody></table>`;
    })
    .join("");
  const methodologyInterpretationRows = INTERPRETATION_METHODOLOGY.map(
    (m) =>
      `<tr><td>${escapeHtml(m.shortLabel)}</td><td>${escapeHtml(m.formula)}</td><td>${escapeHtml(m.source)}</td></tr>`
  ).join("");
  const methodologySectionHtml = `
<h2>How we obtained these results</h2>
<p>${escapeHtml(METHODOLOGY_INTRO)}</p>
<h3 style="font-size:1rem;margin-top:16px;">Emission factors (kg CO₂e per unit of input)</h3>
<p class="meta">Each input is multiplied by the factor below to get kg CO₂e.</p>
${methodologyEmissionTables}
<h3 style="font-size:1rem;margin-top:16px;">Interpretation units</h3>
<p class="meta">Conversions from kg CO₂e:</p>
<table class="methodology-table">
<thead><tr><th>Unit</th><th>Formula</th><th>Source</th></tr></thead>
<tbody>${methodologyInterpretationRows}</tbody>
</table>
<p class="footnote" style="margin-top:12px;">${escapeHtml(METHODOLOGY_SOURCES)}</p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>
<h1>TRACE — Carbon Footprint Report</h1>
<p class="meta">${escapeHtml(metaLine)}</p>
<p class="meta">Values shown in: <strong>${escapeHtml(modeLabel)}</strong></p>

<h2>Summary</h2>
<table>
<tr><th>Total footprint</th><td>${escapeHtml(totalF.formatted)}</td></tr>
<tr><th>Largest source</th><td>${result.largestCategory.shortLabel} (${formatPercentage(result.largestCategory.percentage)})</td></tr>
<tr><th>Reduction potential</th><td>−${escapeHtml(reductionF.formatted)}</td></tr>
<tr><th>Residual after changes</th><td>${escapeHtml(residualF.formatted)}</td></tr>
<tr><th>Confidence</th><td>${confidence}</td></tr>
</table>

<h2>Breakdown by category</h2>
<table>
<thead><tr><th>Category</th><th>Value (${escapeHtml(modeLabel)})</th><th>%</th></tr></thead>
<tbody>${rows}</tbody>
</table>

<h2>Top reduction opportunities</h2>
<table>
<thead><tr><th>Area</th><th>Suggested action</th><th>Potential saving</th><th>Effort</th></tr></thead>
<tbody>${reductions}</tbody>
</table>

<p class="footnote">${escapeHtml(result.uncertaintyNote)}</p>

${methodologySectionHtml}

<div class="no-print">Use your browser’s <strong>Print</strong> (Ctrl+P / Cmd+P) and choose <strong>Save as PDF</strong> to save this report as a PDF.</div>
</body></html>`;
}

function supervisorHTML(result: TraceResult, interpretationMode: InterpretationId): string {
  const confidence = CONFIDENCE_LABELS[result.confidence] ?? result.confidence;
  const top = result.reductionOpportunities[0];
  const modeLabel = getMode(interpretationMode)?.shortLabel ?? interpretationMode;
  const totalF = interpret(result.totalKgCo2e, interpretationMode);
  const residualF = interpret(result.totalAfterReductions, interpretationMode);
  const topSavingF = top ? interpret(top.potentialSavingKgCo2e, interpretationMode) : null;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>
<h1>TRACE — Supervisor summary</h1>
<p class="meta">${escapeHtml(result.projectTitle)}</p>
<p class="meta">Values shown in: <strong>${escapeHtml(modeLabel)}</strong></p>

<h2>Headline footprint</h2>
<p style="font-size: 1.5rem; font-weight: bold;">${escapeHtml(totalF.formatted)}</p>
<table>
<tr><th>Key driver</th><td>${result.largestCategory.shortLabel} (${formatPercentage(result.largestCategory.percentage)})</td></tr>
<tr><th>Residual after reductions</th><td>${escapeHtml(residualF.formatted)}</td></tr>
<tr><th>Confidence</th><td>${confidence}</td></tr>
</table>

<h2>Recommended action</h2>
${top && topSavingF ? `<p>${escapeHtml(top.title)}: ${escapeHtml(top.suggestedAction)} — potential saving ${escapeHtml(topSavingF.formatted)}</p>` : "<p>—</p>"}

<p class="footnote">${escapeHtml(result.uncertaintyNote)}</p>
<div class="no-print">Use <strong>Print</strong> (Ctrl+P / Cmd+P) → <strong>Save as PDF</strong> to save.</div>
</body></html>`;
}

function thesisAppendixHTML(result: TraceResult, interpretationMode: InterpretationId): string {
  const metaLine = `${result.projectTitle} · ${format(new Date(result.calculatedAt), "d MMM yyyy")}`;
  const modeLabel = getMode(interpretationMode)?.shortLabel ?? interpretationMode;
  const totalF = interpret(result.totalKgCo2e, interpretationMode);
  const residualF = interpret(result.totalAfterReductions, interpretationMode);

  const assumptionRows = result.assumptions
    .map(
      (a) =>
        `<tr><td>${escapeHtml(a.label)}</td><td>${escapeHtml(a.value)}${a.source ? ` (${escapeHtml(a.source)})` : ""}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>
<h1>Appendix: Carbon footprint methodology (TRACE)</h1>
<p class="meta">${escapeHtml(metaLine)}</p>
<p class="meta">Values shown in: <strong>${escapeHtml(modeLabel)}</strong></p>

<h2>Methodology</h2>
<p>This footprint was estimated using TRACE (Tool for Research Accounting of Carbon &amp; Emissions). The system boundary and emission factors are described below.</p>

<h2>Inputs and assumptions</h2>
<table>
<thead><tr><th>Assumption</th><th>Value</th></tr></thead>
<tbody>${assumptionRows}</tbody>
</table>

<h2>Results summary</h2>
<table>
<tr><th>Total estimated footprint</th><td>${escapeHtml(totalF.formatted)}</td></tr>
<tr><th>Residual after feasible reductions</th><td>${escapeHtml(residualF.formatted)}</td></tr>
</table>

<p class="footnote">Limitations: ${escapeHtml(result.uncertaintyNote)}</p>
<div class="no-print">Use <strong>Print</strong> (Ctrl+P / Cmd+P) → <strong>Save as PDF</strong> to save as PDF.</div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadPDFReport(result: TraceResult, interpretationMode: InterpretationId): Promise<void> {
  openPrintWindow(fullReportHTML(result, interpretationMode), "TRACE Carbon Footprint Report");
  return Promise.resolve();
}

export function downloadSupervisorPDF(result: TraceResult, interpretationMode: InterpretationId): Promise<void> {
  openPrintWindow(supervisorHTML(result, interpretationMode), "TRACE Supervisor Summary");
  return Promise.resolve();
}

export function downloadThesisAppendixPDF(result: TraceResult, interpretationMode: InterpretationId): Promise<void> {
  openPrintWindow(thesisAppendixHTML(result, interpretationMode), "TRACE Thesis Appendix");
  return Promise.resolve();
}
