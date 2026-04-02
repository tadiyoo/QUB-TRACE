import {
  WIZARD_STEP_ORDER,
  type EmissionCategory,
  type EmissionCategoryId,
  type TraceResult,
} from "./types";
import type { TeamBInputs } from "./teamB-schema";
import { emptyTeamBInputs, mergeTeamBPartial, countTeamBAnswers } from "./teamB-schema";
import { teamBFootprintAdditions, type WizardFootprintAdd } from "./teamB-calc";

/** Raw JSON in reports.dataJson — legacy keys kept for old rows; calculator uses teamB only */
export interface TraceInputs {
  teamB?: TeamBInputs;
  general?: Record<string, string | undefined>;
  travel?: Record<string, string | undefined>;
  waste?: Record<string, string | undefined>;
  procurement?: { category?: string; description?: string; amount?: string; currency?: string }[];
}

/** Merge PATCH body into existing saved inputs so clients can send `{ teamB }` only */
export function mergeTraceDataForPatch(existing: TraceInputs, patch: Partial<TraceInputs>): TraceInputs {
  const baseB = mergeTeamBPartial(existing.teamB);
  const patchB = patch.teamB != null ? mergeTeamBPartial(patch.teamB) : null;
  const teamB: TeamBInputs = patchB
    ? {
        flags: { ...baseB.flags, ...patchB.flags },
        demographics: { ...baseB.demographics, ...patchB.demographics },
        researchProfile: { ...baseB.researchProfile, ...patchB.researchProfile },
        spaceUse: { ...baseB.spaceUse, ...patchB.spaceUse },
        travelCommute: { ...baseB.travelCommute, ...patchB.travelCommute },
        computing: { ...baseB.computing, ...patchB.computing },
        hpcMonthlyKg: { ...baseB.hpcMonthlyKg, ...patchB.hpcMonthlyKg },
        labEquipment: { ...baseB.labEquipment, ...patchB.labEquipment },
        labConsumables: { ...baseB.labConsumables, ...patchB.labConsumables },
        field: { ...baseB.field, ...patchB.field },
        animal: { ...baseB.animal, ...patchB.animal },
        otherResources: { ...baseB.otherResources, ...patchB.otherResources },
        notes: patchB.notes,
      }
    : baseB;

  return {
    ...existing,
    general: { ...(existing.general ?? {}), ...(patch.general ?? {}) },
    travel: { ...(existing.travel ?? {}), ...(patch.travel ?? {}) },
    waste: { ...(existing.waste ?? {}), ...(patch.waste ?? {}) },
    procurement: patch.procurement !== undefined ? patch.procurement : existing.procurement,
    teamB,
  };
}

export type WizardBreakdownMap = Record<EmissionCategoryId, { label: string; kgCo2e: number }[]>;

const WIZARD_COPY: Record<
  EmissionCategoryId,
  { label: string; shortLabel: string; emptyHint: string }
> = {
  wizard_profile: {
    label: "Profile — demographics, funding & outputs (D1, F1, L1)",
    shortLabel: "Profile",
    emptyHint: "No answers in Profile yet — complete Step 1 in the TRACE carbon calculator.",
  },
  wizard_space: {
    label: "Space — campus & space use (S*)",
    shortLabel: "Space",
    emptyHint: "No answers in Space yet — complete Step 2 in the TRACE carbon calculator.",
  },
  wizard_travel: {
    label: "Travel — commute, field days & conferences (T1–T3)",
    shortLabel: "Travel",
    emptyHint: "No answers in Travel yet — complete Step 3 in the TRACE carbon calculator.",
  },
  wizard_digital: {
    label: "Digital — computing, cloud, AI & HPC (C1–C8)",
    shortLabel: "Digital",
    emptyHint: "No answers in Digital yet — complete Step 4 in the TRACE carbon calculator.",
  },
  wizard_research: {
    label: "Research — context, lab, field, animal, other resources & notes",
    shortLabel: "Research",
    emptyHint:
      "No answers in Research yet — complete Step 5 (R1–R2 and optional modules) in the TRACE carbon calculator.",
  },
};

function breakdownFromWizard(add: WizardFootprintAdd): WizardBreakdownMap {
  const map = {} as WizardBreakdownMap;
  for (const id of WIZARD_STEP_ORDER) {
    const items = add[id].items.filter((it) => it.kgCo2e >= 0);
    map[id] =
      items.length > 0 ? items : [{ label: WIZARD_COPY[id].emptyHint, kgCo2e: 0 }];
  }
  return map;
}

/** Per-tab line items (wizard order); labels match create-report fields */
export function getCategoryBreakdowns(inputs: TraceInputs): WizardBreakdownMap {
  const tb = inputs.teamB ? mergeTeamBPartial(inputs.teamB) : emptyTeamBInputs();
  return breakdownFromWizard(teamBFootprintAdditions(tb));
}

