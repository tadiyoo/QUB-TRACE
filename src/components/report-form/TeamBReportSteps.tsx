"use client";

import type { Dispatch, SetStateAction } from "react";
import type { TeamBInputs, TeamBSectionFlags } from "@/lib/teamB-schema";
import {
  ExpandableModule,
  FieldGrid,
  FieldSelect,
  FieldText,
  OPT_YES_NO,
  OPT_YES_NO_NA,
  OPT_YES_NO_NOTSURE,
  SectionHeader,
  SubHeading,
} from "./FormPrimitives";

export type TeamBWizardStep = "profile" | "space" | "travel" | "digital" | "research";

type Setter = Dispatch<SetStateAction<TeamBInputs>>;

function val(tb: TeamBInputs, section: keyof TeamBInputs, key: string): string {
  const sec = tb[section];
  if (sec && typeof sec === "object" && !Array.isArray(sec) && key in sec) {
    return String((sec as Record<string, string>)[key] ?? "");
  }
  return "";
}

function patch(
  setTb: Setter,
  section: "demographics" | "researchProfile" | "spaceUse" | "travelCommute" | "computing" | "hpcMonthlyKg" | "labEquipment" | "labConsumables" | "field" | "animal" | "otherResources",
  key: string,
  value: string
) {
  setTb((prev) => ({
    ...prev,
    [section]: { ...prev[section], [key]: value },
  }));
}

function patchFlag(setTb: Setter, key: keyof TeamBSectionFlags, value: boolean) {
  setTb((prev) => ({
    ...prev,
    flags: { ...prev.flags, [key]: value },
  }));
}

const DAYS_WEEK = ["", "1", "2", "3", "4", "5", "6", "7"];
const HOUR_BANDS = [
  "",
  "1-5",
  "6-10",
  "11-15",
  "16-20",
  "21-25",
  "26-30",
  "31-35",
  "36+",
];
const USE_BAND = ["", "0-2", "3-5", "6+"];
const SHARE_OFFICE = ["", "Yes", "No", "Not applicable"];
const YEAR_STUDY = ["", "Year 1", "Year 2", "Year 3", "Year 4+"];
const STUDY_MODE = ["", "Full-time", "Part-time"];
const RESEARCH_SETTING = ["", "Lab-based", "Field-based", "Mixed", "Desk-based"];
const TRANSPORT = [
  "",
  "Car (petrol/diesel)",
  "Electric/Hybrid Car",
  "Carpool",
  "Bus",
  "Train",
  "Bike",
  "Walk",
  "Flight",
  "NA",
];
const FREQ_LAB = [
  "",
  "Never",
  "multiple times a day",
  "daily",
  "multiple times a week",
  "weekly",
  "monthly",
];
const HPC_FREQ = ["", "Daily", "weekly", "Monthly", "less than once per month"];
const CLOUD_DATA = [
  "",
  "Less than 10GB",
  "10-100GB",
  "100GB-1TB",
  "1-10TB",
  "more than 10TB",
  "not sure",
];
const MONTHS: { key: string; label: string }[] = [
  { key: "jan", label: "January" },
  { key: "feb", label: "February" },
  { key: "mar", label: "March" },
  { key: "apr", label: "April" },
  { key: "may", label: "May" },
  { key: "jun", label: "June" },
  { key: "jul", label: "July" },
  { key: "aug", label: "August" },
  { key: "sep", label: "September" },
  { key: "oct", label: "October" },
  { key: "nov", label: "November" },
  { key: "dec", label: "December" },
];

