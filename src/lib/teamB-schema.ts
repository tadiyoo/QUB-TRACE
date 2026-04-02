/** Structured TRACE B calculator input schema. Stored under TraceInputs.teamB. */

export interface TeamBSectionFlags {
  /** Wet lab workflows, equipment frequency, cold storage, consumables (L1–L19). */
  includeLabWorkflow: boolean;
  /** Field studies, equipment, bait (Field CSV). */
  includeFieldResearch: boolean;
  /** Animal studies (Animal CSV). */
  includeAnimalResearch: boolean;
  /** Paper/metal/wood/plastic/glass/other resources (Other Resources CSV). */
  includeOtherMaterials: boolean;
  /** Optional: paste monthly Kelvin2 / HPC CO₂ equivalents (kg). */
  includeHpcMonthlyKg: boolean;
}

export interface TeamBInputs {
  flags: TeamBSectionFlags;
  demographics: Record<string, string>;
  researchProfile: Record<string, string>;
  spaceUse: Record<string, string>;
  travelCommute: Record<string, string>;
  computing: Record<string, string>;
  /** Keys like jan, feb, … dec — numeric kg strings */
  hpcMonthlyKg: Record<string, string>;
  labEquipment: Record<string, string>;
  labConsumables: Record<string, string>;
  field: Record<string, string>;
  animal: Record<string, string>;
  otherResources: Record<string, string>;
  notes: string;
}

export const defaultTeamBFlags = (): TeamBSectionFlags => ({
  includeLabWorkflow: false,
  includeFieldResearch: false,
  includeAnimalResearch: false,
  includeOtherMaterials: false,
  includeHpcMonthlyKg: false,
});

export function filledFieldCount(rec: Record<string, string>): number {
  return Object.values(rec).filter((v) => v != null && String(v).trim() !== "").length;
}

/**
 * Use saved toggles, but if the user entered data in a section, include it in
 * footprint math even when a toggle was left off (avoids silent zero totals).
 */
export function effectiveTeamBFlagsForCalc(tb: TeamBInputs): TeamBSectionFlags {
  return {
    includeLabWorkflow:
      tb.flags.includeLabWorkflow ||
      filledFieldCount(tb.labEquipment) > 0 ||
      filledFieldCount(tb.labConsumables) > 0,
    includeFieldResearch:
      tb.flags.includeFieldResearch || filledFieldCount(tb.field) > 0,
    includeAnimalResearch:
      tb.flags.includeAnimalResearch || filledFieldCount(tb.animal) > 0,
    includeOtherMaterials:
      tb.flags.includeOtherMaterials || filledFieldCount(tb.otherResources) > 0,
    includeHpcMonthlyKg:
      tb.flags.includeHpcMonthlyKg || filledFieldCount(tb.hpcMonthlyKg) > 0,
  };
}

export function emptyTeamBInputs(): TeamBInputs {
  return {
    flags: defaultTeamBFlags(),
    demographics: {},
    researchProfile: {},
    spaceUse: {},
    travelCommute: {},
    computing: {},
    hpcMonthlyKg: {},
    labEquipment: {},
    labConsumables: {},
    field: {},
    animal: {},
    otherResources: {},
    notes: "",
  };
}

/** Deep-merge partial JSON from API (older reports may omit teamB). */
export function mergeTeamBPartial(raw: unknown): TeamBInputs {
  const base = emptyTeamBInputs();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const flags = o.flags as TeamBSectionFlags | undefined;
  return {
    flags: { ...base.flags, ...(flags && typeof flags === "object" ? flags : {}) },
    demographics: { ...base.demographics, ...(asRecord(o.demographics)) },
    researchProfile: { ...base.researchProfile, ...(asRecord(o.researchProfile)) },
    spaceUse: { ...base.spaceUse, ...(asRecord(o.spaceUse)) },
    travelCommute: { ...base.travelCommute, ...(asRecord(o.travelCommute)) },
    computing: { ...base.computing, ...(asRecord(o.computing)) },
    hpcMonthlyKg: { ...base.hpcMonthlyKg, ...(asRecord(o.hpcMonthlyKg)) },
    labEquipment: { ...base.labEquipment, ...(asRecord(o.labEquipment)) },
    labConsumables: { ...base.labConsumables, ...(asRecord(o.labConsumables)) },
    field: { ...base.field, ...(asRecord(o.field)) },
    animal: { ...base.animal, ...(asRecord(o.animal)) },
    otherResources: { ...base.otherResources, ...(asRecord(o.otherResources)) },
    notes: typeof o.notes === "string" ? o.notes : base.notes,
  };
}

function asRecord(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "string") out[k] = val;
  }
  return out;
}

export function countTeamBAnswers(tb: TeamBInputs): number {
  const flags = effectiveTeamBFlagsForCalc(tb);
  let n = 0;
  const countRec = (r: Record<string, string>) => {
    for (const v of Object.values(r)) {
      if (v != null && String(v).trim() !== "") n += 1;
    }
  };
  countRec(tb.demographics);
  countRec(tb.researchProfile);
  countRec(tb.spaceUse);
  countRec(tb.travelCommute);
  countRec(tb.computing);
  if (flags.includeHpcMonthlyKg) countRec(tb.hpcMonthlyKg);
  if (flags.includeLabWorkflow) {
    countRec(tb.labEquipment);
    countRec(tb.labConsumables);
  }
  if (flags.includeFieldResearch) countRec(tb.field);
  if (flags.includeAnimalResearch) countRec(tb.animal);
  if (flags.includeOtherMaterials) countRec(tb.otherResources);
  if (tb.notes.trim()) n += 1;
  return n;
}
