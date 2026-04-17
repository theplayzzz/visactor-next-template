"use client";

import { type IBarChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";

import { useHydration } from "@/hooks/use-hydration";

const COLORS: Record<string, string> = {
  Leads: "#3b82f6",
  Vendas: "#10b981",
};

const data = [
  { canal: "Outbound", leads: 668, vendas: 346 },
  { canal: "Google", leads: 336, vendas: 84 },
  { canal: "Meta", leads: 340, vendas: 40 },
  { canal: "Instagram", leads: 70, vendas: 22 },
];

export function ChannelComparisonChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const seriesData = [
    ...data.map((d) => ({ canal: d.canal, value: d.leads, type: "Leads" })),
    ...data.map((d) => ({ canal: d.canal, value: d.vendas, type: "Vendas" })),
  ];

  const spec: IBarChartSpec = {
    type: "bar",
    data: [{ id: "channels", values: seriesData }],
    xField: ["canal", "type"],
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
      style: { fontSize: 11, fontWeight: "bold", fill: "#e2e8f0" },
    },
    axes: [
      {
        orient: "bottom",
        type: "band",
        label: { style: { fontSize: 12, fill: "#94a3b8" } },
      },
      {
        orient: "left",
        type: "linear",
        label: { style: { fontSize: 11, fill: "#94a3b8" } },
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
