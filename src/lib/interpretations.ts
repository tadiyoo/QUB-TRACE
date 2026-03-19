/**
 * TRACE — Multiple ways to interpret emissions so any discipline can relate.
 * Conversions are approximate; based on UK DEFRA and common equivalents.
 */

export type InterpretationId =
  | "kg_co2e"
  | "tonnes"
  | "kwh"
  | "pounds"
  | "car_km"
  | "flights"
  | "tree_years"
  | "home_days"
  | "smartphones";

export interface InterpretationMode {
  id: InterpretationId;
  label: string;
  description: string;
  /** Short label for dropdown */
  shortLabel: string;
}

/** Approximate conversion factors (UK / typical). Sources: DEFRA 2024, IEA, standard equivalents. */
export const KG_PER_KWH_UK = 0.207; // kg CO2e per kWh, UK grid
export const GBP_PER_TONNE = 50; // illustrative carbon cost £/t
export const KG_PER_CAR_KM = 0.17; // average car
export const KG_PER_SHORT_HAUL_FLIGHT = 80; // return, e.g. London–Belfast
export const KG_ABSORBED_PER_TREE_YEAR = 22;
export const KG_PER_HOME_DAY_UK = 1.65; // ~8 kWh/day × 0.207
export const KG_PER_SMARTPHONE_CHARGE = 0.01; // full charge, order of magnitude

/** For methodology section: how each interpretation unit is derived from kg CO₂e */
export const INTERPRETATION_METHODOLOGY: {
  id: InterpretationId;
  shortLabel: string;
  formula: string;
  source: string;
}[] = [
  { id: "kg_co2e", shortLabel: "kg CO₂e", formula: "Value in kg CO₂e (no conversion)", source: "Standard metric" },
  { id: "tonnes", shortLabel: "tonnes CO₂e", formula: "kg CO₂e ÷ 1,000", source: "Standard (1 t = 1,000 kg)" },
  { id: "kwh", shortLabel: "kWh equivalent", formula: `kg CO₂e ÷ ${KG_PER_KWH_UK} kg/kWh`, source: "UK grid emission factor (DEFRA/IEA)" },
  { id: "pounds", shortLabel: "£ (carbon cost)", formula: `(kg CO₂e ÷ 1,000) × £${GBP_PER_TONNE}/t`, source: "Illustrative carbon price (£/t CO₂e)" },
  { id: "car_km", shortLabel: "car km", formula: `kg CO₂e ÷ ${KG_PER_CAR_KM} kg/km`, source: "Average car (DEFRA)" },
  { id: "flights", shortLabel: "short-haul flights", formula: `kg CO₂e ÷ ${KG_PER_SHORT_HAUL_FLIGHT} kg per return flight`, source: "Short-haul return, e.g. London–Belfast (DEFRA)" },
  { id: "tree_years", shortLabel: "tree-years", formula: `kg CO₂e ÷ ${KG_ABSORBED_PER_TREE_YEAR} kg per tree-year`, source: "Approx. CO₂ absorbed per tree per year" },
  { id: "home_days", shortLabel: "home electricity days", formula: `kg CO₂e ÷ ${KG_PER_HOME_DAY_UK} kg/day`, source: "Typical UK home electricity (~8 kWh/day)" },
  { id: "smartphones", shortLabel: "phone charges", formula: `kg CO₂e ÷ ${KG_PER_SMARTPHONE_CHARGE} kg per full charge`, source: "Order-of-magnitude equivalent" },
];

export const INTERPRETATION_MODES: InterpretationMode[] = [
  {
    id: "kg_co2e",
    shortLabel: "kg CO₂e",
    label: "Carbon (kg CO₂e)",
    description: "Standard metric. Used in environmental and climate reporting.",
  },
  {
    id: "tonnes",
    shortLabel: "tonnes CO₂e",
    label: "Carbon (tonnes CO₂e)",
    description: "Same as above in tonnes. Common in policy and institutional reports.",
  },
  {
    id: "kwh",
    shortLabel: "kWh equivalent",
    label: "Electricity (kWh equivalent)",
    description: "UK grid: how much electricity would emit this much CO₂. Relatable for computing, lab, and engineering.",
  },
  {
    id: "pounds",
    shortLabel: "£ (carbon cost)",
    label: "Cost (£)",
    description: "Illustrative cost at a carbon price. Helps compare with budgets and funding.",
  },
  {
    id: "car_km",
    shortLabel: "car km",
    label: "Car travel (km equivalent)",
    description: "Distance by average car that would emit this much. Easy for anyone who drives.",
  },
  {
    id: "flights",
    shortLabel: "short-haul flights",
    label: "Flights (short-haul return)",
    description: "Number of return flights (e.g. London–Belfast). Relatable for travel-heavy projects.",
  },
  {
    id: "tree_years",
    shortLabel: "tree-years",
    label: "Trees (years to absorb)",
    description: "How many trees, each absorbing for one year, would offset this. Good for nature/biology audiences.",
  },
  {
    id: "home_days",
    shortLabel: "home electricity days",
    label: "Home electricity (days)",
    description: "Equivalent to a typical UK home’s electricity for this many days. Relatable for everyone.",
  },
  {
    id: "smartphones",
    shortLabel: "phone charges",
    label: "Smartphone charges",
    description: "Rough equivalent in full phone charges. Relatable for computing and daily life.",
  },
];

