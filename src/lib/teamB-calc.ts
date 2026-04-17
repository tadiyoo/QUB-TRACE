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

  const tcL = teamB.travelCommute;
  const TRANSPORT_EF_L: Record<string, number> = {
    "Car (petrol/diesel)": 0.1645, "Electric/Hybrid Car": 0.1261,
    "Carpool": 0.0823, "Bus": 0.1184, "Train": 0.0355,
    "Bike": 0.0, "Walk": 0.0, "Flight": 0.0, "NA": 0.0,
  };
  const ONE_WAY_MID_L: Record<string, number> = {
    "<10": 5, "<20": 15, "<30": 25, "<40": 35, "<50": 45, "50+": 60,
  };
  const CONF_RT_MID_L: Record<string, number> = {
    "<100": 50, "100-500": 300, "500-1000": 750, "1000-3000": 2000, "3000+": 5000,
  };
  const tripsL = teamB.demographics?.d1e_mode === "Part-time" ? 3 : 5;

  const kgCP = (ONE_WAY_MID_L[tcL.t1c_km] ?? 0) * 2 * tripsL * 46 * (TRANSPORT_EF_L[tcL.t1a_primary] ?? 0);
  if (kgCP > 0) lines.push({
    reportCategory: METH_CAT.travel, stepRef: "T1c · Commute primary",
    fieldLabel: "T1a · Primary mode of transport to campus",
    valueText: `${tcL.t1a_primary}, ${tcL.t1c_km} km one-way`,
    factorRule: `${ONE_WAY_MID_L[tcL.t1c_km] ?? 0} km × 2 × ${tripsL} × 46 × ${TRANSPORT_EF_L[tcL.t1a_primary] ?? 0} kgCO₂e/km`,
    kgCo2e: kgCP,
  });

  const kgCS = (tcL.t1d_sec && tcL.t1d_sec !== "NA")
      ? (ONE_WAY_MID_L[tcL.t1f_km] ?? 0) * 2 * tripsL * 46 * (TRANSPORT_EF_L[tcL.t1d_sec] ?? 0)
      : 0;
  if (kgCS > 0) lines.push({
    reportCategory: METH_CAT.travel, stepRef: "T1f · Commute secondary",
    fieldLabel: "T1d · Secondary mode of transport to campus",
    valueText: `${tcL.t1d_sec}, ${tcL.t1f_km} km one-way`,
    factorRule: `${ONE_WAY_MID_L[tcL.t1f_km] ?? 0} km × 2 × ${tripsL} × 46 × ${TRANSPORT_EF_L[tcL.t1d_sec] ?? 0} kgCO₂e/km`,
    kgCo2e: kgCS,
  });

  const fwDaysL = nn(tcL.t2a_days);
  const kgFP = (ONE_WAY_MID_L[tcL.t2d_km] ?? 0) * 2 * fwDaysL * (TRANSPORT_EF_L[tcL.t2b_mode] ?? 0);
  if (kgFP > 0) lines.push({
    reportCategory: METH_CAT.travel, stepRef: "T2d · Fieldwork primary",
    fieldLabel: "T2b · Primary mode of transport for fieldwork",
    valueText: `${tcL.t2b_mode}, ${tcL.t2d_km} km, ${fwDaysL} days/yr`,
    factorRule: `${ONE_WAY_MID_L[tcL.t2d_km] ?? 0} km × 2 × ${fwDaysL} × ${TRANSPORT_EF_L[tcL.t2b_mode] ?? 0} kgCO₂e/km`,
    kgCo2e: kgFP,
  });

  const kgFS = (tcL.t2e_sec && tcL.t2e_sec !== "NA")
      ? (ONE_WAY_MID_L[tcL.t2g_km] ?? 0) * 2 * fwDaysL * (TRANSPORT_EF_L[tcL.t2e_sec] ?? 0)
      : 0;
  if (kgFS > 0) lines.push({
    reportCategory: METH_CAT.travel, stepRef: "T2g · Fieldwork secondary",
    fieldLabel: "T2e · Secondary mode of transport for fieldwork",
    valueText: `${tcL.t2e_sec}, ${tcL.t2g_km} km`,
    factorRule: `${ONE_WAY_MID_L[tcL.t2g_km] ?? 0} km × 2 × ${fwDaysL} × ${TRANSPORT_EF_L[tcL.t2e_sec] ?? 0} kgCO₂e/km`,
    kgCo2e: kgFS,
  });

  const confsL = nn(tcL.t3a_conf);
  const confRTL = CONF_RT_MID_L[tcL.t3d_rt] ?? 0;
  const ef3L = tcL.t3b_mode === "Flight"
      ? (confRTL < 500 ? 0.2459 : confRTL < 3700 ? 0.1510 : 0.1479)
      : (TRANSPORT_EF_L[tcL.t3b_mode] ?? 0);
  const kgConfP = confsL * confRTL * ef3L;
  if (kgConfP > 0) lines.push({
    reportCategory: METH_CAT.travel, stepRef: "T3d · Conference primary",
    fieldLabel: "T3b · Primary mode of transport to conferences",
    valueText: `${tcL.t3b_mode}, ${tcL.t3d_rt} RT, ${confsL} conf/yr`,
    factorRule: `${confsL} × ${confRTL} km × ${ef3L} kgCO₂e/km`,
    kgCo2e: kgConfP,
  });

  const kgConfS = (tcL.t3e_sec && tcL.t3e_sec !== "NA")
      ? confsL * (ONE_WAY_MID_L[tcL.t3g_km] ?? 0) * 2 * (TRANSPORT_EF_L[tcL.t3e_sec] ?? 0)
      : 0;
  if (kgConfS > 0) lines.push({
    reportCategory: METH_CAT.travel, stepRef: "T3g · Conference secondary",
    fieldLabel: "T3e · Secondary mode of transport to conferences",
    valueText: `${tcL.t3e_sec}, ${tcL.t3g_km} km one-way`,
    factorRule: `${confsL} × ${ONE_WAY_MID_L[tcL.t3g_km] ?? 0} km × 2 × ${TRANSPORT_EF_L[tcL.t3e_sec] ?? 0} kgCO₂e/km`,
    kgCo2e: kgConfS,
  });

  const ccL = teamB.computing;
  const EF_ELEC_L = 0.177;
  const SCREEN_MID_L: Record<string, number> = {
    "0-40": 20, "40-80": 60, "80-120": 100, "120-160": 140, "160+": 180,
  };
  const DEVICE_POWER_L: Record<string, number> = {
    "PC": 0.150, "Laptop": 0.065, "other": 0.065,
  };
  const monthlyHrsL = SCREEN_MID_L[ccL.c1a_screen] ?? 0;
  const annualHrsL  = monthlyHrsL * 12;
  const pwrL        = DEVICE_POWER_L[ccL.c1b_device] ?? 0.065;
  const kgDevL      = annualHrsL * pwrL * EF_ELEC_L;
  if (kgDevL > 0) lines.push({
    reportCategory: METH_CAT.digital, stepRef: "C1b · Primary device",
    fieldLabel: "C1a–C1b · Project screen time and device type",
    valueText: `${ccL.c1a_screen} hrs/mo, ${ccL.c1b_device}`,
    factorRule: `${annualHrsL} hrs/yr × ${pwrL} kW × ${EF_ELEC_L}`,
    kgCo2e: kgDevL,
  });

  const MON_MAP_L: Record<string, number> = { "0": 0, "1": 1, "2": 2, "3": 3, "3+": 4 };
  const monCountL = MON_MAP_L[ccL.c1d_monitors] ?? 0;
  const kgMonL    = monCountL * 0.027 * annualHrsL * EF_ELEC_L;
  if (kgMonL > 0) lines.push({
    reportCategory: METH_CAT.digital, stepRef: "C1d · Additional monitors",
    fieldLabel: "C1d · Number of additional monitors",
    valueText: `${ccL.c1d_monitors} monitor(s)`,
    factorRule: `${monCountL} × 0.027 kW × ${annualHrsL} hrs × ${EF_ELEC_L}`,
    kgCo2e: kgMonL,
  });

  const OD_MID_L: Record<string, number> = {
    "0-50": 25, "50-100": 75, "100-150": 125,
    "150-200": 175, "200-250": 225, "250+": 300,
  };
  const odGbL = OD_MID_L[ccL.c1f_onedrive] ?? 0;
  const kgOdL = odGbL * 0.28;
  if (kgOdL > 0) lines.push({
    reportCategory: METH_CAT.digital, stepRef: "C1f · OneDrive storage",
    fieldLabel: "C1f · QUB OneDrive storage used",
    valueText: ccL.c1f_onedrive,
    factorRule: `${odGbL} GB × 0.28`,
    kgCo2e: kgOdL,
  });

  if (ccL.c1g_hdd === "Yes") lines.push({
    reportCategory: METH_CAT.digital, stepRef: "C1h · External hard drive",
    fieldLabel: "C1g–C1h · Additional physical hard drive",
    valueText: "Yes",
    factorRule: "1 × 1.1",
    kgCo2e: 1.1,
  });

  if (flags.includeHpcMonthlyKg) {
    const logTotal = Object.values(teamB.hpcMonthlyKg).reduce((s, v) => s + nn(v), 0);
    if (logTotal > 0) lines.push({
      reportCategory: METH_CAT.digital, stepRef: "C2 · HPC (Kelvin2 log)",
      fieldLabel: "C2 · HPC use - Kelvin2 monthly log",
      valueText: `${logTotal.toFixed(2)} kg total`,
      factorRule: "Direct from Kelvin2 log",
      kgCo2e: logTotal,
    });
  } else if (ccL.c2_hpc === "Yes") {
    const HPC_MID_L: Record<string, number> = {
      "<10": 5, "10-50": 30, "50-200": 125, "200-1000": 600, ">1000": 1500,
    };
    const hpcHrsL = HPC_MID_L[ccL.c2d_hours] ?? 0;
    const gpuPwrL = ["Yes regularly", "occasionally"].includes(ccL.c2e_gpu) ? 2.5 : 1.0;
    const kgHpcL  = hpcHrsL * 12 * gpuPwrL * EF_ELEC_L;
    if (kgHpcL > 0) lines.push({
      reportCategory: METH_CAT.digital, stepRef: "C2d · HPC compute estimate",
      fieldLabel: "C2d–C2e · HPC hours per month and GPU use",
      valueText: `${ccL.c2d_hours} hrs/mo, GPU: ${ccL.c2e_gpu}`,
      factorRule: `${hpcHrsL} hrs/mo × 12 × ${gpuPwrL} kW × ${EF_ELEC_L}`,
      kgCo2e: kgHpcL,
    });
  }

  const STOR_MID_L: Record<string, number> = {
    "Less than 10GB": 5, "10-100GB": 55, "100GB-1TB": 550,
    "1-10TB": 5500, "more than 10TB": 15000,
  };
  const storGbL = STOR_MID_L[ccL.c3c_data] ?? 0;
  const kgStorL = storGbL * 0.0177;
  if (kgStorL > 0) lines.push({
    reportCategory: METH_CAT.digital, stepRef: "C3c · Research data storage",
    fieldLabel: "C3c · Approximate research data volume",
    valueText: ccL.c3c_data,
    factorRule: `${storGbL} GB × 0.0177`,
    kgCo2e: kgStorL,
  });

  if (ccL.c7_ai === "Yes") {
    const AI_MAP_L: Record<string, number> = {
      "Multiple times per day": 600, "daily": 200, "weekly": 50, "occasionally": 10,
    };
    const qpmL  = AI_MAP_L[ccL.c7c_freq] ?? 0;
    const kgAiL = qpmL * 12 * 0.00034 * EF_ELEC_L;
    if (kgAiL > 0) lines.push({
      reportCategory: METH_CAT.digital, stepRef: "C7c · AI tools",
      fieldLabel: "C7a–C7c · AI tool use and frequency",
      valueText: `${ccL.c7c_freq} (≈${qpmL} queries/mo)`,
      factorRule: `${qpmL * 12} queries/yr × 0.00034 × ${EF_ELEC_L}`,
      kgCo2e: kgAiL,
    });
  }

  if (ccL.c8_spec === "Yes") {
    const C8B_PWR_L: Record<string, number> = {
      "Lab / analytical instrument": 0.500,
      "Imaging equipment (CT / MRI)": 3.000,
      "Engineering / fabrication (3D printer, CNC)": 0.400,
      "Environmental sensor / drone": 0.250,
      "AV / recording equipment": 0.150,
      "High-performance computing hardware": 2.500,
    };
    const C8C_L: Record<string, number> = {
      "Daily": 250, "Several times per week": 150,
      "weekly": 46, "monthly": 12, "less than once per month": 6,
    };
    const C8D_L: Record<string, number> = {
      "<1": 0.5, "1-4": 2.5, "4-8": 6.0, ">8": 10.0,
    };
    const equPwrL  = C8B_PWR_L[ccL.c8b_types] ?? 0.5;
    const usesL    = C8C_L[ccL.c8c_freq] ?? 0;
    const hrsL     = C8D_L[ccL.c8d_hours] ?? 0;
    const sharedL  = Math.max(1, nn(ccL.c8e_shared_count) || 1);
    const kgSpecL  = (equPwrL * usesL * hrsL * EF_ELEC_L) / sharedL;
    if (kgSpecL > 0) lines.push({
      reportCategory: METH_CAT.digital, stepRef: "C8d · Specialist equipment",
      fieldLabel: "C8b–C8d · Specialist equipment type, frequency and session length",
      valueText: `${ccL.c8b_types}, ${ccL.c8c_freq}, ${ccL.c8d_hours} hrs/session, shared by ${sharedL}`,
      factorRule: `${equPwrL} kW × ${usesL} × ${hrsL} hrs × ${EF_ELEC_L} ÷ ${sharedL}`,
      kgCo2e: kgSpecL,
    });
  }

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

  const cc = teamB.computing;

  const SCREEN_MID: Record<string, number> = {
    "0-40": 20, "40-80": 60, "80-120": 100, "120-160": 140, "160+": 180,
  };
  const DEVICE_POWER: Record<string, number> = {
    "PC": 0.150, "Laptop": 0.065, "other": 0.065,
  };
  const ONEDRIVE_MID: Record<string, number> = {
    "0-50": 25, "50-100": 75, "100-150": 125,
    "150-200": 175, "200-250": 225, "250+": 300,
  };
  const HPC_HOURS_MID: Record<string, number> = {
    "<10": 5, "10-50": 30, "50-200": 125, "200-1000": 600, ">1000": 1500,
  };
  const STORAGE_MID: Record<string, number> = {
    "Less than 10GB": 5,   "10-100GB": 55,
    "100GB-1TB": 550,      "1-10TB": 5500, "more than 10TB": 15000,
  };
  const AI_QUERIES_PM: Record<string, number> = {
    "Multiple times per day": 600, "daily": 200, "weekly": 50, "occasionally": 10,
  };
  const C8B_POWER: Record<string, number> = {
    "Lab / analytical instrument":                  0.500,
    "Imaging equipment (CT / MRI)":                 3.000,
    "Engineering / fabrication (3D printer, CNC)":  0.400,
    "Environmental sensor / drone":                 0.250,
    "AV / recording equipment":                     0.150,
    "High-performance computing hardware":          2.500,
  };
  const C8C_USES_PY: Record<string, number> = {
    "Daily": 250, "Several times per week": 150,
    "weekly": 46, "monthly": 12, "less than once per month": 6,
  };
  const C8D_HOURS_MID: Record<string, number> = {
    "<1": 0.5, "1-4": 2.5, "4-8": 6.0, ">8": 10.0,
  };
  const MONITOR_COUNT_MAP: Record<string, number> = {
    "0": 0, "1": 1, "2": 2, "3": 3, "3+": 4,
  };

  const EF_ELEC = 0.177;

