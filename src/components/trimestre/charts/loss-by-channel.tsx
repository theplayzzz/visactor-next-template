"use client";

import { VChart } from "@visactor/react-vchart";

import { useHydration } from "@/hooks/use-hydration";

const data = [
  { canal: "Meta", motivo: "Sem rede", count: 141 },
  { canal: "Meta", motivo: "Parou de responder", count: 104 },
  { canal: "Meta", motivo: "Desistência", count: 34 },
  { canal: "Google", motivo: "Parou de responder", count: 81 },
  { canal: "Google", motivo: "Sem rede", count: 53 },
  { canal: "Google", motivo: "Desistência", count: 47 },
  { canal: "Google", motivo: "Achou caro", count: 21 },
  { canal: "Outbound", motivo: "Parou de responder", count: 126 },
  { canal: "Outbound", motivo: "Desistência", count: 74 },
  { canal: "Outbound", motivo: "Já é cliente", count: 43 },
  { canal: "Outbound", motivo: "Sem rede", count: 41 },
];

export function LossByChannelChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const spec = {
    type: "bar" as const,
    data: [{ values: data }],
    xField: "count",
    yField: ["canal", "motivo"],
    seriesField: "canal",
    direction: "horizontal" as const,
    stack: false,
    bar: {
      style: { cornerRadius: [0, 3, 3, 0], fillOpacity: 0.85, height: 16 },
    },
    color: [
      "hsl(340, 75%, 55%)",
      "hsl(220, 70%, 50%)",
      "hsl(0, 0%, 55%)",
    ],
    axes: [
      {
        orient: "left" as const,
        label: { style: { fontSize: 11 } },
      },
      {
        orient: "bottom" as const,
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