/** TRACE B draft CSVs — option lists where the spreadsheet specifies categories/bands. */
const L1A_PAPER_COUNT = ["", "1", "2", "3", "4", "5", "6", "7+"];
const SCREEN_TIME_MONTH_HRS = ["", "0-40", "40-80", "80-120", "120-160", "160+"];
const MONITOR_COUNT = ["", "0", "1", "2", "3", "3+"];
const ONEDRIVE_GB_BAND = ["", "0-50", "50-100", "100-150", "150-200", "200-250", "250+"];
const HDD_GB_BAND = ["", "0-200", "200-400", "400-600", "600-800", "800-1000", "1000+", "N/A"];
const PCT_BAND = ["", "0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60-70", "70-80", "80-90", "90+"];
const HPC_HOURS_MONTH = ["", "<10", "10-50", "50-200", "200-1000", ">1000"];
const GPU_USE_OPTS = ["", "Yes regularly", "occasionally", "no", "not sure"];
const C8_USE_FREQ = ["", "Daily", "Several times per week", "weekly", "monthly", "less than once per month"];
const C8_SESSION_HRS = ["", "<1", "1-4", "4-8", ">8"];
const COMMUTE_HOURS_WEEK = ["", "<1", "<2", "<3", "<4", "<5", "5+"];
const ONE_WAY_KM = ["", "<10", "<20", "<30", "<40", "<50", "50+"];
const ROUND_TRIP_KM_CONF = ["", "<100", "100-500", "500-1000", "1000-3000", "3000+"];
const L8D_KWH_BAND = ["", "<50", "51-100", "101-200", "201-400", "401-600", "600+"];
const LAB_BOX_BAND = ["", "0", "<1", "1-2", "3-5", "6-10", "11-20", "20+"];
const LAB_KIT_BAND = LAB_BOX_BAND;
const LAB_CHEM_BOTTLES = ["", "0", "<1", "1-5", "6-10", "11-20", "21-50", "50+"];
const LAB_CLEANING_L = ["", "0", "<1", "1-2", "3-5", "6-10", "11-20", "<20"];
const LAB_GAS_CYL = ["", "0", "<1", "1-2", "3-5", "6-10"];
const LAB_CRYO_L = LAB_CHEM_BOTTLES;
const ORGANISM_CLASS = [
  "",
  "Insect",
  "Arachnids",
  "Mollusc",
  "Crustaceans",
  "Fish",
  "Birds",
  "Reptiles",
  "Amphibians",
  "Mammal (X-Small)",
  "Mammal (Small)",
  "Mammal (Medium)",
  "Mammal (Large)",
  "Mammal (X-Large)",
  "Other (describe in species / notes)",
];
const FEED_CATEGORY = ["", "Meat-based", "Vegetable Based", "Grass/Grain", "Mixed", "Other"];
const BAIT_CATEGORY = ["", "Meat-based", "Vegetable Based", "Grass/Grain", "Mixed", "Gas", "Other"];
const BAIT_KG_BAND = ["", "0.5", "1", "1.5", "2", "2.5", "3", "3+"];
const MATERIAL_KG_BAND = ["", "1", "2", "3", "4", "5", "6-10", "11-20", "21-50", "50+"];
const DATA_STORAGE_PRIMARY = [
  "",
  "Personal computer",
  "University servers",
  "High Performance Computing storage",
  "Cloud storage services",
  "external hard drives",
  "Mixed / several places",
];
const C8B_EQUIP_TYPES = [
  "",
  "Lab / analytical instrument",
  "Imaging equipment (CT / MRI)",
  "Engineering / fabrication (3D printer, CNC)",
  "Environmental sensor / drone",
  "AV / recording equipment",
  "High-performance computing hardware",
];

const F3_EQUIP_TYPES = [
  "Camera",
  "Audio Recorder",
  "Clothing",
  "Bucket (Plastic)",
];