// C1b — primary device
  const monthlyHrs  = SCREEN_MID[cc.c1a_screen] ?? 0;
  const annualHrs   = monthlyHrs * 12;
  const devicePower = DEVICE_POWER[cc.c1b_device] ?? 0.065;
  const kgDevice    = annualHrs * devicePower * EF_ELEC;
  if (kgDevice > 0)
    push(a, "wizard_digital", "Primary device", kgDevice);

// C1d — additional monitors
  const monCount   = MONITOR_COUNT_MAP[cc.c1d_monitors] ?? 0;
  const kgMonitors = monCount * 0.027 * annualHrs * EF_ELEC;
  if (kgMonitors > 0)
    push(a, "wizard_digital", "Additional monitors", kgMonitors);

// C1f — OneDrive storage
  const onedriveGb = ONEDRIVE_MID[cc.c1f_onedrive] ?? 0;
  const kgOnedrive = onedriveGb * 0.28;
  if (kgOnedrive > 0)
    push(a, "wizard_digital", "OneDrive cloud storage", kgOnedrive);

// C1h — external HDD (EF is per drive/year; treat C1g = Yes as 1 drive)
  const kgHdd = cc.c1g_hdd === "Yes" ? 1.1 : 0;
  if (kgHdd > 0)
    push(a, "wizard_digital", "External hard drive", kgHdd);

