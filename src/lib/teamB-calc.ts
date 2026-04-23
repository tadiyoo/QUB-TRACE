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
    const labM = teamB.labEquipment;
    const consM = teamB.labConsumables;
    const EF_E = 0.19553;
    const EF_W = 0.362;
    const FREQ_C: Record<string,number> = {
      "Never":0,"multiple times a day":700,"daily":250,
      "multiple times a week":150,"weekly":50,"monthly":12,
    };
    const FREQ_H: Record<string,number> = {
      "Never":0,"multiple times a day":500,"daily":250,
      "multiple times a week":150,"weekly":46,"monthly":12,
    };

    const labItems: Array<[string, string, number]> = [
      ["L1 · Sterilisation / autoclave", "l1_sterilisation",
        (FREQ_C[labM.l1_sterilisation]??0) * ((0.402*EF_W)+(64.375*EF_E)) / 5],
      ["L2 · Molecular biology (PCR)", "l2_molecular",
        (FREQ_H[labM.l2_molecular]??0) * 0.14 * EF_E / 5],
      ["L3 · Cell biology (incubator)", "l3_cell",
        (FREQ_H[labM.l3_cell]??0) * 0.5 * EF_E / 5],
      ["L4 · Microscopy & imaging", "l4_microscopy",
        (FREQ_H[labM.l4_microscopy]??0) * 0.4 * EF_E / 5],
      ["L5 · X-ray / CT microscopy", "l5_xray",
        (FREQ_H[labM.l5_xray]??0) * 0.55 * EF_E / 5],
      ["L6 · Spectroscopy (NMR)", "l6_spectroscopy",
        (FREQ_H[labM.l6_spectroscopy]??0) * 1.6 * EF_E / 5],
      ["L7 · Lab infrastructure (fume hood)", "l7_infrastructure",
        (FREQ_H[labM.l7_infrastructure]??0) * 0.5 * EF_E / 5],
    ];
    for (const [question, key, kg] of labItems) {
      if (kg > 0) lines.push({
        reportCategory: METH_CAT.research,
        stepRef: question,
        fieldLabel: question,
        valueText: labM[key as keyof typeof labM] as string,
        factorRule: `Frequency → hrs or cycles/yr × equipment kW × ${EF_E} kgCO₂e/kWh ÷ 5 shared`,
        kgCo2e: kg,
      });
    }

    if (labM.l8a_cold === "Yes") {
      const L8D_MID: Record<string,number> = {
        "<50":25,"51-100":75,"101-200":150,"201-400":300,"401-600":500,"600+":700,
      };
      const mKwh = L8D_MID[labM.l8d_power] ?? 0;
      const shared = Math.max(1, nn(labM.l8c_people) || 1);
      const kgL8 = mKwh * 12 * EF_E / shared;
      if (kgL8 > 0) lines.push({
        reportCategory: METH_CAT.research,
        stepRef: "L8 · Cold storage",
        fieldLabel: "L8D · Estimated power use (kWh/month)",
        valueText: `${labM.l8d_power}, shared by ${shared}`,
        factorRule: `${mKwh} kWh/mo × 12 × ${EF_E} ÷ ${shared}`,
        kgCo2e: kgL8,
      });
    }

    const BOX_M: Record<string,number> = {
      "0":0,"<1":6,"1-2":18,"3-5":48,"6-10":96,"11-20":180,"20+":250,
    };
    const CHEM_M: Record<string,number> = {
      "0":0,"<1":0.5,"1-5":3,"6-10":8,"11-20":15,"21-50":35,"50+":60,
    };
    const GAS_M: Record<string,number> = {
      "0":0,"<1":0.5,"1-2":1.5,"3-5":4,"6-10":8,
    };

    const consItems: Array<[string, string, number]> = [
      ["L9A · Plastic consumables (boxes/month)", consM.l9a_plastic,
        (BOX_M[consM.l9a_plastic]??0) * 12 * 0.391 * 1.94],
      ["L10A · Glass consumables (boxes/yr)", consM.l10a_glass,
        (BOX_M[consM.l10a_glass]??0) * 0.25 * 1.437],
      ["L11A · Paper consumables (boxes/yr)", consM.l11a_paper,
        (BOX_M[consM.l11a_paper]??0) * 0.5 * 1.2509],
      ["L12A · Chemical reagents (bottles/yr)", consM.l12a_chemical,
        (CHEM_M[consM.l12a_chemical]??0) * 0.5 * 2.5],
      ["L13A · Molecular biology kits (kits/yr)", consM.l13a_molbio,
        (BOX_M[consM.l13a_molbio]??0) * 1.39],
      ["L14A · Enzymes & biological reagents (vials/yr)", consM.l14a_enzyme,
        (CHEM_M[consM.l14a_enzyme]??0) * 0.01 * 10],
      ["L18A · Industrial gas cylinders (cylinders/yr)", consM.l18a_gas,
        (GAS_M[consM.l18a_gas]??0) * 5 * 0.05],
      ["L19A · Cryogenic supplies (L/yr)", consM.l19a_cryo,
        (CHEM_M[consM.l19a_cryo]??0) * 0.808 * 0.05],
    ];
    for (const [question, value, kg] of consItems) {
      if (kg > 0) lines.push({
        reportCategory: METH_CAT.research,
        stepRef: question,
        fieldLabel: question,
        valueText: value,
        factorRule: "Quantity midpoint × item weight × material EF kgCO₂/kg",
        kgCo2e: kg,
      });
    }
  }

  if (flags.includeFieldResearch) {
    const fldM = teamB.field;
    const ITEM_MASS_M: Record<string,number> = {
      "Camera":0.5,"Audio Recorder":0.3,"Clothing":0.8,"Bucket (Plastic)":0.3,
    };
    const ITEM_EF_M: Record<string,number> = {
      "Camera":5.648,"Audio Recorder":5.648,"Clothing":22.31,"Bucket (Plastic)":3.095,
    };
    const FREQ_UPY: Record<string,number> = {
      "Daily":250,"Weekly":46,"Monthly":12,"Few times per year":4,
    };
    const CHARGE_M: Record<string,number> = { "Camera":0.012,"Audio Recorder":0.003 };
    const BAIT_EF_M: Record<string,number> = {
      "Meat-based":14.0,"Vegetable Based":2.5,"Grass/Grain":1.0,"Mixed":5.0,"Gas":1.0,
    };
    const BAIT_KG_M: Record<string,number> = {
      "0.5":0.5,"1":1,"1.5":1.5,"2":2,"2.5":2.5,"3":3,"3+":4,
    };

    if (fldM.fld_multi === "Yes") {
      const item = fldM.fld_items;
      const kgMfr = (ITEM_MASS_M[item]??0) * (ITEM_EF_M[item]??0);
      if (kgMfr > 0) lines.push({
        reportCategory: METH_CAT.research,
        stepRef: "F3 · Field equipment manufacturing",
        fieldLabel: "F3 · Primary equipment type purchased",
        valueText: item,
        factorRule: `${ITEM_MASS_M[item]??0} kg × ${ITEM_EF_M[item]??0} kgCO₂e/kg (ICE Database V3.0)`,
        kgCo2e: kgMfr,
      });

      const uses = FREQ_UPY[fldM.fld_freq] ?? 0;
      if (fldM.fld_recharge === "Yes") {
        const kgCharge = uses * (CHARGE_M[item]??0.012) * 0.177;
        if (kgCharge > 0) lines.push({
          reportCategory: METH_CAT.research,
          stepRef: "F5 · Equipment recharging",
          fieldLabel: "F5 · Does this equipment require recharging?",
          valueText: `${item}, ${fldM.fld_freq}`,
          factorRule: `${uses} uses/yr × ${CHARGE_M[item]??0.012} kWh × 0.177 kgCO₂e/kWh`,
          kgCo2e: kgCharge,
        });
      }
      if (fldM.fld_battery === "Yes") {
        const kgBat = 2 * uses * 0.023 * 4.633;
        if (kgBat > 0) lines.push({
          reportCategory: METH_CAT.research,
          stepRef: "F6 · Battery consumption",
          fieldLabel: "F6 · Does this equipment use batteries?",
          valueText: `2 AA × ${uses} uses/yr`,
          factorRule: `2 × ${uses} × 0.023 kg × 4.633 kgCO₂e/kg`,
          kgCo2e: kgBat,
        });
      }
    }

    if (fldM.fld_bait === "Yes") {
      const baitKg = BAIT_KG_M[fldM.fld_bait_kg] ?? 0;
      const baitEf = BAIT_EF_M[fldM.fld_bait_cat] ?? 0;
      const kgBait = baitKg * baitEf;
      if (kgBait > 0) lines.push({
        reportCategory: METH_CAT.research,
        stepRef: "F7 · Bait purchase",
        fieldLabel: "F7b · Bait category",
        valueText: `${fldM.fld_bait_cat}, ${fldM.fld_bait_kg} kg`,
        factorRule: `${baitKg} kg × ${baitEf} kgCO₂e/kg (Poore & Nemecek 2018)`,
        kgCo2e: kgBait,
      });
    }
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
    const lab = teamB.labEquipment;
    const cons = teamB.labConsumables;
    const EF_ELEC_R = 0.19553;
    const EF_WATER  = 0.362;

    // Frequency band → cycles or hours per year
    const FREQ_CYCLES: Record<string, number> = {
      "Never": 0, "multiple times a day": 700, "daily": 250,
      "multiple times a week": 150, "weekly": 50, "monthly": 12,
    };
    const FREQ_HOURS: Record<string, number> = {
      "Never": 0, "multiple times a day": 500, "daily": 250,
      "multiple times a week": 150, "weekly": 46, "monthly": 12,
    };

    // ── L1 Sterilisation (autoclave representative) ──────────────────────
    const l1Cycles = FREQ_CYCLES[lab.l1_sterilisation] ?? 0;
    const kgL1 = l1Cycles * ((0.402 * EF_WATER) + (64.375 * EF_ELEC_R)) / 5;
    if (kgL1 > 0) push(a, "wizard_research", "L1 · Sterilisation (autoclave)", kgL1);

    // ── L2 Molecular biology (PCR representative) ────────────────────────
    const l2Hours = FREQ_HOURS[lab.l2_molecular] ?? 0;
    const kgL2 = l2Hours * 0.14 * EF_ELEC_R / 5;
    if (kgL2 > 0) push(a, "wizard_research", "L2 · Molecular biology (PCR)", kgL2);

    // ── L3 Cell biology (incubator representative) ───────────────────────
    const l3Hours = FREQ_HOURS[lab.l3_cell] ?? 0;
    const kgL3 = l3Hours * 0.5 * EF_ELEC_R / 5;
    if (kgL3 > 0) push(a, "wizard_research", "L3 · Cell biology (incubator)", kgL3);

    // ── L4 Microscopy (confocal representative, 0.4 kW) ──────────────────
    const l4Hours = FREQ_HOURS[lab.l4_microscopy] ?? 0;
    const kgL4 = l4Hours * 0.4 * EF_ELEC_R / 5;
    if (kgL4 > 0) push(a, "wizard_research", "L4 · Microscopy & imaging", kgL4);

    // ── L5 X-ray / CT (M6 JetStream representative) ──────────────────────
    const l5Hours = FREQ_HOURS[lab.l5_xray] ?? 0;
    const kgL5 = l5Hours * 0.55 * EF_ELEC_R / 5;
    if (kgL5 > 0) push(a, "wizard_research", "L5 · X-ray / CT microscopy", kgL5);

    // ── L6 Spectroscopy (NMR representative) ─────────────────────────────
    const l6Hours = FREQ_HOURS[lab.l6_spectroscopy] ?? 0;
    const kgL6 = l6Hours * 1.6 * EF_ELEC_R / 5;
    if (kgL6 > 0) push(a, "wizard_research", "L6 · Spectroscopy (NMR)", kgL6);

    // ── L7 Infrastructure (fume hood representative) ──────────────────────
    const l7Hours = FREQ_HOURS[lab.l7_infrastructure] ?? 0;
    const kgL7 = l7Hours * 0.5 * EF_ELEC_R / 5;
    if (kgL7 > 0) push(a, "wizard_research", "L7 · Lab infrastructure (fume hood)", kgL7);

    // ── L8 Cold storage (kWh/month band direct) ───────────────────────────
    const L8D_MID: Record<string, number> = {
      "<50": 25, "51-100": 75, "101-200": 150,
      "201-400": 300, "401-600": 500, "600+": 700,
    };
    if (lab.l8a_cold === "Yes") {
      const monthlyKwh = L8D_MID[lab.l8d_power] ?? 0;
      const sharedPeople = Math.max(1, nn(lab.l8c_people) || 1);
      const kgL8 = (monthlyKwh * 12 * EF_ELEC_R) / sharedPeople;
      if (kgL8 > 0) push(a, "wizard_research", "L8 · Cold storage", kgL8);
    }

    // ── CONSUMABLES ───────────────────────────────────────────────────────

    // Band midpoints — boxes or bottles per year
    const BOX_MID: Record<string, number> = {
      "0": 0, "<1": 6, "1-2": 18, "3-5": 48,
      "6-10": 96, "11-20": 180, "20+": 250,
    };
    const CHEM_MID: Record<string, number> = {
      "0": 0, "<1": 0.5, "1-5": 3, "6-10": 8,
      "11-20": 15, "21-50": 35, "50+": 60,
    };
    const GAS_MID: Record<string, number> = {
      "0": 0, "<1": 0.5, "1-2": 1.5, "3-5": 4, "6-10": 8,
    };

    // L9 Plastic consumables (pipette tips, PP proxy)
    // l9a is boxes/month so × 12
    const l9Boxes = BOX_MID[cons.l9a_plastic] ?? 0;
    const kgL9 = l9Boxes * 12 * 0.391 * 1.94;
    if (kgL9 > 0) push(a, "wizard_research", "L9 · Plastic consumables", kgL9);

    // L10 Glass consumables (microscope slides proxy)
    const l10Boxes = BOX_MID[cons.l10a_glass] ?? 0;
    const kgL10 = l10Boxes * 0.25 * 1.437;
    if (kgL10 > 0) push(a, "wizard_research", "L10 · Glass consumables", kgL10);

    // L11 Paper consumables (1.2509 kgCO₂/kg, ~0.5 kg/box proxy)
    const l11Boxes = BOX_MID[cons.l11a_paper] ?? 0;
    const kgL11 = l11Boxes * 0.5 * 1.2509;
    if (kgL11 > 0) push(a, "wizard_research", "L11 · Paper consumables", kgL11);

    // L12 Chemical reagents (ethanol proxy 2.5 kgCO₂/kg, ~0.5 kg/bottle)
    const l12Bottles = CHEM_MID[cons.l12a_chemical] ?? 0;
    const kgL12 = l12Bottles * 0.5 * 2.5;
    if (kgL12 > 0) push(a, "wizard_research", "L12 · Chemical reagents", kgL12);

    // L13 Molecular biology kits (1.39 kgCO₂/kit)
    const l13Kits = BOX_MID[cons.l13a_molbio] ?? 0;
    const kgL13 = l13Kits * 1.39;
    if (kgL13 > 0) push(a, "wizard_research", "L13 · Molecular biology kits", kgL13);

    // L14 Enzymes (10 kgCO₂/kg, ~0.01 kg/vial proxy)
    const l14Vials = CHEM_MID[cons.l14a_enzyme] ?? 0;
    const kgL14 = l14Vials * 0.01 * 10;
    if (kgL14 > 0) push(a, "wizard_research", "L14 · Enzymes & biological reagents", kgL14);

    // L18 Industrial gas cylinders (LN2 proxy: ~5 kg/cyl × 0.05 kgCO₂/kg)
    const l18Cyls = GAS_MID[cons.l18a_gas] ?? 0;
    const kgL18 = l18Cyls * 5 * 0.05;
    if (kgL18 > 0) push(a, "wizard_research", "L18 · Industrial gas cylinders", kgL18);

    // L19 Cryogenic supplies (LN2: 0.05 kgCO₂/kg, density ~0.808 kg/L)
    const l19Litres = CHEM_MID[cons.l19a_cryo] ?? 0;
    const kgL19 = l19Litres * 0.808 * 0.05;
    if (kgL19 > 0) push(a, "wizard_research", "L19 · Cryogenic supplies (LN2)", kgL19);
  }

  if (flags.includeFieldResearch) {
    const fld = teamB.field;

    // Typical item masses (kg) for manufacturing EF
    const ITEM_MASS: Record<string, number> = {
      "Camera": 0.5, "Audio Recorder": 0.3,
      "Clothing": 0.8, "Bucket (Plastic)": 0.3,
    };
    const ITEM_EF: Record<string, number> = {
      "Camera": 5.648, "Audio Recorder": 5.648,
      "Clothing": 22.31, "Bucket (Plastic)": 3.095,
    };
    const CHARGE_KWH: Record<string, number> = {
      "Camera": 0.012, "Audio Recorder": 0.003,
    };
    const FREQ_USES_PY: Record<string, number> = {
      "Daily": 250, "Weekly": 46, "Monthly": 12, "Few times per year": 4,
    };
    const EF_ELEC_F  = 0.177;
    const EF_BATTERY = 4.633; // kgCO₂/kg AA alkaline
    const BAT_MASS   = 0.023; // kg per AA battery

    if (fld.fld_multi === "Yes") {
      const itemType = fld.fld_items;
      const mass = ITEM_MASS[itemType] ?? 0;
      const mfrEf = ITEM_EF[itemType] ?? 0;
      const kgMfr = mass * mfrEf;
      if (kgMfr > 0) push(a, "wizard_research", `F3 · Equipment manufacturing (${itemType})`, kgMfr);

      const usesPerYear = FREQ_USES_PY[fld.fld_freq] ?? 0;

      // F5 recharging
      if (fld.fld_recharge === "Yes") {
        const chargeKwh = CHARGE_KWH[itemType] ?? 0.012;
        const kgCharge  = usesPerYear * chargeKwh * EF_ELEC_F;
        if (kgCharge > 0) push(a, "wizard_research", `F5 · Equipment recharging (${itemType})`, kgCharge);
      }

      // F6 batteries (assume 2 AA per use as default)
      if (fld.fld_battery === "Yes") {
        const kgBat = 2 * usesPerYear * BAT_MASS * EF_BATTERY;
        if (kgBat > 0) push(a, "wizard_research", "F6 · Battery consumption", kgBat);
      }
    }

    // F7 bait
    const BAIT_EF: Record<string, number> = {
      "Meat-based": 14.0, "Vegetable Based": 2.5,
      "Grass/Grain": 1.0, "Mixed": 5.0, "Gas": 1.0,
    };
    const BAIT_KG_MID: Record<string, number> = {
      "0.5": 0.5, "1": 1, "1.5": 1.5, "2": 2,
      "2.5": 2.5, "3": 3, "3+": 4,
    };
    if (fld.fld_bait === "Yes") {
      const baitKg = BAIT_KG_MID[fld.fld_bait_kg] ?? 0;
      const baitEf = BAIT_EF[fld.fld_bait_cat] ?? 0;
      const kgBait = baitKg * baitEf;
      if (kgBait > 0) push(a, "wizard_research", `F7 · Bait (${fld.fld_bait_cat})`, kgBait);
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
