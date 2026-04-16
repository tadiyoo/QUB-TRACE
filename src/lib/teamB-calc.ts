/** Placeholder footprint from TRACE B carbon calculator until final emission factors ship. */

import type { EmissionCategoryId } from "./types";
import type { TeamBInputs } from "./teamB-schema";
import { effectiveTeamBFlagsForCalc } from "./teamB-schema";
import { teamBFieldLabel } from "@/content/teamB-field-labels";

/** Illustrative kg CO₂e — keep methodology copy in sync */
export const TEAM_B_PLACEHOLDER = {
  demographicsTotalKgPerField: 0.45,
  spaceLabKgPerAnsweredField: 1.15,
  spaceSiteUseKgPerAnsweredField: 0.65,
  travelCommuteKgPerAnsweredField: 3.2,
  computingKgPerAnsweredField: 2.0,
  labEquipmentKgPerAnsweredField: 4.5,
  labConsumablesKgPerAnsweredField: 3.8,
  fieldTravelKgPerAnsweredField: 2.8,
  fieldLabKgPerAnsweredField: 2.2,
  animalKgPerAnsweredField: 11.0,
  otherResourcesKgPerAnsweredField: 2.4,
  researchProfileKgPerAnsweredField: 0.9,
} as const;

/** One answered field row for “How we obtained these results” (per-field, not rolled up). */
export interface TeamBMethodologyDetailLine {
  reportCategory: string;
  stepRef: string;
  fieldLabel: string;
  valueText: string;
  factorRule: string;
  kgCo2e: number;
}

export type WizardFootprintAdd = Record<
  EmissionCategoryId,
  { kg: number; items: { label: string; kgCo2e: number }[] }
>;

