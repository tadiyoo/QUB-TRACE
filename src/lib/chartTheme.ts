/**
 * Shared ECharts palette and options for TRACE branding
 */

export const TRACE_CHART_COLORS = [
  "#2d5a45", // sage
  "#0d9488", // teal
  "#6b9b7a", // mint
  "#0d3b2c", // forest
  "#4a5568", // stone
  "#94a3b8", // slate
];

export const donutChartOption = (data: { name: string; value: number }[]) => ({
  color: TRACE_CHART_COLORS,
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
      data,
    },
  ],
});

export const barChartOption = (data: { name: string; value: number }[]) => ({
  color: [TRACE_CHART_COLORS[0]],
  tooltip: {
    trigger: "axis",
    formatter: (params: { data: number[] }[]) =>
      `${params[0].name}: ${params[0].data[0]} kg CO₂e`,
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
      data: data.map((d) => d.value),
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
    },
  ],
});
