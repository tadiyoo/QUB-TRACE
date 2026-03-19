# TRACE Dashboard

**Tool for Research Accounting of Carbon & Emissions** — Web dashboard for PhD research project carbon footprint results.

Part of the TRACE Tool Project at Queen's University Belfast (Team D: Outputs & Dashboard).

## Features

- **Footprint overview** — Total CO₂e, largest source, reduction potential, residual, confidence
- **Emissions breakdown** — Donut and bar charts by category, expandable details
- **Reduction opportunities** — Ranked interventions with suggested actions and potential savings
- **Scenario comparison** — Current vs reduced vs residual (measure → reduce → then offset)
- **Assumptions & transparency** — Emission factor sources, uncertainty note, data quality
- **Export & reports** — PDF (full report, supervisor one-pager, thesis appendix), CSV, JSON

Behavioural nudges are built in: reduction-first messaging, comparative framing, and transparency prompts.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **ECharts** (via `echarts-for-react`) for charts
- **@react-pdf/renderer** for PDF exports
- **Lucide React** for icons

## Getting started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard loads with sample data; in production this would come from Team C’s calculation API.

## Build & run production

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/           — Layout, globals, main page
  components/
    dashboard/   — Header, FootprintOverview, EmissionsBreakdown, etc.
    charts/      — DonutChart, BarChart (ECharts)
  lib/
    types.ts     — TraceResult and related types
    mockData.ts  — Sample result (replace with API in production)
    utils.ts     — formatKgCo2e, STAGE_LABELS, etc.
    chartTheme.ts — ECharts options and TRACE colours
    exports/
      pdf/       — PDF templates and download helpers
      csv.ts     — CSV export
      json.ts    — JSON export
```

## Integrating with Teams A–C

- **Team A:** Use their system boundary and user scenarios to label and scope what appears in the dashboard.
- **Team B:** Map their input hierarchy and project stage to the header and any future “edit inputs” flow.
- **Team C:** Consume their calculation API (e.g. FastAPI) and replace `mockTraceResult` with the API response; keep the same `TraceResult` type for compatibility.

## Export formats

| Format | Use case |
|--------|----------|
| Full PDF report | Documentation, sharing |
| Supervisor one-pager | Quick review |
| Thesis appendix PDF | Methodology and results for thesis |
| CSV | Spreadsheets, institutional reporting |
| JSON | Reuse in other tools or dashboards |

## Design principles

- Clarity over complexity  
- Reduction before offsetting  
- Transparency over false precision  
- Actionable outputs, not just metrics  
- Academic credibility and exportability  

---

TRACE — Queen's University Belfast · PhD Research Projects