export function TeamBReportStep({
  step,
  teamB,
  setTeamB,
}: {
  step: TeamBWizardStep;
  teamB: TeamBInputs;
  setTeamB: Setter;
}) {
  const d = (k: string) => val(teamB, "demographics", k);
  const sd = (k: string, v: string) => patch(setTeamB, "demographics", k, v);
  const rp = (k: string) => val(teamB, "researchProfile", k);
  const spr = (k: string, v: string) => patch(setTeamB, "researchProfile", k, v);
  const s = (k: string) => val(teamB, "spaceUse", k);
  const ss = (k: string, v: string) => patch(setTeamB, "spaceUse", k, v);
  const t = (k: string) => val(teamB, "travelCommute", k);
  const st = (k: string, v: string) => patch(setTeamB, "travelCommute", k, v);
  const c = (k: string) => val(teamB, "computing", k);
  const sc = (k: string, v: string) => patch(setTeamB, "computing", k, v);
  const hpc = (k: string) => val(teamB, "hpcMonthlyKg", k);
  const shpc = (k: string, v: string) => patch(setTeamB, "hpcMonthlyKg", k, v);
  const le = (k: string) => val(teamB, "labEquipment", k);
  const sle = (k: string, v: string) => patch(setTeamB, "labEquipment", k, v);
  const lc = (k: string) => val(teamB, "labConsumables", k);
  const slc = (k: string, v: string) => patch(setTeamB, "labConsumables", k, v);
  const f = (k: string) => val(teamB, "field", k);
  const sf = (k: string, v: string) => patch(setTeamB, "field", k, v);
  const a = (k: string) => val(teamB, "animal", k);
  const sa = (k: string, v: string) => patch(setTeamB, "animal", k, v);
  const o = (k: string) => val(teamB, "otherResources", k);
  const so = (k: string, v: string) => patch(setTeamB, "otherResources", k, v);

  if (step === "profile") {
    return (
      <div className="space-y-6 text-sm">
        <SectionHeader kicker="Step 1" title="Profile & funding" />
        <SubHeading>Demographics (D1, L1)</SubHeading>
        <FieldGrid>
          <FieldText label="D1a · Faculty" value={d("d1a_faculty")} onChange={(v) => sd("d1a_faculty", v)} />
          <FieldText label="D1b · School" value={d("d1b_school")} onChange={(v) => sd("d1b_school", v)} />
          <FieldText label="D1c · Centre (or None)" value={d("d1c_centre")} onChange={(v) => sd("d1c_centre", v)} />
          <FieldSelect label="D1d · Year of study" value={d("d1d_year")} onChange={(v) => sd("d1d_year", v)} options={YEAR_STUDY} />
          <FieldSelect label="D1e · Full-time or part-time" value={d("d1e_mode")} onChange={(v) => sd("d1e_mode", v)} options={STUDY_MODE} />
          <FieldSelect
            label="D1f · Primary research setting"
            value={d("d1f_setting")}
            onChange={(v) => sd("d1f_setting", v)}
            options={RESEARCH_SETTING}
          />
        </FieldGrid>
        <SubHeading>Funding (F1)</SubHeading>
        <FieldGrid>
          <FieldText
            label="F1a · Primary PhD funding source"
            value={d("f1a_primary_funding")}
            onChange={(v) => sd("f1a_primary_funding", v)}
            multiline
          />
          <FieldSelect
            label="F1b · Additional funding sources?"
            value={d("f1b_additional")}
            onChange={(v) => sd("f1b_additional", v)}
            options={OPT_YES_NO_NA}
          />
          <FieldText
            label="F1c · If yes, what type?"
            value={d("f1c_additional_detail")}
            onChange={(v) => sd("f1c_additional_detail", v)}
            className="sm:col-span-2"
          />
        </FieldGrid>
        <SubHeading>Outputs (L1)</SubHeading>
        <FieldGrid>
          <FieldSelect
            label="L1a · Peer-reviewed papers (past 12 months)"
            value={d("l1a_papers")}
            onChange={(v) => sd("l1a_papers", v)}
            options={L1A_PAPER_COUNT}
          />
          <FieldText label="L1b · Journal names" value={d("l1b_journals")} onChange={(v) => sd("l1b_journals", v)} multiline className="sm:col-span-2" />
        </FieldGrid>
      </div>
    );
  }

  if (step === "space") {
    return (
      <div className="space-y-6 text-sm">
        <SectionHeader kicker="Step 2" title="Campus & space use" />
        <SubHeading>Home & QUB site</SubHeading>
        <FieldGrid>
          <FieldSelect label="S1a · Work from home regularly?" value={s("s1a_wfh")} onChange={(v) => ss("s1a_wfh", v)} options={OPT_YES_NO} />
          <FieldSelect label="S1b · Days per week at home" value={s("s1b_wfh_days")} onChange={(v) => ss("s1b_wfh_days", v)} options={DAYS_WEEK} />
          <FieldSelect label="S2a · QUB site regularly?" value={s("s2a_qub")} onChange={(v) => ss("s2a_qub", v)} options={OPT_YES_NO} />
          <FieldSelect label="S2b · Days per week on QUB site" value={s("s2b_qub_days")} onChange={(v) => ss("s2b_qub_days", v)} options={DAYS_WEEK} />
          <FieldText label="S2c · Main building" value={s("s2c_main_building")} onChange={(v) => ss("s2c_main_building", v)} />
          <FieldSelect label="S2d · Hours per week (main)" value={s("s2d_main_hours")} onChange={(v) => ss("s2d_main_hours", v)} options={HOUR_BANDS} />
          <FieldText label="S2e · Secondary building" value={s("s2e_sec_building")} onChange={(v) => ss("s2e_sec_building", v)} />
          <FieldSelect label="S2f · Hours per week (secondary)" value={s("s2f_sec_hours")} onChange={(v) => ss("s2f_sec_hours", v)} options={HOUR_BANDS} />
        </FieldGrid>
        <SubHeading>Office & other spaces</SubHeading>
        <FieldGrid>
          <FieldSelect label="S3a · Share an office?" value={s("s3a_share")} onChange={(v) => ss("s3a_share", v)} options={SHARE_OFFICE} />
          <FieldSelect label="S3b · People you share with (band)" value={s("s3b_share_count")} onChange={(v) => ss("s3b_share_count", v)} options={["", "1-5", "6-10", "11-15", "16+"]} />
          <FieldText label="S3c · Lights automatic or manual?" value={s("s3c_lights")} onChange={(v) => ss("s3c_lights", v)} className="sm:col-span-2" />
          <FieldSelect label="S4a · Other QUB spaces?" value={s("s4a_other")} onChange={(v) => ss("s4a_other", v)} options={OPT_YES_NO} />
          <FieldText label="S4b · Which spaces" value={s("s4b_other_detail")} onChange={(v) => ss("s4b_other_detail", v)} className="sm:col-span-2" />
          <FieldSelect label="S4c · Hours per week in those spaces" value={s("s4c_other_hours")} onChange={(v) => ss("s4c_other_hours", v)} options={HOUR_BANDS} />
        </FieldGrid>
        <SubHeading>Printing & kitchen</SubHeading>
        <FieldGrid>
          <FieldSelect label="S5a · Use QUB printer on site?" value={s("s5a_printer")} onChange={(v) => ss("s5a_printer", v)} options={OPT_YES_NO} />
          <FieldSelect label="S5b · Pages printed / day (band)" value={s("s5b_print_band")} onChange={(v) => ss("s5b_print_band", v)} options={USE_BAND} />
          <FieldSelect label="S5c · Photocopy pages (band)" value={s("s5c_copy_band")} onChange={(v) => ss("s5c_copy_band", v)} options={USE_BAND} />
          <FieldSelect label="S6a · Kitchen appliances on site?" value={s("s6a_kitchen")} onChange={(v) => ss("s6a_kitchen", v)} options={OPT_YES_NO} />
          <FieldSelect label="S6 · Kettle uses / day" value={s("s6_kettle")} onChange={(v) => ss("s6_kettle", v)} options={USE_BAND} />
          <FieldSelect label="S6 · Microwave uses / day" value={s("s6_micro")} onChange={(v) => ss("s6_micro", v)} options={USE_BAND} />
          <FieldSelect label="S6 · Fridge uses / day" value={s("s6_fridge")} onChange={(v) => ss("s6_fridge", v)} options={USE_BAND} />
          <FieldSelect label="S6 · Freezer uses / day" value={s("s6_freezer")} onChange={(v) => ss("s6_freezer", v)} options={USE_BAND} />
          <FieldSelect label="S6 · Oven uses / day" value={s("s6_oven")} onChange={(v) => ss("s6_oven", v)} options={USE_BAND} />
          <FieldSelect label="S6 · Hot water tap" value={s("s6_hot")} onChange={(v) => ss("s6_hot", v)} options={USE_BAND} />
          <FieldSelect label="S6 · Cold water tap" value={s("s6_cold")} onChange={(v) => ss("s6_cold", v)} options={USE_BAND} />
          <FieldSelect label="S6 · Water dispenser" value={s("s6_disp")} onChange={(v) => ss("s6_disp", v)} options={USE_BAND} />
          <FieldSelect label="S7a · Bathroom visits / day (band)" value={s("s7_bathroom")} onChange={(v) => ss("s7_bathroom", v)} options={USE_BAND} />
        </FieldGrid>
      </div>
    );
  }

  if (step === "travel") {
    return (
      <div className="space-y-6 text-sm">
        <SectionHeader kicker="Step 3" title="Travel & mobility" />
        <SubHeading>T1 · Commute to campus</SubHeading>
        <FieldGrid>
          <FieldSelect label="T1a · Primary mode" value={t("t1a_primary")} onChange={(v) => st("t1a_primary", v)} options={TRANSPORT} />
          <FieldSelect label="T1b · Hours per week (primary)" value={t("t1b_hours")} onChange={(v) => st("t1b_hours", v)} options={COMMUTE_HOURS_WEEK} />
          <FieldSelect label="T1c · One-way distance" value={t("t1c_km")} onChange={(v) => st("t1c_km", v)} options={ONE_WAY_KM} />
          <FieldSelect label="T1d · Secondary mode" value={t("t1d_sec")} onChange={(v) => st("t1d_sec", v)} options={TRANSPORT} />
          <FieldSelect label="T1e · Hours per week (secondary)" value={t("t1e_hours")} onChange={(v) => st("t1e_hours", v)} options={COMMUTE_HOURS_WEEK} />
          <FieldSelect label="T1f · One-way distance (secondary)" value={t("t1f_km")} onChange={(v) => st("t1f_km", v)} options={ONE_WAY_KM} />
        </FieldGrid>
        <SubHeading>T2 · Field / non-QUB site days</SubHeading>
        <FieldGrid>
          <FieldText label="T2a · Days per year (field / non-QUB sites)" value={t("t2a_days")} onChange={(v) => st("t2a_days", v)} />
          <FieldSelect label="T2b · Primary mode" value={t("t2b_mode")} onChange={(v) => st("t2b_mode", v)} options={TRANSPORT} />
          <FieldSelect label="T2c · Time using primary mode" value={t("t2c_time")} onChange={(v) => st("t2c_time", v)} options={COMMUTE_HOURS_WEEK} />
          <FieldSelect label="T2d · One-way distance" value={t("t2d_km")} onChange={(v) => st("t2d_km", v)} options={ONE_WAY_KM} />
          <FieldSelect label="T2e · Secondary mode" value={t("t2e_sec")} onChange={(v) => st("t2e_sec", v)} options={TRANSPORT} />
          <FieldSelect label="T2f · Secondary time" value={t("t2f_time")} onChange={(v) => st("t2f_time", v)} options={COMMUTE_HOURS_WEEK} />
          <FieldSelect label="T2g · Secondary distance" value={t("t2g_km")} onChange={(v) => st("t2g_km", v)} options={ONE_WAY_KM} />
        </FieldGrid>
        <SubHeading>T3 · Conferences</SubHeading>
        <FieldGrid>
          <FieldSelect label="T3a · Conferences per year" value={t("t3a_conf")} onChange={(v) => st("t3a_conf", v)} options={["", "1", "2", "3", "4", "5", "6", "7+"]} />
          <FieldSelect label="T3b · Primary mode" value={t("t3b_mode")} onChange={(v) => st("t3b_mode", v)} options={TRANSPORT} />
          <FieldSelect label="T3c · Time (primary)" value={t("t3c_time")} onChange={(v) => st("t3c_time", v)} options={COMMUTE_HOURS_WEEK} />
          <FieldSelect label="T3d · Round-trip distance (conference travel)" value={t("t3d_rt")} onChange={(v) => st("t3d_rt", v)} options={ROUND_TRIP_KM_CONF} />
          <FieldSelect label="T3e · Secondary mode" value={t("t3e_sec")} onChange={(v) => st("t3e_sec", v)} options={TRANSPORT} />
          <FieldSelect label="T3f · Secondary time" value={t("t3f_time")} onChange={(v) => st("t3f_time", v)} options={COMMUTE_HOURS_WEEK} />
          <FieldSelect label="T3g · Secondary distance (one-way band)" value={t("t3g_km")} onChange={(v) => st("t3g_km", v)} options={ONE_WAY_KM} />
          <FieldText label="T3h · Airline (if flying)" value={t("t3h_airline")} onChange={(v) => st("t3h_airline", v)} className="sm:col-span-2" />
        </FieldGrid>
      </div>
    );
  }

  if (step === "digital") {
    return (
      <div className="space-y-6 text-sm">
        <SectionHeader kicker="Step 4" title="Computing, AI, cloud & specialist digital" />
        <SubHeading>C1 · Screen time & devices</SubHeading>
        <FieldGrid>
          <FieldSelect
            label="C1a · Project screen time / month (hours band)"
            value={c("c1a_screen")}
            onChange={(v) => sc("c1a_screen", v)}
            options={SCREEN_TIME_MONTH_HRS}
          />
          <FieldSelect label="C1b · Mostly PC, laptop or other?" value={c("c1b_device")} onChange={(v) => sc("c1b_device", v)} options={["", "PC", "Laptop", "other"]} />
          <FieldSelect label="C1c · Device supplied by QUB?" value={c("c1c_qub")} onChange={(v) => sc("c1c_qub", v)} options={OPT_YES_NO} />
          <FieldSelect label="C1d · Additional monitors" value={c("c1d_monitors")} onChange={(v) => sc("c1d_monitors", v)} options={MONITOR_COUNT} />
          <FieldSelect label="C1e · Monitors supplied by QUB?" value={c("c1e_mon_qub")} onChange={(v) => sc("c1e_mon_qub", v)} options={OPT_YES_NO_NA} />
          <FieldSelect label="C1f · QUB OneDrive used (GB band)" value={c("c1f_onedrive")} onChange={(v) => sc("c1f_onedrive", v)} options={ONEDRIVE_GB_BAND} />
          <FieldSelect label="C1g · Additional physical hard drive?" value={c("c1g_hdd")} onChange={(v) => sc("c1g_hdd", v)} options={OPT_YES_NO} />
          <FieldSelect label="C1h · HDD size (GB band)" value={c("c1h_hdd_gb")} onChange={(v) => sc("c1h_hdd_gb", v)} options={HDD_GB_BAND} />
          <FieldSelect label="C1i · % screen time: reading" value={c("c1i_read")} onChange={(v) => sc("c1i_read", v)} options={PCT_BAND} />
          <FieldSelect label="C1j · % screen time: writing" value={c("c1j_write")} onChange={(v) => sc("c1j_write", v)} options={PCT_BAND} />
          <FieldSelect label="C1k · % data analysis / specialist software" value={c("c1k_analysis")} onChange={(v) => sc("c1k_analysis", v)} options={PCT_BAND} />
          <FieldSelect label="C1l · % meetings / admin" value={c("c1l_meet")} onChange={(v) => sc("c1l_meet", v)} options={PCT_BAND} />
        </FieldGrid>
        <SubHeading>C2 · HPC</SubHeading>
        <ExpandableModule
            id="digital-hpc-monthly"
            title="Monthly HPC carbon (optional)"
            enabled={teamB.flags.includeHpcMonthlyKg}
            onEnabledChange={(v) => patchFlag(setTeamB, "includeHpcMonthlyKg", v)}
            tone="cyan"
        >
          <p className="note">
            You can access information about your HPC usage through the monthly emails
            issued by the Kelvin2 team once you have registered for an account.
          </p>
          <FieldGrid>
            {MONTHS.map((m) => (
                <FieldText
                    key={m.key}
                    label={`${m.label} (kg CO₂e)`}
                    value={hpc(m.key)}
                    onChange={(v) => shpc(m.key, v)}
                />
            ))}
          </FieldGrid>
        </ExpandableModule>
        <SubHeading>C3 · Cloud</SubHeading>
        <FieldGrid>
          <FieldSelect label="C3a · Cloud services (AWS/Azure/GCP)?" value={c("c3_cloud")} onChange={(v) => sc("c3_cloud", v)} options={OPT_YES_NO_NOTSURE} />
          <FieldSelect label="C3b · Frequency" value={c("c3b_freq")} onChange={(v) => sc("c3b_freq", v)} options={HPC_FREQ} />
          <FieldSelect label="C3c · Research data volume" value={c("c3c_data")} onChange={(v) => sc("c3c_data", v)} options={CLOUD_DATA} />
          <FieldSelect
            label="C3d · Where most research data is stored"
            value={c("c3d_where")}
            onChange={(v) => sc("c3d_where", v)}
            options={DATA_STORAGE_PRIMARY}
            className="sm:col-span-2"
          />
        </FieldGrid>
        <SubHeading>C7 · AI tools</SubHeading>
        <FieldGrid>
          <FieldSelect label="C7a · Use AI tools for research?" value={c("c7_ai")} onChange={(v) => sc("c7_ai", v)} options={OPT_YES_NO} />
          <FieldText label="C7b · Which types (multi / free text)" value={c("c7b_types")} onChange={(v) => sc("c7b_types", v)} className="sm:col-span-2" multiline />
          <FieldText label="C7 · Other AI tool (specify)" value={c("c7_other")} onChange={(v) => sc("c7_other", v)} />
          <FieldSelect
            label="C7c · Frequency"
            value={c("c7c_freq")}
            onChange={(v) => sc("c7c_freq", v)}
            options={["", "Multiple times per day", "daily", "weekly", "occasionally"]}
          />
        </FieldGrid>
        <SubHeading>C8 · Specialist equipment (digital context)</SubHeading>
        <FieldGrid>
          <FieldSelect label="C8a · Specialist research equipment?" value={c("c8_spec")} onChange={(v) => sc("c8_spec", v)} options={OPT_YES_NO_NOTSURE} />

          <FieldSelect
              label="C8b · Equipment type"
              value={c("c8b_types")}
              onChange={(v) => sc("c8b_types", v)}
              options={C8B_EQUIP_TYPES}
              className="sm:col-span-2"
          />

          <FieldSelect label="C8c · How often" value={c("c8c_freq")} onChange={(v) => sc("c8c_freq", v)} options={C8_USE_FREQ} />
          <FieldSelect label="C8d · Typical session length (hours)" value={c("c8d_hours")} onChange={(v) => sc("c8d_hours", v)} options={C8_SESSION_HRS} />

          <FieldText
              label="C8e · How accessed"
              value={c("c8e_access")}
              onChange={(v) => sc("c8e_access", v)}
              className="sm:col-span-2"
          />
          <FieldText
              label="C8e · How many people share this equipment? (enter 1 if only you)"
              value={c("c8e_shared_count")}
              onChange={(v) => sc("c8e_shared_count", v)}
          />

        </FieldGrid>
      </div>
    );
  }

  if (step === "research") {
    return (
      <div className="space-y-8 text-sm">
        <SectionHeader kicker="Step 5" title="Research & optional modules" />
        <SubHeading>Research context (R1–R2)</SubHeading>
        <FieldGrid>
          <FieldSelect label="R1 · Wet lab work as part of research?" value={rp("r1_wet_lab")} onChange={(v) => spr("r1_wet_lab", v)} options={OPT_YES_NO} />
          <FieldSelect label="R1 · Animal work?" value={rp("r1_animal")} onChange={(v) => spr("r1_animal", v)} options={OPT_YES_NO} />
          <FieldSelect label="R1 · Field work?" value={rp("r1_field")} onChange={(v) => spr("r1_field", v)} options={OPT_YES_NO} />
          <FieldSelect label="R2 · Other QUB specialist equipment?" value={rp("r2_other_equip_yn")} onChange={(v) => spr("r2_other_equip_yn", v)} options={OPT_YES_NO} />
          <FieldText
            label="R2a · Specify equipment"
            value={rp("r2_other_equip_detail")}
            onChange={(v) => spr("r2_other_equip_detail", v)}
            className="sm:col-span-2"
            multiline
          />
        </FieldGrid>
        <div className="space-y-5">
          <ExpandableModule
            id="lab-module"
            title="Lab equipment & consumables"
            enabled={teamB.flags.includeLabWorkflow}
            onEnabledChange={(v) => patchFlag(setTeamB, "includeLabWorkflow", v)}
            tone="emerald"
          >
            <SubHeading>Equipment frequency (L1–L7)</SubHeading>
            <FieldGrid>
              {(
                [
                  ["l1_sterilisation", "L1 · Sterilisation / autoclave / dishwasher"],
                  ["l2_molecular", "L2 · Molecular biology"],
                  ["l3_cell", "L3 · Cell biology & culture"],
                  ["l4_microscopy", "L4 · Microscopy & imaging"],
                  ["l5_xray", "L5 · X-Ray / CT microscopy hours"],
                  ["l6_spectroscopy", "L6 · Spectroscopy / analytical chemistry"],
                  ["l7_infrastructure", "L7 · Lab infrastructure (fume hoods, centrifuge…)"],
                ] as const
              ).map(([key, label]) => (
                <FieldSelect key={key} label={label} value={le(key)} onChange={(v) => sle(key, v)} options={FREQ_LAB} />
              ))}
            </FieldGrid>
            <SubHeading>Cold storage (L8)</SubHeading>
            <FieldGrid>
              <FieldSelect label="L8A · Cold storage in use?" value={le("l8a_cold")} onChange={(v) => sle("l8a_cold", v)} options={OPT_YES_NO} />
              <FieldText label="L8B · Size (m²)" value={le("l8b_size")} onChange={(v) => sle("l8b_size", v)} />
              <FieldText label="L8C · People sharing" value={le("l8c_people")} onChange={(v) => sle("l8c_people", v)} />
              <FieldSelect label="L8D · Power use (kWh/month band)" value={le("l8d_power")} onChange={(v) => sle("l8d_power", v)} options={L8D_KWH_BAND} />
            </FieldGrid>
            <SubHeading>Lab consumables (L9–L19) — quantities & supplier codes</SubHeading>
            <p className="text-xs text-trace-teal mb-2">
              <a
                href="https://www.sciencedirect.com/science/article/pii/S1470160X15003787#sec0010"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
              >
                Reference
              </a>
            </p>
            <FieldGrid>
              {(
                [
                  ["l9a_plastic", "L9A · Plastic consumables (boxes/mo)", LAB_BOX_BAND],
                  ["l9b_plastic_supplier", "L9B · Supplier code", null],
                  ["l10a_glass", "L10A · Glass consumables (boxes/yr)", LAB_BOX_BAND],
                  ["l10b_glass_supplier", "L10B · Supplier code", null],
                  ["l11a_paper", "L11A · Paper consumables (boxes/yr)", LAB_BOX_BAND],
                  ["l11b_paper_supplier", "L11B · Supplier code", null],
                  ["l12a_chemical", "L12A · Chemical reagents (bottles/yr)", LAB_CHEM_BOTTLES],
                  ["l12b_chemical_supplier", "L12B · Supplier code", null],
                  ["l13a_molbio", "L13A · Molecular biology kits (kits/yr)", LAB_KIT_BAND],
                  ["l13b_molbio_supplier", "L13B · Supplier code", null],
                  ["l14a_enzyme", "L14A · Enzymes / biological reagents (vials/yr)", LAB_CHEM_BOTTLES],
                  ["l14b_enzyme_supplier", "L14B · Supplier code", null],
                  ["l15a_chroma", "L15A · Chromatography consumables (items/yr)", LAB_KIT_BAND],
                  ["l15b_chroma_supplier", "L15B · Supplier code", null],
                  ["l16a_cleaning", "L16A · Cleaning chemicals (L/yr)", LAB_CLEANING_L],
                  ["l16b_cleaning_supplier", "L16B · Supplier code", null],
                  ["l17a_sharps", "L17A · Medical sharps (boxes/yr)", LAB_BOX_BAND],
                  ["l17b_sharps_supplier", "L17B · Supplier code", null],
                  ["l18a_gas", "L18A · Industrial gas cylinders (cylinders/yr)", LAB_GAS_CYL],
                  ["l18b_gas_supplier", "L18B · Supplier code", null],
                  ["l19a_cryo", "L19A · Cryogenic supplies (L/yr)", LAB_CRYO_L],
                  ["l19b_cryo_supplier", "L19B · Supplier code", null],
                ] as const
              ).map(([key, label, opts]) =>
                opts ? (
                  <FieldSelect key={key} label={label} value={lc(key)} onChange={(v) => slc(key, v)} options={opts} />
                ) : (
                  <FieldText key={key} label={label} value={lc(key)} onChange={(v) => slc(key, v)} />
                )
              )}
            </FieldGrid>
          </ExpandableModule>

          <ExpandableModule
            id="field-module"
            title="Field research"
            enabled={teamB.flags.includeFieldResearch}
            onEnabledChange={(v) => patchFlag(setTeamB, "includeFieldResearch", v)}
            tone="amber"
          >
            <FieldGrid>
              <FieldText label="F1 · Field studies this year (count)" value={f("fld_studies")} onChange={(v) => sf("fld_studies", v)} />
              <FieldSelect label="F2 · Purchased multi-use field equipment?" value={f("fld_multi")} onChange={(v) => sf("fld_multi", v)} options={OPT_YES_NO} />
              <FieldSelect
                  label="F3 · Primary equipment type purchased"
                  value={f("fld_items")}
                  onChange={(v) => sf("fld_items", v)}
                  options={F3_EQUIP_TYPES}
              />
              <FieldSelect label="F4 · Use frequency" value={f("fld_freq")} onChange={(v) => sf("fld_freq", v)} options={["", "Daily", "Weekly", "Monthly", "Few times per year"]} />
              <FieldSelect label="F5 · Requires recharging?" value={f("fld_recharge")} onChange={(v) => sf("fld_recharge", v)} options={OPT_YES_NO} />
              <FieldSelect label="F6 · Uses batteries?" value={f("fld_battery")} onChange={(v) => sf("fld_battery", v)} options={OPT_YES_NO} />
              <FieldSelect label="F7 · Purchased bait?" value={f("fld_bait")} onChange={(v) => sf("fld_bait", v)} options={OPT_YES_NO} />
              <FieldSelect label="F7a · Bait amount (kg band)" value={f("fld_bait_kg")} onChange={(v) => sf("fld_bait_kg", v)} options={BAIT_KG_BAND} />
              <FieldSelect label="F7b · Bait category" value={f("fld_bait_cat")} onChange={(v) => sf("fld_bait_cat", v)} options={BAIT_CATEGORY} />
              <FieldText label="F7c · Other bait detail" value={f("fld_bait_other")} onChange={(v) => sf("fld_bait_other", v)} className="sm:col-span-2" />
            </FieldGrid>
          </ExpandableModule>

          <ExpandableModule
            id="animal-module"
            title="Animal research"
            enabled={teamB.flags.includeAnimalResearch}
            onEnabledChange={(v) => patchFlag(setTeamB, "includeAnimalResearch", v)}
            tone="rose"
          >
            <FieldGrid>
              <FieldText label="A1 · Animal studies this year" value={a("an_studies")} onChange={(v) => sa("an_studies", v)} />
              <FieldText label="A2 · Species" value={a("an_species")} onChange={(v) => sa("an_species", v)} />
              <FieldText label="A2a · How many?" value={a("an_count")} onChange={(v) => sa("an_count", v)} />
              <FieldSelect
                label="A2b · Organism class / size"
                value={a("an_class")}
                onChange={(v) => sa("an_class", v)}
                options={ORGANISM_CLASS}
                className="sm:col-span-2"
              />
              <FieldSelect label="A2c · Diet" value={a("an_diet")} onChange={(v) => sa("an_diet", v)} options={["", "Carnivore", "Herbivore", "Omnivore"]} />
              <FieldSelect label="A2d · Hosted externally?" value={a("an_external")} onChange={(v) => sa("an_external", v)} options={OPT_YES_NO} />
              <FieldSelect label="A3 · Purchased feed?" value={a("an_feed")} onChange={(v) => sa("an_feed", v)} options={OPT_YES_NO} />
              <FieldSelect label="A3a · Feed amount (kg band)" value={a("an_feed_kg")} onChange={(v) => sa("an_feed_kg", v)} options={BAIT_KG_BAND} />
              <FieldSelect label="A3b · Feed category" value={a("an_feed_type")} onChange={(v) => sa("an_feed_type", v)} options={FEED_CATEGORY} />
              <FieldText label="A3c · Other feed" value={a("an_feed_other")} onChange={(v) => sa("an_feed_other", v)} className="sm:col-span-2" />
            </FieldGrid>
          </ExpandableModule>

          <ExpandableModule
            id="materials-module"
            title="Other resources & materials"
            enabled={teamB.flags.includeOtherMaterials}
            onEnabledChange={(v) => patchFlag(setTeamB, "includeOtherMaterials", v)}
            tone="slate"
          >
            <FieldGrid>
              <FieldSelect label="R1 · Paper / paper-based resources?" value={o("or_paper")} onChange={(v) => so("or_paper", v)} options={OPT_YES_NO} />
              <FieldText
                label="R1a · Types used (list)"
                value={o("or_paper_types")}
                onChange={(v) => so("or_paper_types", v)}
                className="sm:col-span-2"
                multiline
              />
              <FieldSelect label="R1b · Amount used (band)" value={o("or_paper_amt")} onChange={(v) => so("or_paper_amt", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R2 · Metal resources?" value={o("or_metal")} onChange={(v) => so("or_metal", v)} options={OPT_YES_NO} />
              <FieldSelect label="R2a · Amount (kg band)" value={o("or_metal_kg")} onChange={(v) => so("or_metal_kg", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R2c · Recycled (kg band)" value={o("or_metal_rec")} onChange={(v) => so("or_metal_rec", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R3 · Wood / wood-based?" value={o("or_wood")} onChange={(v) => so("or_wood", v)} options={OPT_YES_NO} />
              <FieldSelect label="R3a · Amount (kg band)" value={o("or_wood_kg")} onChange={(v) => so("or_wood_kg", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R3c · Recycled (kg band)" value={o("or_wood_rec")} onChange={(v) => so("or_wood_rec", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R4 · Plastic resources?" value={o("or_plastic")} onChange={(v) => so("or_plastic", v)} options={OPT_YES_NO} />
              <FieldSelect label="R4a · Amount (kg band)" value={o("or_plastic_kg")} onChange={(v) => so("or_plastic_kg", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R4c · Recycled (kg band)" value={o("or_plastic_rec")} onChange={(v) => so("or_plastic_rec", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R5 · Glass resources?" value={o("or_glass")} onChange={(v) => so("or_glass", v)} options={OPT_YES_NO} />
              <FieldSelect label="R5a · Amount (kg band)" value={o("or_glass_kg")} onChange={(v) => so("or_glass_kg", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R5c · Recycled (kg band)" value={o("or_glass_rec")} onChange={(v) => so("or_glass_rec", v)} options={MATERIAL_KG_BAND} />
              <FieldText label="R6 · Other resources (describe)" value={o("or_other")} onChange={(v) => so("or_other", v)} className="sm:col-span-2" multiline />
              <FieldSelect label="R6a · Amount (kg band)" value={o("or_other_kg")} onChange={(v) => so("or_other_kg", v)} options={MATERIAL_KG_BAND} />
              <FieldSelect label="R6c · Recycled (kg band)" value={o("or_other_rec")} onChange={(v) => so("or_other_rec", v)} options={MATERIAL_KG_BAND} />
            </FieldGrid>
          </ExpandableModule>
        </div>

        <div className="rounded-2xl border-2 border-trace-sand/50 bg-gradient-to-br from-white via-trace-cream/25 to-trace-mint/15 p-4 sm:p-5 shadow-sm">
          <SubHeading>Additional notes</SubHeading>
          <FieldText
            label="Free text — assumptions, record-keeping, feedback ideas"
            value={teamB.notes}
            onChange={(v) => setTeamB((prev) => ({ ...prev, notes: v }))}
            multiline
            className="sm:col-span-2"
          />
        </div>
      </div>
    );
  }

  return null;
}
