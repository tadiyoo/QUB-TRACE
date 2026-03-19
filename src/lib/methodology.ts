/**
 * TRACE — Methodology content for "How we calculated this" and PDF.
 * Emission factors (kg CO₂e per unit) and interpretation conversions.
 */

import type { TraceInputs } from "./calc";

export interface EmissionFactorRow {
  category: string;
  input: string;
  unit: string;
  factor: string;
  /** Numeric factor for calculation: emission = inputValue * factorNum */
  factorNum: number;
  /** Path into TraceInputs, e.g. "travel.car", "general.labAcademic", "procurement.total" */
  inputKey: string;
  note?: string;
}

/** Emission factors used in the calculation (kg CO₂e per unit of input). */
export const EMISSION_FACTORS: EmissionFactorRow[] = [
  // Travel (per km)
  { category: "Travel / fieldwork", input: "Economy Short-Haul, To/From UK", unit: "km", factor: "0.18", factorNum: 0.18, inputKey: "travel.shortHaulEcoUk", note: "Short-haul flights to/from UK, economy." },
  { category: "Travel / fieldwork", input: "Business Short-Haul, To/From UK", unit: "km", factor: "0.30", factorNum: 0.3, inputKey: "travel.shortHaulBizUk", note: "Short-haul flights to/from UK, business." },
  { category: "Travel / fieldwork", input: "Economy Long-Haul, To/From UK", unit: "km", factor: "0.16", factorNum: 0.16, inputKey: "travel.longHaulEcoUk", note: "Long-haul flights to/from UK, economy." },
  { category: "Travel / fieldwork", input: "Business Long-Haul, To/From UK", unit: "km", factor: "0.28", factorNum: 0.28, inputKey: "travel.longHaulBizUk", note: "Long-haul flights to/from UK, business." },
  { category: "Travel / fieldwork", input: "Economy International, To/From Non-UK", unit: "km", factor: "0.17", factorNum: 0.17, inputKey: "travel.ecoIntlNonUk", note: "Flights not to/from UK, economy." },
  { category: "Travel / fieldwork", input: "Business International, To/From Non-UK", unit: "km", factor: "0.29", factorNum: 0.29, inputKey: "travel.bizIntlNonUk", note: "Flights not to/from UK, business." },
  { category: "Travel / fieldwork", input: "Ferry", unit: "km", factor: "0.12", factorNum: 0.12, inputKey: "travel.ferry", note: "Ferry travel, distance-based." },
  { category: "Travel / fieldwork", input: "Car", unit: "km", factor: "0.17", factorNum: 0.17, inputKey: "travel.car", note: "Average car, DEFRA." },
  { category: "Travel / fieldwork", input: "Motorbike", unit: "km", factor: "0.10", factorNum: 0.1, inputKey: "travel.motorbike", note: "Motorbike, distance-based." },
  { category: "Travel / fieldwork", input: "Taxis", unit: "km", factor: "0.20", factorNum: 0.2, inputKey: "travel.taxis", note: "Taxi/private hire." },
  { category: "Travel / fieldwork", input: "Local Bus", unit: "km", factor: "0.09", factorNum: 0.09, inputKey: "travel.localBus", note: "Local bus, average occupancy." },
  { category: "Travel / fieldwork", input: "Coach", unit: "km", factor: "0.05", factorNum: 0.05, inputKey: "travel.coach", note: "Coach/long-distance bus." },
  { category: "Travel / fieldwork", input: "National Rail", unit: "km", factor: "0.04", factorNum: 0.04, inputKey: "travel.nationalRail", note: "UK national rail." },
  { category: "Travel / fieldwork", input: "International Rail", unit: "km", factor: "0.03", factorNum: 0.03, inputKey: "travel.internationalRail", note: "International rail." },
  { category: "Travel / fieldwork", input: "Light Rail and Tram", unit: "km", factor: "0.03", factorNum: 0.03, inputKey: "travel.tram", note: "Light rail, tram, metro." },
  // Lab & space (per m² floor area)
  { category: "Lab work / equipment use", input: "Academic Laboratory", unit: "m²", factor: "15", factorNum: 15, inputKey: "general.labAcademic", note: "Lab space, energy allocation per year." },
  { category: "Lab work / equipment use", input: "Supporting Admin Office (non-research related)", unit: "m²", factor: "5", factorNum: 5, inputKey: "general.officeAdmin", note: "Non-research admin office, lower intensity." },
  { category: "Lab work / equipment use", input: "Academic Office (research related)", unit: "m²", factor: "8", factorNum: 8, inputKey: "general.officeAcademic", note: "Research office space." },
  { category: "Lab work / equipment use", input: "Physical Sciences Laboratory", unit: "m²", factor: "18", factorNum: 18, inputKey: "general.labPhysical", note: "Physical sciences lab, higher energy use." },
  { category: "Lab work / equipment use", input: "Engineering Laboratory", unit: "m²", factor: "20", factorNum: 20, inputKey: "general.labEngineering", note: "Engineering lab, equipment-heavy." },
  { category: "Lab work / equipment use", input: "Medical/Life Sciences Laboratory", unit: "m²", factor: "22", factorNum: 22, inputKey: "general.labMedical", note: "Medical/life sciences lab, highest intensity." },
  { category: "Lab work / equipment use", input: "Office/Admin Space (water)", unit: "m²", factor: "2", factorNum: 2, inputKey: "general.officeWater", note: "Water use allocation for office/washrooms." },
  // Computing
  { category: "Computing / cloud / storage", input: "Cloud compute", unit: "hour", factor: "0.5", factorNum: 0.5, inputKey: "general.cloudComputeHours", note: "Cloud/VMs, illustrative factor." },
  { category: "Computing / cloud / storage", input: "Cloud storage", unit: "GB‑month", factor: "0.01", factorNum: 0.01, inputKey: "general.cloudStorageGbMonths", note: "Cloud storage, per GB-month." },
  { category: "Computing / cloud / storage", input: "On‑prem compute", unit: "hour", factor: "0.8", factorNum: 0.8, inputKey: "general.onPremComputeHours", note: "On-prem servers/HPC, higher than cloud." },
  { category: "Computing / cloud / storage", input: "On‑prem storage", unit: "TB‑month", factor: "1.2", factorNum: 1.2, inputKey: "general.onPremStorageTbMonths", note: "On-prem storage, per TB-month." },
  // Printing & admin
  { category: "Printing / admin / waste", input: "Pages printed", unit: "page", factor: "0.005", factorNum: 0.005, inputKey: "general.pagesPrinted", note: "Paper and printing, per page." },
  { category: "Printing / admin / waste", input: "Admin hours per week", unit: "hours/week", factor: "5.2", factorNum: 5.2, inputKey: "general.adminHoursPerWeek", note: "Admin work, annualised (52 weeks)." },
  // Waste (per tonne) — input in tonnes; factors give kg CO2e per tonne; output in kg CO2e
  { category: "Printing / admin / waste", input: "Mixed Recycling", unit: "tonne", factor: "50", factorNum: 50, inputKey: "waste.mixedRecycling", note: "Mixed dry recycling, collection and processing." },
  { category: "Printing / admin / waste", input: "WEEE Mixed Recycling", unit: "tonne", factor: "200", factorNum: 200, inputKey: "waste.weeeRecycling", note: "WEEE and e-waste recycling." },
  { category: "Printing / admin / waste", input: "General Waste", unit: "tonne", factor: "400", factorNum: 400, inputKey: "waste.generalWaste", note: "Residual/general waste, disposal." },
  { category: "Printing / admin / waste", input: "Clinical Waste", unit: "tonne", factor: "600", factorNum: 600, inputKey: "waste.clinicalWaste", note: "Clinical/healthcare waste, treatment." },
  { category: "Printing / admin / waste", input: "Chemical Waste", unit: "tonne", factor: "800", factorNum: 800, inputKey: "waste.chemicalWaste", note: "Chemical waste, handling and disposal." },
  { category: "Printing / admin / waste", input: "Biological Waste", unit: "tonne", factor: "700", factorNum: 700, inputKey: "waste.biologicalWaste", note: "Biological waste, treatment." },
  // Procurement
  { category: "Consumables / materials", input: "Procurement (expenditure)", unit: "£ GBP", factor: "0.5", factorNum: 0.5, inputKey: "procurement.total", note: "Spend-based; placeholder factor until full model." },
];

