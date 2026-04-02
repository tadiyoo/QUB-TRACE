"use client";

import type { InterpretationId } from "@/lib/interpretations";
import { interpret } from "@/lib/interpretations";
import { emissionMagnitudeColors } from "@/lib/chartTheme";

interface BarChartProps {
  data: { name: string; value: number }[];
  height?: number;
  interpretationMode?: InterpretationId;
}

export default function EmissionsBarChart({
  data,
  height = 260,
  interpretationMode = "kg_co2e",
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = emissionMagnitudeColors(data.map((d) => d.value));

  return (
    <div style={{ height: `${height}px`, width: "100%" }} className="text-trace-forest">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        {data.map((d, i) => {
          const formatted = interpret(d.value, interpretationMode);
          const barColor = colors[i] ?? "#64748b";
          return (
            <div
              key={d.name}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
              className="text-sm"
            >
              <span style={{ width: 80, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: barColor,
                    flexShrink: 0,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                />
                {d.name}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 28,
                  background: "#e8dfd0",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(d.value / max) * 100}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: 6,
                  }}
                />
              </div>
              <span style={{ width: 72, textAlign: "right", fontSize: 12 }}>
                {formatted.formatted}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