function nn(value?: string): number {
  const v = parseFloat(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(v) ? v : 0;
}

function filledCount(rec: Record<string, string>): number {
  return Object.values(rec).filter((v) => v != null && String(v).trim() !== "").length;
}

function filledEntries(rec: Record<string, string>): [string, string][] {
  return Object.entries(rec)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .sort(([a], [b]) => a.localeCompare(b));
}

function emptyAdd(): WizardFootprintAdd {
  return {
    wizard_profile: { kg: 0, items: [] },
    wizard_space: { kg: 0, items: [] },
    wizard_travel: { kg: 0, items: [] },
    wizard_digital: { kg: 0, items: [] },
    wizard_research: { kg: 0, items: [] },
  };
}

function push(a: WizardFootprintAdd, step: EmissionCategoryId, label: string, kg: number) {
  if (kg < 0) return;
  if (kg > 0) a[step].kg += kg;
  a[step].items.push({ label, kgCo2e: kg });
}

function pushPerField(
  a: WizardFootprintAdd,
  step: EmissionCategoryId,
  rec: Record<string, string>,
  totalKg: number
) {
  const entries = filledEntries(rec);
  const n = entries.length;
  if (n === 0 || totalKg <= 0) return;
  const each = totalKg / n;
  for (const [key, value] of entries) {
    push(a, step, `${teamBFieldLabel(key)}: ${value}`, each);
  }
}

const METH_CAT = {
  profile: "Profile",
  space: "Space",
  travel: "Travel",
  digital: "Digital",
  research: "Research",
} as const;

function pushDetailPerField(
  lines: TeamBMethodologyDetailLine[],
  reportCategory: string,
  stepRef: string,
  factorRule: string,
  rec: Record<string, string>,
  kgPerField: number
) {
  for (const [key, value] of filledEntries(rec)) {
    lines.push({
      reportCategory,
      stepRef,
      fieldLabel: teamBFieldLabel(key),
      valueText: String(value).trim(),
      factorRule,
      kgCo2e: kgPerField,
    });
  }
}

/** Per answered field: label, value, illustrative factor, kg — mirrors footprint allocation logic. */
export function teamBMethodologyDetailLines(teamB: TeamBInputs): TeamBMethodologyDetailLine[] {
  const flags = effectiveTeamBFlagsForCalc(teamB);
  const lines: TeamBMethodologyDetailLine[] = [];
  const P = TEAM_B_PLACEHOLDER;

  pushDetailPerField(
    lines,
    METH_CAT.profile,
    "Step 1 · Profile & funding",
    `${P.demographicsTotalKgPerField} kg CO₂e per field (illustrative, demographics / funding)`,
    teamB.demographics,
    P.demographicsTotalKgPerField
  );

  const spacePer = P.spaceLabKgPerAnsweredField + P.spaceSiteUseKgPerAnsweredField;
  pushDetailPerField(
    lines,
    METH_CAT.space,
    "Step 2 · Campus & space",
    `${spacePer} kg CO₂e per field (illustrative, lab allocation + site habits)`,
    teamB.spaceUse,
    spacePer
  );

  pushDetailPerField(
    lines,
    METH_CAT.travel,
    "Step 3 · Travel & mobility",
    `${P.travelCommuteKgPerAnsweredField} kg CO₂e per field (illustrative, commute & trips)`,
    teamB.travelCommute,
    P.travelCommuteKgPerAnsweredField
  );

  if (flags.includeHpcMonthlyKg) {
    for (const [key, raw] of filledEntries(teamB.hpcMonthlyKg)) {
      const kg = nn(raw);
      if (kg > 0) {
        lines.push({
          reportCategory: METH_CAT.digital,
          stepRef: "Step 4 · Monthly HPC (optional)",
          fieldLabel: teamBFieldLabel(key),
          valueText: String(raw).trim(),
          factorRule: "kg CO₂e as entered (monthly total)",
          kgCo2e: kg,
        });
      }
    }
  }

  pushDetailPerField(
    lines,
    METH_CAT.digital,
    "Step 4 · Computing & digital",
    `${P.computingKgPerAnsweredField} kg CO₂e per field (illustrative, C1–C8)`,
    teamB.computing,
    P.computingKgPerAnsweredField
  );

  if (flags.includeLabWorkflow) {
    pushDetailPerField(
      lines,
      METH_CAT.research,
      "Research · Lab equipment",
      `${P.labEquipmentKgPerAnsweredField} kg CO₂e per field (illustrative)`,
      teamB.labEquipment,
      P.labEquipmentKgPerAnsweredField
    );
    pushDetailPerField(
      lines,
      METH_CAT.research,
      "Research · Lab consumables",
      `${P.labConsumablesKgPerAnsweredField} kg CO₂e per field (illustrative)`,
      teamB.labConsumables,
      P.labConsumablesKgPerAnsweredField
    );
  }

  if (flags.includeFieldResearch) {
    const fp = P.fieldTravelKgPerAnsweredField + P.fieldLabKgPerAnsweredField;
    pushDetailPerField(
      lines,
      METH_CAT.research,
      "Research · Field studies",
      `${fp} kg CO₂e per field (illustrative, travel + site combined)`,
      teamB.field,
      fp
    );
  }

  if (flags.includeAnimalResearch) {
    pushDetailPerField(
      lines,
      METH_CAT.research,
      "Research · Animal studies",
      `${P.animalKgPerAnsweredField} kg CO₂e per field (illustrative)`,
      teamB.animal,
      P.animalKgPerAnsweredField
    );
  }

  if (flags.includeOtherMaterials) {
    pushDetailPerField(
      lines,
      METH_CAT.research,
      "Research · Other resources",
      `${P.otherResourcesKgPerAnsweredField} kg CO₂e per field (illustrative)`,
      teamB.otherResources,
      P.otherResourcesKgPerAnsweredField
    );
  }

  pushDetailPerField(
    lines,
    METH_CAT.research,
    "Step 5 · Research context (R1–R2)",
    `${P.researchProfileKgPerAnsweredField} kg CO₂e per field (illustrative)`,
    teamB.researchProfile,
    P.researchProfileKgPerAnsweredField
  );

  const note = teamB.notes?.trim() ?? "";
  if (note) {
    const short = note.length > 400 ? `${note.slice(0, 400)}…` : note;
    lines.push({
      reportCategory: METH_CAT.research,
      stepRef: "Notes",
      fieldLabel: "Notes",
      valueText: short,
      factorRule: "— (no illustrative kg assigned)",
      kgCo2e: 0,
    });
  }

  return lines;
}

/**
 * Footprint split by create-report wizard tab. Space fields show one combined kg per field
 * (lab + site illustrative allocation). Field research shows one combined line per field.
 */
export function teamBFootprintAdditions(teamB: TeamBInputs): WizardFootprintAdd {
  const P = TEAM_B_PLACEHOLDER;
  const flags = effectiveTeamBFlagsForCalc(teamB);
  const a = emptyAdd();

  const dN = filledCount(teamB.demographics);
  if (dN > 0) {
    pushPerField(a, "wizard_profile", teamB.demographics, dN * P.demographicsTotalKgPerField);
  }

  const spaceN = filledCount(teamB.spaceUse);
  if (spaceN > 0) {
    const perField = P.spaceLabKgPerAnsweredField + P.spaceSiteUseKgPerAnsweredField;
    pushPerField(a, "wizard_space", teamB.spaceUse, spaceN * perField);
  }

// ── EMISSION FACTOR TABLES ──────────────────────────────────────────────

  const TRANSPORT_EF: Record<string, number> = {
    "Car (petrol/diesel)": 0.1645,
    "Electric/Hybrid Car": 0.1261,
    "Carpool":             0.0823,
    "Bus":                 0.1184,
    "Train":               0.0355,
    "Bike":                0.0,
    "Walk":                0.0,
    "Flight":              0.0,
    "NA":                  0.0,
  };

// One-way distance bands → midpoint km
  const ONE_WAY_MID: Record<string, number> = {
    "<10": 5, "<20": 15, "<30": 25, "<40": 35, "<50": 45, "50+": 60,
  };

// Round-trip conference distance bands → midpoint km
  const CONF_RT_MID: Record<string, number> = {
    "<100": 50, "100-500": 300, "500-1000": 750, "1000-3000": 2000, "3000+": 5000,
  };

// ── HELPER ───────────────────────────────────────────────────────────────

  function flightEF(rtKm: number): number {
    if (rtKm < 500)  return 0.2459;   // domestic
    if (rtKm < 3700) return 0.1510;   // short-haul
    return 0.1479;                     // long-haul
  }

// ── COMMUTE (T1) ─────────────────────────────────────────────────────────

  const tc = teamB.travelCommute;
  const tripsPerWeek = teamB.demographics?.d1e_mode === "Part-time" ? 3 : 5;
  const workingWeeks = 46;

  const dist1 = ONE_WAY_MID[tc.t1c_km]  ?? 0;
  const ef1   = TRANSPORT_EF[tc.t1a_primary] ?? 0;
  const kgCommutePrimary = dist1 * 2 * tripsPerWeek * workingWeeks * ef1;

  const dist1b = ONE_WAY_MID[tc.t1f_km] ?? 0;
  const ef1b   = TRANSPORT_EF[tc.t1d_sec] ?? 0;
  const kgCommuteSecondary = (tc.t1d_sec && tc.t1d_sec !== "NA")
      ? dist1b * 2 * tripsPerWeek * workingWeeks * ef1b
      : 0;

  if (kgCommutePrimary > 0)
    push(a, "wizard_travel", "Commute — primary mode", kgCommutePrimary);
  if (kgCommuteSecondary > 0)
    push(a, "wizard_travel", "Commute — secondary mode", kgCommuteSecondary);

// ── FIELDWORK TRAVEL (T2) ────────────────────────────────────────────────

  const fwDays = nn(tc.t2a_days);
  const dist2  = ONE_WAY_MID[tc.t2d_km] ?? 0;
  const ef2    = TRANSPORT_EF[tc.t2b_mode] ?? 0;
  const kgFieldPrimary = dist2 * 2 * fwDays * ef2;

  const dist2b = ONE_WAY_MID[tc.t2g_km] ?? 0;
  const ef2b   = TRANSPORT_EF[tc.t2e_sec] ?? 0;
  const kgFieldSecondary = (tc.t2e_sec && tc.t2e_sec !== "NA")
      ? dist2b * 2 * fwDays * ef2b
      : 0;

  if (kgFieldPrimary > 0)
    push(a, "wizard_travel", "Fieldwork travel — primary", kgFieldPrimary);
  if (kgFieldSecondary > 0)
    push(a, "wizard_travel", "Fieldwork travel — secondary", kgFieldSecondary);

// ── CONFERENCE TRAVEL (T3) ───────────────────────────────────────────────

  const confs   = nn(tc.t3a_conf);
  const confRT  = CONF_RT_MID[tc.t3d_rt] ?? 0;
  let ef3: number;

  if (tc.t3b_mode === "Flight") {
    ef3 = flightEF(confRT);
  } else {
    ef3 = TRANSPORT_EF[tc.t3b_mode] ?? 0;
  }
  const kgConfPrimary = confs * confRT * ef3;

  const dist3b = ONE_WAY_MID[tc.t3g_km] ?? 0;
  const ef3b   = TRANSPORT_EF[tc.t3e_sec] ?? 0;
  const kgConfSecondary = (tc.t3e_sec && tc.t3e_sec !== "NA")
      ? confs * dist3b * 2 * ef3b
      : 0;

  if (kgConfPrimary > 0)
    push(a, "wizard_travel", "Conference travel — primary", kgConfPrimary);
  if (kgConfSecondary > 0)
    push(a, "wizard_travel", "Conference travel — secondary", kgConfSecondary);

  const compN = filledCount(teamB.computing);
  if (flags.includeHpcMonthlyKg) {
    for (const [key, raw] of filledEntries(teamB.hpcMonthlyKg)) {
      const kg = nn(raw);
      if (kg > 0) {
        push(a, "wizard_digital", `${teamBFieldLabel(key)}: ${raw}`, kg);
      }
    }
  }
  if (compN > 0) {
    pushPerField(a, "wizard_digital", teamB.computing, compN * P.computingKgPerAnsweredField);
  }

  if (flags.includeLabWorkflow) {
    const le = filledCount(teamB.labEquipment);
    const lc = filledCount(teamB.labConsumables);
    if (le > 0) {
      pushPerField(a, "wizard_research", teamB.labEquipment, le * P.labEquipmentKgPerAnsweredField);
    }
    if (lc > 0) {
      pushPerField(
        a,
        "wizard_research",
        teamB.labConsumables,
        lc * P.labConsumablesKgPerAnsweredField
      );
    }
  }

  if (flags.includeFieldResearch) {
    const fn = filledCount(teamB.field);
    if (fn > 0) {
      const perField = P.fieldTravelKgPerAnsweredField + P.fieldLabKgPerAnsweredField;
      pushPerField(a, "wizard_research", teamB.field, fn * perField);
    }
  }

  if (flags.includeAnimalResearch) {
    const an = filledCount(teamB.animal);
    if (an > 0) {
      pushPerField(a, "wizard_research", teamB.animal, an * P.animalKgPerAnsweredField);
    }
  }

  if (flags.includeOtherMaterials) {
    const on = filledCount(teamB.otherResources);
    if (on > 0) {
      pushPerField(
        a,
        "wizard_research",
        teamB.otherResources,
        on * P.otherResourcesKgPerAnsweredField
      );
    }
  }

  const rp = filledCount(teamB.researchProfile);
  if (rp > 0) {
    pushPerField(
      a,
      "wizard_research",
      teamB.researchProfile,
      rp * P.researchProfileKgPerAnsweredField
    );
  }

  const note = teamB.notes?.trim() ?? "";
  if (note) {
    const short = note.length > 400 ? `${note.slice(0, 400)}…` : note;
    push(a, "wizard_research", `Notes: ${short}`, 0);
  }

  return a;
}