// C2 — HPC (prefer Kelvin2 logs if the module is enabled, otherwise estimate)
  if (flags.includeHpcMonthlyKg) {
    const logTotal = Object.values(teamB.hpcMonthlyKg)
        .reduce((s, v) => s + nn(v), 0);
    if (logTotal > 0)
      push(a, "wizard_digital", "HPC — Kelvin2 monthly log", logTotal);
  } else if (cc.c2_hpc === "Yes") {
    const hpcHrsMonth = HPC_HOURS_MID[cc.c2d_hours] ?? 0;
    const gpuPower    = ["Yes regularly", "occasionally"].includes(cc.c2e_gpu) ? 2.5 : 1.0;
    const kgHpc       = hpcHrsMonth * 12 * gpuPower * EF_ELEC;
    if (kgHpc > 0)
      push(a, "wizard_digital", "HPC compute estimate", kgHpc);
  }

// C3c — research data storage
  const storageGb = STORAGE_MID[cc.c3c_data] ?? 0;
  const kgStorage = storageGb * 0.0177;
  if (kgStorage > 0)
    push(a, "wizard_digital", "Research data storage", kgStorage);

// C7c — AI tools
  if (cc.c7_ai === "Yes") {
    const queriesPm = AI_QUERIES_PM[cc.c7c_freq] ?? 0;
    const kgAi      = queriesPm * 12 * 0.00034 * EF_ELEC;
    if (kgAi > 0)
      push(a, "wizard_digital", "AI tool use", kgAi);
  }

// C8d — specialist equipment
  if (cc.c8_spec === "Yes") {
    const powerKw      = C8B_POWER[cc.c8b_types] ?? 0.5;
    const usesPerYr    = C8C_USES_PY[cc.c8c_freq] ?? 0;
    const hrsSesh      = C8D_HOURS_MID[cc.c8d_hours] ?? 0;
    const sharedWith   = Math.max(1, nn(cc.c8e_shared_count) || 1);
    const kgSpecialist = (powerKw * usesPerYr * hrsSesh * EF_ELEC) / sharedWith;
    if (kgSpecialist > 0)
      push(a, "wizard_digital", "Specialist equipment", kgSpecialist);
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
