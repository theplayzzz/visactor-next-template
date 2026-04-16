"use client";

import { VChart } from "@visactor/react-vchart";

import { useHydration } from "@/hooks/use-hydration";

const data = [
  { canal: "Outbound", leads: 668, vendas: 346, closeRate: 48.2 },
  { canal: "Google", leads: 336, vendas: 84, closeRate: 26.5 },
  { canal: "Meta", leads: 340, vendas: 40, closeRate: 11.6 },
  { canal: "Instagram", leads: 70, vendas: 22, closeRate: 34.9 },
];

export function ChannelComparisonChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const seriesData = [
    ...data.map((d) => ({
      canal: d.canal,
      value: d.leads,
      type: "Leads",
    })),
    ...data.map((d) => ({
      canal: d.canal,
      value: d.vendas,
      type: "Vendas",
    })),
  ];

  const spec = {
    type: "bar" as const,
    data: [{ values: seriesData }],
    xField: "canal",
    yField: "value",
    seriesField: "type",
    stack: false,
    bar: {
      style: { cornerRadius: [4, 4, 0, 0], fillOpacity: 0.9 },
    },
    color: ["hsl(220, 70%, 50%)", "hsl(160, 60%, 45%)"],
    axes: [
      {
        orient: "bottom" as const,
        label: { style: { fontSize: 12 } },
      },
      {
        orient: "left" as const,
        label: { style: { fontSize: 11 } },
        grid: {
          style: { lineDash: [4, 4], stroke: "rgba(148,163,184,0.15)" },
        },
      },
    ],
    legends: {
      visible: true,
      orient: "top" as const,
      position: "start" as const,
      padding: { bottom: 12 },
      item: { shape: { style: { symbolType: "circle" } } },
    },
    animationAppear: { duration: 600 },
    padding: { left: 8, right: 8, top: 8, bottom: 8 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
