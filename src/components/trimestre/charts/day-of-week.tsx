"use client";

import { type IBarChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";

import { useHydration } from "@/hooks/use-hydration";

// Baseado em 2026-01-01 → 2026-03-31 (91 dias)
const data = [
  { dow: "Seg", avg: 20.69, total: 269, tier: "alto" },
  { dow: "Ter", avg: 20.0, total: 260, tier: "alto" },
  { dow: "Qua", avg: 19.0, total: 228, tier: "alto" },
  { dow: "Sex", avg: 15.46, total: 201, tier: "medio" },
  { dow: "Qui", avg: 15.23, total: 198, tier: "medio" },
  { dow: "Sab", avg: 11.15, total: 145, tier: "baixo" },
  { dow: "Dom", avg: 8.77, total: 114, tier: "baixo" },
];

const COLORS: Record<string, string> = {
  alto: "#10b981",
  medio: "#f59e0b",
  baixo: "#64748b",
};

export function DayOfWeekChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const spec: IBarChartSpec = {
    type: "bar",
    data: [{ id: "dow", values: data }],
    xField: "dow",
    yField: "avg",
    bar: {
      style: {
        cornerRadius: [6, 6, 0, 0],
        fillOpacity: 0.95,
        fill: (datum: Datum) =>
          COLORS[datum.tier as string] ?? "#64748b",
      },
      state: {
        hover: { fillOpacity: 1, stroke: "#fff", lineWidth: 1 },
      },
    },
    label: {
      visible: true,
      position: "top",
      style: {
        fontSize: 13,
        fontWeight: "bold",
        fill: "#e2e8f0",
      },
      formatMethod: ((_text: unknown, datum?: Datum) => {
        if (!datum) return "";
        return Number(datum.avg).toFixed(1);
      }) as never,
    },
    axes: [
      {
        orient: "bottom",
        type: "band",
        label: {
          style: { fontSize: 13, fontWeight: "bold", fill: "#cbd5e1" },
        },
      },
      {
        orient: "left",
        type: "linear",
        min: 0,
        label: { style: { fontSize: 10, fill: "#94a3b8" } },
        grid: {
          visible: true,
          style: { lineDash: [3, 3], stroke: "#94a3b8", strokeOpacity: 0.15 },
        },
        title: {
          visible: true,
          text: "Leads por dia (média)",
          style: { fontSize: 11, fill: "#94a3b8" },
        },
      },
    ],
    tooltip: {
      mark: {
        title: {
          visible: true,
          value: (datum: Datum | undefined) => datum?.dow,
        },
        content: [
          {
            key: "Média/dia",
            value: (datum: Datum | undefined) =>
              `${Number(datum?.avg ?? 0).toFixed(1)} leads`,
          },
          {
            key: "Total Q1",
            value: (datum: Datum | undefined) => `${datum?.total} leads`,
          },
        ],
      },
    },
    animationAppear: { duration: 700 },
    padding: { left: 8, right: 8, top: 20, bottom: 8 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
