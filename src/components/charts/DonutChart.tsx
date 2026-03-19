"use client";

const COLORS = ["#2d5a45", "#0d9488", "#6b9b7a", "#0d3b2c", "#4a5568", "#94a3b8"];

interface DonutChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

export default function DonutChart({ data, height = 280 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const conic = data
    .map((d, i) => {
      const pct = (d.value / total) * 100;
      const start = acc;
      acc += pct;
      return `${COLORS[i % COLORS.length]} ${start}% ${acc}%`;
    })
    .join(", ");

  return (
    <div style={{ height: `${height}px`, width: "100%", display: "flex", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `conic-gradient(${conic})`,
          flexShrink: 0,
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
                background: COLORS[i % COLORS.length],
              }}
            />
            <span>{d.name}: {Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
