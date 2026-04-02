/**
 * TRACE Dashboard — Sample result data for local development
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
    id: "wizard_travel",
    label: "Travel — commute, field days & conferences (T1–T3)",
    shortLabel: "Travel",
    kgCo2e: 103,
    percentage: 53,
    description: "TRACE B Step 3",
  },
  categories: [
    {
      id: "wizard_profile",
      label: "Profile — demographics, funding & outputs (D1, F1, L1)",
      shortLabel: "Profile",
      kgCo2e: 12,
      percentage: 6,
    },
    {
      id: "wizard_space",
      label: "Space — campus & space use (S*)",
      shortLabel: "Space",
      kgCo2e: 18,
      percentage: 9,
    },
    {
      id: "wizard_travel",
      label: "Travel — commute, field days & conferences (T1–T3)",
      shortLabel: "Travel",
      kgCo2e: 103,
      percentage: 53,
    },
    {
      id: "wizard_digital",
      label: "Digital — computing, cloud, AI & HPC (C1–C8)",
      shortLabel: "Digital",
      kgCo2e: 34,
      percentage: 18,
    },
    {
      id: "wizard_research",
      label: "Research — context, lab, field, animal, other resources & notes",
      shortLabel: "Research",
      kgCo2e: 26,
      percentage: 14,
    },
  ],
  reductionOpportunities: [
    {
      id: "r1",
      categoryId: "wizard_travel",
      title: "Travel & mobility (Step 3)",
      currentEmissions: 103,
      suggestedAction: "Consolidate trips, favour rail over short-haul flights, use virtual meetings where possible.",
      potentialSavingKgCo2e: 38,
      ease: "medium",
      priority: 1,
    },
    {
      id: "r2",
      categoryId: "wizard_digital",
      title: "Computing & digital (Step 4)",
      currentEmissions: 34,
      suggestedAction: "Reduce idle compute and storage time",
      potentialSavingKgCo2e: 12,
      ease: "low",
      priority: 2,
    },
    {
      id: "r3",
      categoryId: "wizard_space",
      title: "Campus & space use (Step 2)",
      currentEmissions: 18,
      suggestedAction: "Digital-first workflows and shared space use",
      potentialSavingKgCo2e: 4,
      ease: "low",
      priority: 3,
    },
  ],
  assumptions: [
    {
      id: "a1",
      label: "TRACE B calculator model",
      value: "Illustrative kg CO₂e per answered field until final TRACE factors ship.",
    },
  ],
  estimatedInputsCount: 2,
  optionalInputsCount: 1,
  uncertaintyNote:
    "Illustrative TRACE B model: totals scale with completed calculator fields using placeholder factors.",
};
