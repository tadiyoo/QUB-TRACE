/** TRACE user-facing guide text and tables (from TRACE B User Documentation draft, cleaned). */

export const GUIDE_PDF_HREF =
  "https://researchfootprinttool.com/Carbon%20Footprinting%20Tool%20Guidance.pdf";

export const guideSections = {
  intro:
    "Welcome to the TRACE carbon calculator. This guide explains how to work through the calculator, what the inputs mean, and how to use supplier codes and example lists. For official university wording, you can also download the supporting PDF at the end of this page.",

  navigation: {
    title: "Working through your report",
    body: [
      "Themes are split into steps: Profile, Space, Travel, Digital, Research, and Results. Complete every step that applies to your doctoral or research project.",
      "It is worth scanning each step even if you think a section does not apply, so you do not miss a question that might be relevant.",
      "On the Research step, optional topics (lab, field, animal, other materials) use a single switch per block: turn it on only when that topic applies to you.",
    ],
  },

  input: {
    title: "How to answer",
    body: [
      "Most questions use multiple-choice or banded options (e.g. hours per week, distance bands). Where you see a free-text or numeric box, use your best estimate if you do not have exact figures.",
      "If you choose “Other” or similar, a follow-up field may ask you to specify. Units and time scales differ between questions—check the label (e.g. per day, per year, kg, litres).",
    ],
  },

  limitations: {
    title: "What the results represent",
    body: [
      "Consumables and equipment are grouped by carbon-emissions pathways. The tool does not claim to capture every gram of CO₂e for every student; it aims to estimate an average footprint for your research and to highlight areas that are likely to matter most.",
    ],
  },

  hpc: {
    title: "High performance computing (HPC)",
    body: [
      "You can answer the HPC usage questions in the Digital step, and/or—if your facility provides them—enter monthly kg CO₂e equivalents in the optional monthly HPC block (e.g. Kelvin2-style reports).",
    ],
  },

  procurement: {
    title: "Procurement and supplier codes",
    body: [
      "When a question asks for a supplier or procurement code, paste the code from your requisition or purchasing record once you have looked it up in your school or faculty guidance.",
    ],
  },
};

/** Lab consumables: columns match the documentation spreadsheet. */
export const labConsumableExamples: { category: string; examples: string[] }[] = [
  {
    category: "Plastic",
    examples: [
      "Agar plates (plate and agar)",
      "Autoclave bags",
      "Autoclave tape",
      "Cell culture plates",
      "Conical tubes",
      "Culture systems",
      "Cuvettes (plastic)",
      "Dessication pouch",
      "Eppendorf tubes",
      "Falcon tubes",
      "Filter tips",
      "Filters",
      "Gloves",
      "IV lines",
      "Kimwipes / lab wipes",
      "Labels",
      "Micropipette tips",
      "Parafilm",
      "PCR plates",
      "Petri dishes",
      "Pipettes",
      "Electronic pipette tips",
      "PPE",
      "Sample bags",
      "SPE cartridges",
      "Tape",
      "Weigh boats",
    ],
  },
  {
    category: "Glass",
    examples: ["Cuvettes (quartz)", "Microscope slide covers", "Microscope slides"],
  },
  {
    category: "Paper",
    examples: [
      "Blue/white/bench roll",
      "Paper",
      "Whatman paper",
      "Quadrat sheets",
      "Test strips",
      "Temporary labels",
      "Tags",
    ],
  },
  {
    category: "Chemical reagents",
    examples: [
      "Buffer preparation",
      "Filters",
      "Calibration standards",
      "Disposable pH meter (liquid)",
      "Isotopically labelled standards",
      "pH calibration solutions",
      "Reagents",
      "Solvents",
    ],
  },
  {
    category: "Molecular biology kits",
    examples: ["DNA/RNA extraction kits", "ELISA kits", "Genetic modification (CRISPR reagents)", "Western blot kit"],
  },
  {
    category: "Enzymes & biological reagents",
    examples: [
      "Antibodies (primary)",
      "Antibodies (secondary)",
      "Cell culture media",
      "Drugs and pharmaceuticals",
      "Enzymes",
      "Fetal bovine serum",
      "Herb-pest-fung-insect-icides",
      "Tissue/cell stains",
      "Tissue preservatives/fixatives (e.g. formaldehyde)",
      "Veterinary drugs and pharmaceuticals",
    ],
  },
  {
    category: "Chromatography",
    examples: ["HPLC columns"],
  },
  {
    category: "Cleaning chemicals",
    examples: ["Disinfectants", "Ethanol for cleaning (70%)", "Glassware washer detergents", "Soaps and disinfectants"],
  },
  {
    category: "Medical sharps",
    examples: ["Needles", "Scalpel", "Syringes"],
  },
  {
    category: "Industrial gas cylinders",
    examples: ["Gases (He, N₂, H₂, Ar)"],
  },
  {
    category: "Cryogenic supplies",
    examples: ["Liquid nitrogen"],
  },
];

/** Lab equipment examples by theme (from user documentation). */
export const labEquipmentColumns: { title: string; items: string[] }[] = [
  {
    title: "Cold storage",
    items: ["Fridges (~5 °C)", "Freezers (~−20 °C)", "Freezers (−80 °C or lower)"],
  },
  {
    title: "Sterilisation",
    items: ["Autoclave (bench)", "Autoclave (large)", "Lab dishwasher"],
  },
  {
    title: "Molecular bio & genetics",
    items: ["DNA/RNA extraction systems", "PCR machines", "Genome sequencing systems"],
  },
  {
    title: "Cell bio & culture",
    items: [
      "Cell culture incubators",
      "Shaking incubators",
      "Bioreactors / fermenters",
      "Cell sorters",
      "Flow cytometers",
      "ELISA systems",
      "Plate readers",
      "Histology processors",
    ],
  },
  {
    title: "Microscopy & imaging",
    items: [
      "Light microscopy",
      "Fluorescence microscopy",
      "Confocal microscopy",
      "Electron microscopy (SEM/TEM/cryo-EM)",
      "Super-resolution microscopy",
      "AFM / scanning probe microscopy",
      "Live-cell imaging systems",
      "X-ray / CT imaging",
    ],
  },
  {
    title: "Spectroscopy & analytical chemistry",
    items: [
      "Spectrophotometry / colorimetry",
      "FTIR / ATR-FTIR",
      "NMR spectroscopy",
      "Mass spectrometry",
      "Chromatography systems",
      "Metabolomics / proteomics platforms",
      "X-ray diffraction",
      "X-ray fluorescence",
    ],
  },
  {
    title: "Plant / animal",
    items: [
      "Growth chambers",
      "Greenhouses",
      "Artificial plant lighting",
      "Insect rearing chambers",
      "Temperature-controlled rooms",
      "Animal facility temperature control",
    ],
  },
  {
    title: "Lab infrastructure",
    items: [
      "Fume hoods",
      "Vacuum pumps",
      "Water purification (RO / Milli-Q)",
      "Ice machines",
      "Drying ovens / cabinets",
      "Centrifuge",
    ],
  },
];