/** Get numeric input value from TraceInputs for a given inputKey (e.g. "travel.car", "procurement.total"). */
export function getInputValue(inputs: TraceInputs | undefined, inputKey: string): number {
  if (!inputs) return 0;
  if (inputKey === "procurement.total") {
    const items = inputs.procurement ?? [];
    return items.reduce((sum, item) => sum + (Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0), 0);
  }
  const [group, key] = inputKey.split(".") as [keyof TraceInputs, string];
  const g = inputs[group];
  if (g == null || typeof g !== "object") return 0;
  const val = (g as Record<string, unknown>)[key];
  if (val == null) return 0;
  const n = typeof val === "string" ? parseFloat(val) : Number(val);
  return Number.isFinite(n) ? n : 0;
}

/** Format input value for display (e.g. "150 km", "0.5 tonne"). */
export function formatInputValue(value: number, unit: string, row: EmissionFactorRow): string {
  if (value === 0) return "—";
  if (row.inputKey === "general.adminHoursPerWeek") return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
  if (unit === "£ GBP" || unit === "£") return `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (value === Math.round(value)) return `${value.toLocaleString()} ${unit}`;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}

export const METHODOLOGY_INTRO =
  "The total footprint is the sum of emissions from utilities (lab and office space), travel, waste, procurement, and computing. Each input (e.g. distance in km, floor area in m², waste in tonnes) is multiplied by an emission factor to obtain kg CO₂e. These factors are based on UK DEFRA and similar sources; the full TRACE tool will use the official engine from the TRACE teams.";

export const METHODOLOGY_SOURCES =
  "Travel: DEFRA 2024 (distance-based factors for flights, car, rail, bus, ferry). Space and waste: simplified allocation factors. Computing: illustrative factors; in production these would reflect region and provider. Interpretations (kWh, £, car km, flights, etc.): DEFRA, IEA, standard equivalents.";
