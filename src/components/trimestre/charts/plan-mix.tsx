"use client";

import { VChart } from "@visactor/react-vchart";

import { useHydration } from "@/hooks/use-hydration";

const data = [
  { plano: "Ultra Basic 730Mb (venc.)", vendas: 295, pct: 60 },
  { plano: "Giga 1Gb (venc.)", vendas: 84, pct: 17 },
  { plano: "Ultra Basic 730Mb (recor.)", vendas: 53, pct: 11 },
  { plano: "Giga 1Gb (recor.)", vendas: 17, pct: 3.5 },
  { plano: "Basic 330Mb", vendas: 14, pct: 2.8 },
  { plano: "Outros", vendas: 29, pct: 5.7 },
];

export function PlanMixChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const spec = {
    type: "bar" as const,
    data: [{ values: data }],
    xField: "vendas",
    yField: "plano",
    direction: "horizontal" as const,
    bar: {
      style: {
        cornerRadius: [0, 4, 4, 0],
        fillOpacity: 0.9,
        height: 24,
      },
    },
    color: ["hsl(220, 70%, 50%)"],
    label: {
      visible: true,
      position: "outside" as const,
      style: { fontSize: 11 },
    },
    axes: [
      {
        orient: "left" as const,
        label: { style: { fontSize: 11 } },
        domainLine: { visible: false },
        tick: { visible: false },
      },
      {
        orient: "bottom" as const,
        label: { style: { fontSize: 11 } },
        grid: {
          style: { lineDash: [4, 4], stroke: "rgba(148,163,184,0.15)" },
        },
        title: { visible: true, text: "Vendas no Q1", style: { fontSize: 11 } },
      },
    ],
    animationAppear: { duration: 600 },
    padding: { left: 8, right: 24, top: 8, bottom: 8 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
