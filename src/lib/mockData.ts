/**
 * TRACE Dashboard — Sample result data (as would come from Team C)
 */

import type { TraceResult } from "./types";

export const mockTraceResult: TraceResult = {
  projectTitle: "Sustainable Polymer Synthesis for Medical Devices",
  calculatedAt: new Date().toISOString(),
  totalKgCo2e: 193,
  totalAfterReductions: 145,
  reductionPotentialKgCo2e: 48,
  confidence: "medium",
  largestCategory: {
    id: "travel_fieldwork",
    label: "Travel / fieldwork",
    shortLabel: "Travel",
    kgCo2e: 103,
    percentage: 53,
    description: "Flights, rail, and fieldwork travel",
  },
  categories: [
    { id: "travel_fieldwork", label: "Travel / fieldwork", shortLabel: "Travel", kgCo2e: 103, percentage: 53 },
    { id: "computing_cloud", label: "Computing / cloud / storage", shortLabel: "Computing", kgCo2e: 34, percentage: 18 },
    { id: "lab_equipment", label: "Lab work / equipment use", shortLabel: "Lab", kgCo2e: 28, percentage: 15 },
    { id: "consumables", label: "Consumables / materials", shortLabel: "Consumables", kgCo2e: 18, percentage: 9 },
    { id: "printing_admin", label: "Printing / admin / miscellaneous", shortLabel: "Printing & admin", kgCo2e: 10, percentage: 5 },
  ],
  reductionOpportunities: [
    {
      id: "r1",
      categoryId: "travel_fieldwork",
      title: "Optimise travel and conferencing",
      currentEmissions: 103,
      suggestedAction: "Consolidate trips, favour rail over short-haul flights, use virtual meetings where possible.",
      potentialSavingKgCo2e: 38,
      ease: "medium",
      priority: 1,
    },
    {
      id: "r2",
      categoryId: "computing_cloud",
      title: "Cloud computing",
      currentEmissions: 34,
      suggestedAction: "Reduce idle compute and storage time",
      potentialSavingKgCo2e: 12,
      ease: "low",
      priority: 2,
    },
    {
      id: "r3",
      categoryId: "printing_admin",
      title: "Printing",
      currentEmissions: 10,
      suggestedAction: "Digital-first submission and review",
      potentialSavingKgCo2e: 4,
      ease: "low",
      priority: 3,
    },
    {
      id: "r4",
      categoryId: "travel_fieldwork",
      title: "Fieldwork travel",
      currentEmissions: 103,
      suggestedAction: "Combine trips and prefer train where possible",
      potentialSavingKgCo2e: 14,
      ease: "high",
      priority: 4,
    },
  ],
  assumptions: [
    { id: "a1", label: "Emission factors", value: "UK DEFRA 2024, IEA for electricity", source: "DEFRA, IEA" },
    { id: "a2", label: "Flight distances", value: "Great circle with radiative forcing multiplier 1.9", source: "DEFRA" },
    { id: "a3", label: "Lab energy", value: "Allocated share of building consumption", source: "Estimate" },
    { id: "a4", label: "Cloud usage", value: "Based on reported compute hours and region", source: "Provider docs" },
  ],
  estimatedInputsCount: 2,
  optionalInputsCount: 1,
  uncertaintyNote:
    "This footprint is an estimate based on user-entered activity data and standard emission factors. Results are more reliable for travel and procurement categories than for shared infrastructure and indirect energy allocation.",
};
