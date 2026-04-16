"use client";

import { VChart } from "@visactor/react-vchart";

import { useHydration } from "@/hooks/use-hydration";

const data = [
  { month: "Janeiro", leads: 463, vendas: 159, perdidos: 310 },
  { month: "Fevereiro", leads: 405, vendas: 139, perdidos: 275 },
  { month: "Março", leads: 546, vendas: 194, perdidos: 365 },
];

export function FunnelEvolutionChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const seriesData = [
    ...data.map((d) => ({
      month: d.month,
      value: d.leads,
      type: "Leads",
    })),
    ...data.map((d) => ({
      month: d.month,
      value: d.vendas,
      type: "Vendas",
    })),
    ...data.map((d) => ({
      month: d.month,
      value: d.perdidos,
      type: "Perdidos",
    })),
  ];

  const spec = {
    type: "bar" as const,
    data: [{ values: seriesData }],
    xField: "month",
    yField: "value",
    seriesField: "type",
    stack: false,
    bar: {
      style: { cornerRadius: [4, 4, 0, 0], fillOpacity: 0.9 },
    },
    color: ["hsl(220, 70%, 50%)", "hsl(160, 60%, 45%)", "hsl(340, 75%, 55%)"],
    axes: [
      {
        orient: "bottom" as const,
        label: { style: { fontSize: 12 } },
      },
      {
        orient: "left" as const,
        label: { style: { fontSize: 11 } },
        grid: { style: { lineDash: [4, 4], stroke: "rgba(148,163,184,0.15)" } },
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