export function calculateTraceResult(
  title: string,
  inputs: TraceInputs,
  now: Date = new Date()
): TraceResult {
  const tb = inputs.teamB ? mergeTeamBPartial(inputs.teamB) : emptyTeamBInputs();
  const wizardAdd = teamBFootprintAdditions(tb);
  const breakdownMap = breakdownFromWizard(wizardAdd);

  const kgByStep = (id: EmissionCategoryId) => wizardAdd[id].kg;

  const totalKgCo2e = WIZARD_STEP_ORDER.reduce((s, id) => s + kgByStep(id), 0);

  type Draft = Omit<EmissionCategory, "percentage">;
  const categoriesDraft: Draft[] = WIZARD_STEP_ORDER.map((id) => ({
    id,
    label: WIZARD_COPY[id].label,
    shortLabel: WIZARD_COPY[id].shortLabel,
    kgCo2e: kgByStep(id),
    breakdown: breakdownMap[id],
  }));

  const totalForPct = totalKgCo2e || 1;
  const withPct: EmissionCategory[] = categoriesDraft.map((c) => ({
    ...c,
    percentage: Math.round((c.kgCo2e / totalForPct) * 100),
  }));

  const largestCategory =
    [...withPct].sort((a, b) => b.kgCo2e - a.kgCo2e)[0] ??
    ({
      id: "wizard_profile",
      ...WIZARD_COPY.wizard_profile,
      kgCo2e: 0,
      percentage: 0,
    } satisfies EmissionCategory);

  const reductionPotentialKgCo2e = totalKgCo2e * 0.25;
  const totalAfterReductions = totalKgCo2e - reductionPotentialKgCo2e;

  const profileKg = kgByStep("wizard_profile");
  const spaceKg = kgByStep("wizard_space");
  const travelKg = kgByStep("wizard_travel");
  const digitalKg = kgByStep("wizard_digital");
  const researchKg = kgByStep("wizard_research");

  const reductionOpportunitiesUnsorted = [
    {
      id: "travel_opt",
      categoryId: "wizard_travel" as const,
      title: "Travel & mobility (Step 3)",
      currentEmissions: travelKg,
      suggestedAction:
        "Reduce commute impact, batch field days, and pick lower-carbon conference travel where possible.",
      potentialSavingKgCo2e: travelKg * 0.3,
      ease: "medium" as const,
      priority: 1,
    },
    {
      id: "space_opt",
      categoryId: "wizard_space" as const,
      title: "Campus & space use (Step 2)",
      currentEmissions: spaceKg,
      suggestedAction:
        "Cut avoidable printing, share spaces efficiently, and reduce idle kitchen or site energy use.",
      potentialSavingKgCo2e: spaceKg * 0.2,
      ease: "high" as const,
      priority: 2,
    },
    {
      id: "digital_opt",
      categoryId: "wizard_digital" as const,
      title: "Computing & digital (Step 4)",
      currentEmissions: digitalKg,
      suggestedAction:
        "Right-size HPC/cloud jobs, store only needed data, and avoid redundant heavy compute.",
      potentialSavingKgCo2e: digitalKg * 0.25,
      ease: "medium" as const,
      priority: 3,
    },
    {
      id: "research_opt",
      categoryId: "wizard_research" as const,
      title: "Research modules (Step 5)",
      currentEmissions: researchKg,
      suggestedAction:
        "Share lab kit and consumables, reuse safely, and align wet-lab intensity with real need.",
      potentialSavingKgCo2e: researchKg * 0.2,
      ease: "medium" as const,
      priority: 4,
    },
    {
      id: "profile_opt",
      categoryId: "wizard_profile" as const,
      title: "Profile & funding context (Step 1)",
      currentEmissions: profileKg,
      suggestedAction:
        "Lower-impact choices in how and where you work still matter once factors are final — keep records accurate.",
      potentialSavingKgCo2e: profileKg * 0.1,
      ease: "low" as const,
      priority: 5,
    },
  ];
  const reductionOpportunities = [...reductionOpportunitiesUnsorted]
    .filter((o) => o.currentEmissions > 0)
    .sort((a, b) => b.potentialSavingKgCo2e - a.potentialSavingKgCo2e)
    .map((opp, index) => ({ ...opp, priority: index + 1 }));

  const assumptions = [
    {
      id: "a_traceb",
      label: "TRACE B calculator model",
      value:
        "Totals follow the five create-report tabs: Profile, Space, Travel, Digital, Research. Each answered field uses illustrative kg CO₂e (or pasted HPC kg) until final TRACE factors exist.",
    },
    {
      id: "a_future",
      label: "Future update",
      value:
        "Official TRACE emission factors will replace these placeholders; the five-tab layout will stay aligned with the calculator.",
    },
  ];

  const estimatedInputsCount = countTeamBAnswers(tb);
  const optionalInputsCount = 0;

  const uncertaintyNote =
    "Illustrative model: emissions are grouped like the calculator tabs and scale with completed fields. For learning and comparison, not statutory reporting, until TRACE factors are final.";

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
