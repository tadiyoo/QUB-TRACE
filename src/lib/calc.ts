import type { TraceResult } from "./types";

// Shape of the raw data stored in reports.dataJson
export interface TraceInputs {
  general?: {
    personnelFteOnProject?: string;
    personnelGroupSize?: string;
    labAcademic?: string;
    officeAdmin?: string;
    officeAcademic?: string;
    labPhysical?: string;
    labEngineering?: string;
    labMedical?: string;
    officeWater?: string;
    // computing / IT
    cloudComputeHours?: string;
    cloudStorageGbMonths?: string;
    onPremComputeHours?: string;
    onPremStorageTbMonths?: string;
    // printing / admin
    pagesPrinted?: string;
    adminHoursPerWeek?: string;
  };
  travel?: {
    shortHaulEcoUk?: string;
    shortHaulBizUk?: string;
    longHaulEcoUk?: string;
    longHaulBizUk?: string;
    ecoIntlNonUk?: string;
    bizIntlNonUk?: string;
    ferry?: string;
    car?: string;
    motorbike?: string;
    taxis?: string;
    localBus?: string;
    coach?: string;
    nationalRail?: string;
    internationalRail?: string;
    tram?: string;
  };
  waste?: {
    mixedRecycling?: string;
    weeeRecycling?: string;
    generalWaste?: string;
    clinicalWaste?: string;
    chemicalWaste?: string;
    biologicalWaste?: string;
  };
  procurement?: {
    category?: string;
    description?: string;
    amount?: string;
    currency?: string;
  }[];
}

function n(value?: string): number {
  const v = parseFloat(value ?? "");
  return Number.isFinite(v) ? v : 0;
}

export type CategoryBreakdownMap = Record<string, { label: string; kgCo2e: number }[]>;

/**
 * Compute per-input breakdown for each category from saved inputs.
 * Use when displaying a report whose resultJson was saved without breakdown (e.g. before this was added).
 */
export function getCategoryBreakdowns(inputs: TraceInputs): CategoryBreakdownMap {
  const g = inputs.general ?? {};
  const t = inputs.travel ?? {};
  const w = inputs.waste ?? {};
  const p = inputs.procurement ?? [];
  const add = (arr: { label: string; kgCo2e: number }[], label: string, kg: number) => {
    if (kg > 0) arr.push({ label, kgCo2e: kg });
  };

  const travelBreakdown: { label: string; kgCo2e: number }[] = [];
  add(travelBreakdown, "Economy Short-Haul, To/From UK", n(t.shortHaulEcoUk) * 0.18);
  add(travelBreakdown, "Business Short-Haul, To/From UK", n(t.shortHaulBizUk) * 0.3);
  add(travelBreakdown, "Economy Long-Haul, To/From UK", n(t.longHaulEcoUk) * 0.16);
  add(travelBreakdown, "Business Long-Haul, To/From UK", n(t.longHaulBizUk) * 0.28);
  add(travelBreakdown, "Economy International, To/From Non-UK", n(t.ecoIntlNonUk) * 0.17);
  add(travelBreakdown, "Business International, To/From Non-UK", n(t.bizIntlNonUk) * 0.29);
  add(travelBreakdown, "Ferry", n(t.ferry) * 0.12);
  add(travelBreakdown, "Car", n(t.car) * 0.17);
  add(travelBreakdown, "Motorbike", n(t.motorbike) * 0.1);
  add(travelBreakdown, "Taxis", n(t.taxis) * 0.2);
  add(travelBreakdown, "Local Bus", n(t.localBus) * 0.09);
  add(travelBreakdown, "Coach", n(t.coach) * 0.05);
  add(travelBreakdown, "National Rail", n(t.nationalRail) * 0.04);
  add(travelBreakdown, "International Rail", n(t.internationalRail) * 0.03);
  add(travelBreakdown, "Light Rail and Tram", n(t.tram) * 0.03);

  const labBreakdown: { label: string; kgCo2e: number }[] = [];
  add(labBreakdown, "Academic Laboratory", n(g.labAcademic) * 15);
  add(labBreakdown, "Supporting Admin Office (non-research related)", n(g.officeAdmin) * 5);
  add(labBreakdown, "Academic Office (research related)", n(g.officeAcademic) * 8);
  add(labBreakdown, "Physical Sciences Laboratory", n(g.labPhysical) * 18);
  add(labBreakdown, "Engineering Laboratory", n(g.labEngineering) * 20);
  add(labBreakdown, "Medical/Life Sciences Laboratory", n(g.labMedical) * 22);
  add(labBreakdown, "Office/Admin Space", n(g.officeWater) * 2);

  const computingBreakdown: { label: string; kgCo2e: number }[] = [];
  add(computingBreakdown, "Cloud compute (hours)", n(g.cloudComputeHours) * 0.5);
  add(computingBreakdown, "Cloud storage (GB-months)", n(g.cloudStorageGbMonths) * 0.01);
  add(computingBreakdown, "On-prem compute (hours)", n(g.onPremComputeHours) * 0.8);
  add(computingBreakdown, "On-prem storage (TB-months)", n(g.onPremStorageTbMonths) * 1.2);

  const printingWasteBreakdown: { label: string; kgCo2e: number }[] = [];
  add(printingWasteBreakdown, "Pages printed", n(g.pagesPrinted) * 0.005);
  add(printingWasteBreakdown, "Admin hours per week", n(g.adminHoursPerWeek) * 52 * 0.1);
  add(printingWasteBreakdown, "Mixed Recycling", n(w.mixedRecycling) * 50);
  add(printingWasteBreakdown, "WEEE Mixed Recycling", n(w.weeeRecycling) * 200);
  add(printingWasteBreakdown, "General Waste", n(w.generalWaste) * 400);
  add(printingWasteBreakdown, "Clinical Waste", n(w.clinicalWaste) * 600);
  add(printingWasteBreakdown, "Chemical Waste", n(w.chemicalWaste) * 800);
  add(printingWasteBreakdown, "Biological Waste", n(w.biologicalWaste) * 700);

  const consumablesBreakdown: { label: string; kgCo2e: number }[] = [];
  p.forEach((item, i) => {
    const kg = n(item.amount) * 0.5;
    if (kg > 0) {
      const label = item.category || item.description || `Procurement line ${i + 1}`;
      consumablesBreakdown.push({ label, kgCo2e: kg });
    }
  });
  if (consumablesBreakdown.length === 0) {
    consumablesBreakdown.push({ label: "No procurement items added", kgCo2e: 0 });
  }

  return {
    travel_fieldwork: travelBreakdown,
    lab_equipment: labBreakdown,
    computing_cloud: computingBreakdown,
    printing_admin: printingWasteBreakdown,
    consumables: consumablesBreakdown,
  };
}