export interface FormattedInterpretation {
  value: number;
  unit: string;
  formatted: string;
  /** e.g. "≈ 1,180 kWh" */
  sentence?: string;
}

function roundNice(n: number, decimals = 0): number {
  if (decimals === 0) return Math.round(n);
  const m = Math.pow(10, decimals);
  return Math.round(n * m) / m;
}

export function interpret(kgCo2e: number, modeId: InterpretationId): FormattedInterpretation {
  const kg = Math.max(0, kgCo2e);
  switch (modeId) {
    case "kg_co2e": {
      const kgStr = Number(kg).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return { value: kg, unit: "kg CO₂e", formatted: `${kgStr} kg CO₂e`, sentence: `≈ ${kgStr} kg CO₂e` };
    }
    case "tonnes": {
      const t = kg / 1000;
      return { value: t, unit: "t CO₂e", formatted: `${roundNice(t, 2)} t CO₂e`, sentence: `≈ ${roundNice(t, 2)} t CO₂e` };
    }
    case "kwh": {
      const kwh = kg / KG_PER_KWH_UK;
      const str = roundNice(kwh) >= 1000 ? `${(roundNice(kwh) / 1000).toFixed(1)}k` : String(roundNice(kwh));
      return { value: kwh, unit: "kWh", formatted: `${str} kWh`, sentence: `≈ ${str} kWh of UK grid electricity` };
    }
    case "pounds": {
      const gbp = (kg / 1000) * GBP_PER_TONNE;
      return { value: gbp, unit: "£", formatted: `£${roundNice(gbp, gbp >= 10 ? 0 : 1)}`, sentence: `≈ £${roundNice(gbp, gbp >= 10 ? 0 : 1)} (at £${GBP_PER_TONNE}/t CO₂e)` };
    }
    case "car_km": {
      const km = kg / KG_PER_CAR_KM;
      const str = roundNice(km) >= 1000 ? `${(roundNice(km) / 1000).toFixed(1)}k` : String(roundNice(km));
      return { value: km, unit: "km", formatted: `${str} km`, sentence: `≈ ${str} km by average car` };
    }
    case "flights": {
      const n = kg / KG_PER_SHORT_HAUL_FLIGHT;
      const num = roundNice(n, n < 10 ? 1 : 0);
      return { value: n, unit: "flights", formatted: `${num} return flight${num !== 1 ? "s" : ""}`, sentence: `≈ ${num} short-haul return flight${num !== 1 ? "s" : ""}` };
    }
    case "tree_years": {
      const trees = kg / KG_ABSORBED_PER_TREE_YEAR;
      const num = roundNice(trees, trees < 10 ? 1 : 0);
      return { value: trees, unit: "tree-years", formatted: `${num} tree-year${num !== 1 ? "s" : ""}`, sentence: `≈ ${num} tree${num !== 1 ? "s" : ""} absorbing for a year` };
    }
    case "home_days": {
      const days = kg / KG_PER_HOME_DAY_UK;
      const num = roundNice(days, days < 100 ? 0 : 1);
      return { value: days, unit: "days", formatted: `${num} day${num !== 1 ? "s" : ""}`, sentence: `≈ ${num} day${num !== 1 ? "s" : ""} of typical UK home electricity` };
    }
    case "smartphones": {
      const charges = kg / KG_PER_SMARTPHONE_CHARGE;
      const n = roundNice(charges);
      const str = n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
      const plural = n !== 1 ? "s" : "";
      return { value: charges, unit: "charges", formatted: `${str} charge${plural}`, sentence: `≈ ${str} full smartphone charge${plural}` };
    }
    default: {
      const kgStr = Number(kg).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return { value: kg, unit: "kg CO₂e", formatted: `${kgStr} kg CO₂e`, sentence: `≈ ${kgStr} kg CO₂e` };
    }
  }
}

export function getMode(id: InterpretationId): InterpretationMode | undefined {
  return INTERPRETATION_MODES.find((m) => m.id === id);
}
