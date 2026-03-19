/**
 * Standalone Node script to generate full TRACE report PDF (vector, editable).
 * Usage: node scripts/generate-report-pdf.js <inputJsonPath> <outputPdfPath>
 * Input JSON: { result, interpretationMode, formatted: { total, residual, reduction, modeLabel, ... } }
 * Does not use Next.js or Turbopack — safe for pdfkit.
 */

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const MARGIN = 50;
const PAGE_W = 595;
const PAGE_H = 842;
const CONTENT_W = PAGE_W - MARGIN * 2;
let y = MARGIN;
let doc;

function checkPageBreak(need) {
  if (y + need > PAGE_H - MARGIN) {
    doc.addPage();
    y = MARGIN;
  }
}

function sectionTitle(text) {
  checkPageBreak(40);
  doc.fontSize(16).fillColor("#1a3d2e").font("Helvetica-Bold").text(text, MARGIN, y);
  y += 24;
}

function bodyText(text, opts = {}) {
  const { bold, size = 10, color = "#374151" } = opts;
  checkPageBreak(20);
  doc.fontSize(size).fillColor(color);
  doc.font(bold ? "Helvetica-Bold" : "Helvetica");
  doc.text(text, MARGIN, y, { width: CONTENT_W, continued: false });
  y += doc.heightOfString(text, { width: CONTENT_W }) + 4;
}

function cardLabel(text) {
  doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text(text, MARGIN, y);
  y += 14;
}

function cardValue(text, large = false) {
  doc.fontSize(large ? 18 : 11).fillColor("#1a3d2e").font("Helvetica-Bold").text(text, MARGIN, y);
  y += (large ? 22 : 16);
}

function hLine() {
  doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).stroke();
  y += 16;
}

function tableRow(cells, isHeader = false) {
  checkPageBreak(22);
  const colW = CONTENT_W / cells.length;
  doc.fontSize(isHeader ? 9 : 9).fillColor(isHeader ? "#374151" : "#4b5563").font(isHeader ? "Helvetica-Bold" : "Helvetica");
  let x = MARGIN;
  cells.forEach((cell, i) => {
    doc.text(String(cell), x, y, { width: colW - 8 });
    x += colW;
  });
  y += 20;
}

