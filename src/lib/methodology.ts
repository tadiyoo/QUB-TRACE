/**
 * TRACE B — methodology copy for “How we obtained these results”.
 * Per-field methodology rows from saved TRACE calculator inputs (see teamBMethodologyDetailLines).
 */

import type { TraceInputs } from "./calc";
import { mergeTeamBPartial, emptyTeamBInputs } from "./teamB-schema";
import { teamBMethodologyDetailLines, TEAM_B_PLACEHOLDER } from "./teamB-calc";

export { TEAM_B_PLACEHOLDER };

export function getCalculatorMethodologyLines(inputs: TraceInputs | undefined) {
  if (!inputs?.teamB) return teamBMethodologyDetailLines(emptyTeamBInputs());
  return teamBMethodologyDetailLines(mergeTeamBPartial(inputs.teamB));
}

/** Intentionally empty — detailed copy lives in placeholder rules / table only. */
export const METHODOLOGY_INTRO = "";

export const METHODOLOGY_SOURCES =
  "Placeholder model: dashboard-only scaling by answered-field counts. Interpretation modes (kWh, car km, flights, etc.) use standard equivalents (DEFRA / IEA–style) for communication only.";

/** Static summary of placeholder rules when no report is loaded */
export const TRACE_B_RULES_SUMMARY = [
  `Profile (D1, F1, L1): ${TEAM_B_PLACEHOLDER.demographicsTotalKgPerField} kg CO₂e per answered field`,
  `Space (S*): ${TEAM_B_PLACEHOLDER.spaceLabKgPerAnsweredField + TEAM_B_PLACEHOLDER.spaceSiteUseKgPerAnsweredField} kg CO₂e per answered field (combined allocation in the Space tab)`,
  `Travel (T1–T3): ${TEAM_B_PLACEHOLDER.travelCommuteKgPerAnsweredField} kg CO₂e per answered field`,
  `Digital (C1–C8): ${TEAM_B_PLACEHOLDER.computingKgPerAnsweredField} kg CO₂e per answered field; optional HPC months: your kg pasted as-is`,
  `Research (Step 5): lab equipment ${TEAM_B_PLACEHOLDER.labEquipmentKgPerAnsweredField} kg/field, consumables ${TEAM_B_PLACEHOLDER.labConsumablesKgPerAnsweredField} kg/field, field ${TEAM_B_PLACEHOLDER.fieldTravelKgPerAnsweredField + TEAM_B_PLACEHOLDER.fieldLabKgPerAnsweredField} kg/field (combined in UI), animal ${TEAM_B_PLACEHOLDER.animalKgPerAnsweredField} kg/field, other resources ${TEAM_B_PLACEHOLDER.otherResourcesKgPerAnsweredField} kg/field`,
  `Research context (R1–R2): ${TEAM_B_PLACEHOLDER.researchProfileKgPerAnsweredField} kg CO₂e per answered field`,
] as const;
