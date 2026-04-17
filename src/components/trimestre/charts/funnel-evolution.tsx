"use client";

import { type IBarChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";

import { useHydration } from "@/hooks/use-hydration";

const COLORS: Record<string, string> = {
  Leads: "#3b82f6", // blue-500
  Vendas: "#10b981", // emerald-500
  Perdidos: "#f43f5e", // rose-500
};

const data = [
  { month: "Janeiro", leads: 463, vendas: 159, perdidos: 310 },
  { month: "Fevereiro", leads: 405, vendas: 139, perdidos: 275 },
  { month: "Março", leads: 546, vendas: 194, perdidos: 365 },
];

export function FunnelEvolutionChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const seriesData = [
    ...data.map((d) => ({ month: d.month, value: d.leads, type: "Leads" })),
    ...data.map((d) => ({ month: d.month, value: d.vendas, type: "Vendas" })),
    ...data.map((d) => ({
      month: d.month,
      value: d.perdidos,
      type: "Perdidos",
    })),
  ];

  const spec: IBarChartSpec = {
    type: "bar",
    data: [{ id: "funnel", values: seriesData }],
    xField: ["month", "type"],
    yField: "value",
    seriesField: "type",
    bar: {
      style: {
        cornerRadius: [4, 4, 0, 0],
        fillOpacity: 0.95,
        fill: (datum: Datum) =>
          COLORS[datum.type as string] ?? "#94a3b8",
      },
      state: {
        hover: { stroke: "#fff", lineWidth: 1 },
      },
    },
    label: {
      visible: true,
      position: "top",
      style: { fontSize: 10, fontWeight: "bold", fill: "#e2e8f0" },
    },
    axes: [
      {
        orient: "bottom",
        type: "band",
        label: {
          style: { fontSize: 12, fill: "#94a3b8" },
        },
      },
      {
        orient: "left",
        type: "linear",
        label: {
          style: { fontSize: 11, fill: "#94a3b8" },
        },
        grid: {
          visible: true,
          style: {
            lineDash: [4, 4],
            stroke: "#94a3b8",
            strokeOpacity: 0.15,
          },
        },
      },
    ],
    legends: {
      visible: true,
      orient: "top",
      position: "start",
      padding: { bottom: 12 },
      item: {
        shape: { style: { symbolType: "square" } },
        label: { style: { fontSize: 12, fill: "#cbd5e1" } },
      },
    },
    tooltip: {
      mark: {
        title: { visible: false },
        content: [
          {
            key: (datum: Datum | undefined) => datum?.type,
            value: (datum: Datum | undefined) =>
              Number(datum?.value ?? 0).toLocaleString("pt-BR"),
          },
        ],
      },
    },
    animationAppear: { duration: 800 },
    padding: { left: 8, right: 8, top: 8, bottom: 8 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