function tableRowWrapped(cells, colWidths) {
  checkPageBreak(28);
  doc.fontSize(9).fillColor("#4b5563").font("Helvetica");
  let x = MARGIN;
  cells.forEach((cell, i) => {
    const w = colWidths[i];
    doc.text(String(cell), x, y, { width: w - 8 });
    x += w;
  });
  y += 22;
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    process.stderr.write("Usage: node generate-report-pdf.js <inputJsonPath> <outputPdfPath>\n");
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const { result, formatted } = payload;
  if (!result || !formatted) {
    process.stderr.write("Invalid payload: need result and formatted\n");
    process.exit(1);
  }

  doc = new PDFDocument({ margin: 0, size: "A4" });
  const out = fs.createWriteStream(outputPath);
  doc.pipe(out);

  // ----- Title block -----
  doc.fontSize(20).fillColor("#1a3d2e").font("Helvetica-Bold").text("TRACE — Carbon footprint", MARGIN, y);
  y += 28;
  doc.fontSize(14).fillColor("#374151").font("Helvetica").text(result.projectTitle || "Untitled report", MARGIN, y);
  y += 20;
  doc.fontSize(10).fillColor("#6b7280").text(`Values shown in: ${formatted.modeLabel}`, MARGIN, y);
  y += 14;
  doc.text(`Date: ${formatted.dateLabel || "—"}  ·  Stage: ${formatted.stageLabel || "—"}  ·  Confidence: ${formatted.confidenceLabel || "—"}`, MARGIN, y);
  y += 24;
  hLine();

  // ----- Footprint overview -----
  sectionTitle("Footprint overview");
  const cardH = 72;
  const colW = CONTENT_W / 4;
  const cards = [
    { label: "Total estimated footprint", value: formatted.total, level: formatted.emissionLevelLabel },
    { label: "Largest source", value: `${result.largestCategory?.shortLabel || "—"} (${formatted.largestCategoryPct || "—"})` },
    { label: "Reduction potential", value: `−${formatted.reduction}` },
    { label: "Residual (for offset)", value: formatted.residual },
  ];
  cards.forEach((c, i) => {
    const x = MARGIN + i * colW + 4;
    doc.roundedRect(x, y, colW - 8, cardH, 4).fillAndStroke("#f0fdf4", "#d1fae5");
    doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text(c.label, x + 8, y + 8, { width: colW - 24 });
    doc.fontSize(11).fillColor("#1a3d2e").font("Helvetica-Bold").text(c.value, x + 8, y + 26, { width: colW - 24 });
    if (c.level) doc.fontSize(9).fillColor("#059669").text(c.level, x + 8, y + 46, { width: colW - 24 });
  });
  y += cardH + 20;

  // ----- Breakdown by category -----
  sectionTitle("Breakdown by category");
  tableRow(["Category", "Value", "% share"], true);
  doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).stroke();
  y += 8;
  (formatted.categories || []).forEach((row) => {
    tableRowWrapped([row.label, row.formatted, row.percentage], [CONTENT_W * 0.5, CONTENT_W * 0.3, CONTENT_W * 0.2]);
  });
  y += 12;

  // ----- Reduction opportunities -----
  sectionTitle("Top reduction opportunities");
  tableRow(["Area", "Suggested action", "Potential saving", "Effort"], true);
  doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).stroke();
  y += 8;
  (formatted.reductionOpportunities || []).slice(0, 8).forEach((row) => {
    tableRowWrapped([row.title, row.suggestedAction, row.formatted, row.ease], [CONTENT_W * 0.22, CONTENT_W * 0.38, CONTENT_W * 0.22, CONTENT_W * 0.18]);
  });
  y += 16;

  // ----- Scenario comparison -----
  sectionTitle("Scenario comparison");
  bodyText("Measure → Reduce → Recalculate. Only then consider offsetting the residual.", { size: 10, color: "#6b7280" });
  y += 8;
  const scenarioW = CONTENT_W / 3;
  ["Current footprint", "Potential reduction", "Residual (for offset)"].forEach((label, i) => {
    const x = MARGIN + i * scenarioW + 6;
    doc.roundedRect(x, y, scenarioW - 12, 58, 4).fillAndStroke(i === 0 ? "#f0fdf4" : i === 1 ? "#ccfbf1" : "#ecfdf5", "#99f6e4");
    doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text(label, x + 10, y + 8, { width: scenarioW - 32 });
    const val = i === 0 ? formatted.scenarioCurrent : i === 1 ? formatted.scenarioReduction : formatted.scenarioResidual;
    doc.fontSize(12).fillColor("#1a3d2e").font("Helvetica-Bold").text(val || "—", x + 10, y + 26, { width: scenarioW - 32 });
  });
  y += 70;

  // ----- Interpretation note -----
  checkPageBreak(40);
  doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text("Offsetting should only be considered for residual emissions that cannot reasonably be avoided within the scope of the doctoral project.", MARGIN, y, { width: CONTENT_W });
  y += 36;

  // ----- Assumptions (if any) -----
  if (result.assumptions && result.assumptions.length > 0) {
    sectionTitle("Inputs and assumptions");
    result.assumptions.forEach((a) => {
      bodyText(`${a.label}: ${a.value}${a.source ? ` (${a.source})` : ""}`, { size: 9 });
    });
    y += 12;
  }

  // ----- Uncertainty note -----
  if (result.uncertaintyNote) {
    sectionTitle("Notes");
    doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text(result.uncertaintyNote, MARGIN, y, { width: CONTENT_W });
  }

  doc.end();
  out.on("finish", () => process.exit(0));
  out.on("error", (err) => {
    process.stderr.write(String(err));
    process.exit(1);
  });
}

main();
