"use client";

import type { InterpretationId } from "@/lib/interpretations";
import { interpret } from "@/lib/interpretations";

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
        {data.map((d) => {
          const formatted = interpret(d.value, interpretationMode);
          return (
            <div
              key={d.name}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
              className="text-sm"
            >
              <span style={{ width: 80, flexShrink: 0 }}>{d.name}</span>
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
                    background: "#2d5a45",
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
