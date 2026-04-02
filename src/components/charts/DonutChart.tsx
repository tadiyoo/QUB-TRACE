"use client";

import { emissionMagnitudeColors } from "@/lib/chartTheme";

interface DonutChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

/** Build conic-gradient stops with thin white gaps so adjacent hues are easier to see. */
function buildConicGradient(
  data: { value: number }[],
  colors: string[]
): string {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const n = data.length;
  if (n === 0) return "#e8dfd0 0% 100%";
  if (n === 1) {
    return `${colors[0] ?? "#dc2626"} 0% 100%`;
  }
  const gapPct = 0.85;
  const sweep = 100 - n * gapPct;
  let acc = 0;
  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = data[i];
    const pct = (d.value / total) * sweep;
    const col = colors[i] ?? "#64748b";
    stops.push(`${col} ${acc}% ${acc + pct}%`);
    acc += pct;
    // White gap after each slice (including after the last, before the first) so the ring reads clearly
    stops.push(`#ffffff ${acc}% ${acc + gapPct}%`);
    acc += gapPct;
  }
  return stops.join(", ");
}

export default function DonutChart({ data, height = 280 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colors = emissionMagnitudeColors(data.map((d) => d.value));
  const conic = buildConicGradient(data, colors);

  return (
    <div style={{ height: `${height}px`, width: "100%", display: "flex", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `conic-gradient(${conic})`,
          flexShrink: 0,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      />
      <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 12 }}>
        {data.map((d, i) => (
          <li key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: colors[i],
                boxShadow: "0 0 0 1px rgba(0,0,0,0.12)",
                flexShrink: 0,
              }}
            />
            <span>
              {d.name}: {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