/**
 * Temporary, local-only calculation model.
 * This will be replaced later by Team C's official engine.
 */
export function calculateTraceResult(
  title: string,
  inputs: TraceInputs,
  now: Date = new Date()
): TraceResult {
  const g = inputs.general ?? {};
  const t = inputs.travel ?? {};
  const w = inputs.waste ?? {};
  const p = inputs.procurement ?? [];

  // Extremely simple placeholder factors (kg CO2e per unit)
  const labKg =
    n(g.labAcademic) * 15 +
    n(g.officeAcademic) * 8 +
    n(g.officeAdmin) * 5 +
    n(g.labPhysical) * 18 +
    n(g.labEngineering) * 20 +
    n(g.labMedical) * 22 +
    n(g.officeWater) * 2;

  // Very rough IT / computing placeholder factors
  const computingKg =
    n(g.cloudComputeHours) * 0.5 + // kg CO2e per cloud compute hour (placeholder)
    n(g.cloudStorageGbMonths) * 0.01 + // kg CO2e per GB-month (placeholder)
    n(g.onPremComputeHours) * 0.8 + // higher for on-prem
    n(g.onPremStorageTbMonths) * 1.2; // per TB-month on-prem

  // Very rough printing / admin placeholder
  const printingAdminExtraKg =
    n(g.pagesPrinted) * 0.005 + // kg CO2e per printed page (placeholder)
    n(g.adminHoursPerWeek) * 52 * 0.1; // admin hours per week * 52 * factor

  const travelFlightsKg =
    n(t.shortHaulEcoUk) * 0.18 +
    n(t.shortHaulBizUk) * 0.3 +
    n(t.longHaulEcoUk) * 0.16 +
    n(t.longHaulBizUk) * 0.28 +
    n(t.ecoIntlNonUk) * 0.17 +
    n(t.bizIntlNonUk) * 0.29;

  const travelOtherKg =
    n(t.ferry) * 0.12 +
    n(t.car) * 0.17 +
    n(t.motorbike) * 0.1 +
    n(t.taxis) * 0.2 +
    n(t.localBus) * 0.09 +
    n(t.coach) * 0.05 +
    n(t.nationalRail) * 0.04 +
    n(t.internationalRail) * 0.03 +
    n(t.tram) * 0.03;

  const travelTotalKg = travelFlightsKg + travelOtherKg;

  const wasteKg =
    n(w.mixedRecycling) * 50 +
    n(w.weeeRecycling) * 200 +
    n(w.generalWaste) * 400 +
    n(w.clinicalWaste) * 600 +
    n(w.chemicalWaste) * 800 +
    n(w.biologicalWaste) * 700;

  const procurementKg = p.reduce((sum, item) => sum + n(item.amount) * 0.5, 0);

  const totalKgCo2e =
    labKg + travelTotalKg + wasteKg + procurementKg + computingKg + printingAdminExtraKg;

  // Per-input breakdown for expand details (only include items with kgCo2e > 0)
  const travelBreakdown: { label: string; kgCo2e: number }[] = [];
  const add = (arr: { label: string; kgCo2e: number }[], label: string, kg: number) => {
    if (kg > 0) arr.push({ label, kgCo2e: kg });
  };
  add(travelBreakdown, "Economy Short-Haul, To/From UK", n(t.shortHaulEcoUk) * 0.18);
  add(travelBreakdown, "Business Short-Haul, To/From UK", n(t.shortHaulBizUk) * 0.3);
  add(travelBreakdown, "Economy Long-Haul, To/From UK", n(t.longHaulEcoUk) * 0.16);
  add(travelBreakdown, "Business Long-Haul, To/From UK", n(t.longHaulBizUk) * 0.28);
  add(travelBreakdown, "Economy International, To/From Non-UK", n(t.ecoIntlNonUk) * 0.17);
  add(travelBreakdown, "Business International, To/From Non-UK", n(t.bizIntlNonUk) * 0.29);
  add(travelBreakdown, "Ferry", n(t.ferry) * 0.12);
  add(travelBreakdown, "Car", n(t.car) * 0.17);
  add(travelBreakdown, "Motorbike", n(t.motorbike) * 0.1);
  add(travelBreakdown, "Taxis", n(t.taxis) * 0.2);
  add(travelBreakdown, "Local Bus", n(t.localBus) * 0.09);
  add(travelBreakdown, "Coach", n(t.coach) * 0.05);
  add(travelBreakdown, "National Rail", n(t.nationalRail) * 0.04);
  add(travelBreakdown, "International Rail", n(t.internationalRail) * 0.03);
  add(travelBreakdown, "Light Rail and Tram", n(t.tram) * 0.03);

  const labBreakdown: { label: string; kgCo2e: number }[] = [];
  add(labBreakdown, "Academic Laboratory", n(g.labAcademic) * 15);
  add(labBreakdown, "Supporting Admin Office (non-research related)", n(g.officeAdmin) * 5);
  add(labBreakdown, "Academic Office (research related)", n(g.officeAcademic) * 8);
  add(labBreakdown, "Physical Sciences Laboratory", n(g.labPhysical) * 18);
  add(labBreakdown, "Engineering Laboratory", n(g.labEngineering) * 20);
  add(labBreakdown, "Medical/Life Sciences Laboratory", n(g.labMedical) * 22);
  add(labBreakdown, "Office/Admin Space", n(g.officeWater) * 2);

  const computingBreakdown: { label: string; kgCo2e: number }[] = [];
  add(computingBreakdown, "Cloud compute (hours)", n(g.cloudComputeHours) * 0.5);
  add(computingBreakdown, "Cloud storage (GB-months)", n(g.cloudStorageGbMonths) * 0.01);
  add(computingBreakdown, "On-prem compute (hours)", n(g.onPremComputeHours) * 0.8);
  add(computingBreakdown, "On-prem storage (TB-months)", n(g.onPremStorageTbMonths) * 1.2);

  const printingWasteBreakdown: { label: string; kgCo2e: number }[] = [];
  add(printingWasteBreakdown, "Pages printed", n(g.pagesPrinted) * 0.005);
  add(printingWasteBreakdown, "Admin hours per week", n(g.adminHoursPerWeek) * 52 * 0.1);
  add(printingWasteBreakdown, "Mixed Recycling", n(w.mixedRecycling) * 50);
  add(printingWasteBreakdown, "WEEE Mixed Recycling", n(w.weeeRecycling) * 200);
  add(printingWasteBreakdown, "General Waste", n(w.generalWaste) * 400);
  add(printingWasteBreakdown, "Clinical Waste", n(w.clinicalWaste) * 600);
  add(printingWasteBreakdown, "Chemical Waste", n(w.chemicalWaste) * 800);
  add(printingWasteBreakdown, "Biological Waste", n(w.biologicalWaste) * 700);

  const consumablesBreakdown: { label: string; kgCo2e: number }[] = [];
  p.forEach((item, i) => {
    const kg = n(item.amount) * 0.5;
    if (kg > 0) {
      const label = item.category || item.description || `Procurement line ${i + 1}`;
      consumablesBreakdown.push({ label, kgCo2e: kg });
    }
  });
  if (consumablesBreakdown.length === 0) {
    consumablesBreakdown.push({ label: "No procurement items added", kgCo2e: 0 });
  }

  // Map all four input groups (Utilities, Travel, Waste, Procurement) into five display categories.
  const categories = [
    {
      id: "travel_fieldwork",
      label: "Travel / fieldwork",
      shortLabel: "Travel",
      kgCo2e: travelTotalKg,
      breakdown: travelBreakdown,
    },
    {
      id: "lab_equipment",
      label: "Lab work / equipment use",
      shortLabel: "Lab & space",
      kgCo2e: labKg,
      breakdown: labBreakdown,
    },
    {
      id: "consumables",
      label: "Consumables / materials",
      shortLabel: "Procurement",
      kgCo2e: procurementKg,
      breakdown: consumablesBreakdown,
    },
    {
      id: "printing_admin",
      label: "Printing / admin / waste",
      shortLabel: "Waste & admin",
      kgCo2e: wasteKg + printingAdminExtraKg,
      breakdown: printingWasteBreakdown,
    },
    {
      id: "computing_cloud",
      label: "Computing / cloud / storage",
      shortLabel: "Computing",
      kgCo2e: computingKg,
      breakdown: computingBreakdown,
    },
  ];

  const totalForPct = categories.reduce((sum, c) => sum + c.kgCo2e, 0) || 1;
  const withPct = categories
    .map((c) => ({
      ...c,
      percentage: Math.round((c.kgCo2e / totalForPct) * 100),
    }))
    .sort((a, b) => b.kgCo2e - a.kgCo2e);

  const largestCategory = withPct[0] ?? {
    id: "printing_admin",
    label: "Printing / admin / waste",
    shortLabel: "Waste & admin",
    kgCo2e: 0,
    percentage: 0,
  };

  const reductionPotentialKgCo2e = totalKgCo2e * 0.25;
  const totalAfterReductions = totalKgCo2e - reductionPotentialKgCo2e;

  const printingWasteKg = wasteKg + printingAdminExtraKg;
  const reductionOpportunitiesUnsorted = [
    {
      id: "travel_opt",
      categoryId: "travel_fieldwork" as const,
      title: "Optimise travel and conferencing",
      currentEmissions: travelTotalKg,
      suggestedAction:
        "Consolidate trips, favour rail over short-haul flights, and use virtual meetings where possible.",
      potentialSavingKgCo2e: travelTotalKg * 0.3,
      ease: "medium" as const,
      priority: 1,
    },
    {
      id: "lab_opt",
      categoryId: "lab_equipment" as const,
      title: "Improve lab and space efficiency",
      currentEmissions: labKg,
      suggestedAction:
        "Share equipment where possible, switch off idle instruments, and right-size lab space.",
      potentialSavingKgCo2e: labKg * 0.2,
      ease: "medium" as const,
      priority: 2,
    },
    {
      id: "waste_opt",
      categoryId: "printing_admin" as const,
      title: "Reduce waste and printing",
      currentEmissions: printingWasteKg,
      suggestedAction:
        "Adopt digital-first workflows, segregate waste more carefully, and cut unnecessary disposables.",
      potentialSavingKgCo2e: printingWasteKg * 0.2,
      ease: "high" as const,
      priority: 3,
    },
  ];
  const reductionOpportunities = [...reductionOpportunitiesUnsorted]
    .sort((a, b) => b.potentialSavingKgCo2e - a.potentialSavingKgCo2e)
    .map((opp, index) => ({ ...opp, priority: index + 1 }));

  const assumptions = [
    {
      id: "a_inputs",
      label: "Placeholder factors",
      value:
        "Currently uses simple placeholder emission factors for travel, space, waste, and procurement.",
    },
    {
      id: "a_future",
      label: "To be replaced",
      value:
        "In the full TRACE tool, this calculation will be replaced by the official engine from Teams B/C.",
    },
  ];

  const estimatedInputsCount = 0;
  const optionalInputsCount = 0;

  const uncertaintyNote =
    "Numbers shown here use a temporary, simplified TRACE calculation. They are for illustrative purposes only and will be replaced by the official model from the other TRACE teams.";

  return {
    projectTitle: title || "Untitled report",
    calculatedAt: now.toISOString(),
    totalKgCo2e,
    totalAfterReductions,
    reductionPotentialKgCo2e,
    confidence: "medium",
    largestCategory,
    categories: withPct,
    reductionOpportunities,
    assumptions,
    estimatedInputsCount,
    optionalInputsCount,
    uncertaintyNote,
  };
}

