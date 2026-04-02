/**
 * Shared ECharts palette and options for TRACE branding.
 *
 * Emission charts use value-aware colours: larger category share → warmer (red / amber),
 * smaller share → greener. When all categories are equal (or ~equal), we use a spread
 * along a rainbow so slices stay visually distinct (not one solid colour).
 */

export const TRACE_CHART_COLORS = [
  "#0072B2",
  "#E69F00",
  "#009E73",
  "#CC79A7",
  "#D55E00",
  "#56B4E9",
  "#6A3D9A",
  "#A6761D",
] as const;

function parseRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number
): string {
  const u = Math.min(1, Math.max(0, t));
  return rgbToHex(
    a.r + (b.r - a.r) * u,
    a.g + (b.g - a.g) * u,
    a.b + (b.b - a.b) * u
  );
}

/** Largest share → red; smallest → green (amber in the middle). */
const IMPACT_STOPS = [
  parseRgb("#dc2626"), // red
  parseRgb("#f59e0b"), // amber
  parseRgb("#16a34a"), // green
];

function redAmberGreen(ratio: number): string {
  const t = Math.min(1, Math.max(0, ratio));
  if (t <= 0.5) {
    return lerpRgb(IMPACT_STOPS[0], IMPACT_STOPS[1], t * 2);
  }
  return lerpRgb(IMPACT_STOPS[1], IMPACT_STOPS[2], (t - 0.5) * 2);
}

/**
 * When every category has the same (or ~same) value, map rank to distinct hues
 * along a short spectrum so the chart isn’t one flat colour.
 */
const EQUAL_SPECTRUM = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0d9488",
  "#2563eb",
  "#7c3aed",
].map(parseRgb);

function equalShareColor(rank: number, n: number): string {
  if (n <= 1) {
    return rgbToHex(EQUAL_SPECTRUM[0].r, EQUAL_SPECTRUM[0].g, EQUAL_SPECTRUM[0].b);
  }
  const ratio = rank / (n - 1);
  const span = EQUAL_SPECTRUM.length - 1;
  const pos = ratio * span;
  const i = Math.min(Math.floor(pos), span - 1);
  const f = pos - i;
  return lerpRgb(EQUAL_SPECTRUM[i], EQUAL_SPECTRUM[i + 1], f);
}

/**
 * One colour per category, aligned with `values` array order.
 * Rank is by value (largest kg CO₂e → warmest colour), independent of array order.
 */
export function emissionMagnitudeColors(values: number[]): string[] {
  const n = values.length;
  if (n === 0) return [];

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min;
  const eps = Math.max(Math.abs(max) * 1e-9, 1e-8);
  const equal = span <= eps;

  const rankOf = new Array<number>(n);
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => b.v - a.v);
  indexed.forEach((item, rank) => {
    rankOf[item.i] = rank;
  });

  return values.map((_, i) => {
    const rank = rankOf[i];
    if (equal) {
      return equalShareColor(rank, n);
    }
    const ratio = n === 1 ? 0 : rank / (n - 1);
    return redAmberGreen(ratio);
  });
}

/** @deprecated Prefer emissionMagnitudeColors for breakdown charts */
export function categoryChartColor(index: number): string {
  return TRACE_CHART_COLORS[index % TRACE_CHART_COLORS.length];
}

export const donutChartOption = (data: { name: string; value: number }[]) => {
  const values = data.map((d) => d.value);
  const colors = emissionMagnitudeColors(values);
  return {
    color: colors,
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} kg CO₂e ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: 16,
      top: "center",
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        name: "Emissions",
        type: "pie",
        radius: ["50%", "78%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6 },
        label: { show: false },
        emphasis: {
          label: { show: false },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0 },
        },
        data: data.map((d, i) => ({
          ...d,
          itemStyle: { color: colors[i] },
        })),
      },
    ],
  };
};

export const barChartOption = (data: { name: string; value: number }[]) => {
  const colors = emissionMagnitudeColors(data.map((d) => d.value));
  return {
    color: colors,
    tooltip: {
      trigger: "axis",
      formatter: (
        params: Array<{ name?: string; data?: unknown[] | undefined }> | any[]
      ) => {
        const p = params?.[0];
        const label = p?.name ?? "";
        const raw = Array.isArray(p?.data) ? p.data[0] : undefined;
        return `${label}: ${raw} kg CO₂e`;
      },
    },
    grid: { left: "12%", right: "8%", top: "8%", bottom: "12%" },
    xAxis: {
      type: "category",
      data: data.map((d) => d.name),
      axisLabel: { fontSize: 11, rotate: 20 },
    },
    yAxis: {
      type: "value",
      name: "kg CO₂e",
      nameTextStyle: { fontSize: 11 },
      axisLabel: { fontSize: 11 },
      splitLine: { lineStyle: { type: "dashed", opacity: 0.4 } },
    },
    series: [
      {
        name: "Emissions",
        type: "bar",
        barWidth: "56%",
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: colors[i],
            borderRadius: [4, 4, 0, 0],
          },
        })),
      },
    ],
  };
};
