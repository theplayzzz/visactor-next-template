"use client";

import { VChart } from "@visactor/react-vchart";

import { useHydration } from "@/hooks/use-hydration";

const data = [
  { motivo: "Parou de responder", count: 330 },
  { motivo: "Sem rede no endereço", count: 239 },
  { motivo: "Desistência", count: 167 },
  { motivo: "Já é cliente", count: 55 },
  { motivo: "Serasa com Adapt", count: 45 },
  { motivo: "Achou caro", count: 41 },
  { motivo: "Mais de 400m da caixa", count: 20 },
  { motivo: "Outros", count: 53 },
];

export function LossReasonsChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const spec = {
    type: "pie" as const,
    data: [{ values: data }],
    valueField: "count",
    categoryField: "motivo",
    outerRadius: 0.85,
    innerRadius: 0.55,
    color: [
      "hsl(220, 70%, 50%)",
      "hsl(340, 75%, 55%)",
      "hsl(30, 80%, 55%)",
      "hsl(280, 65%, 60%)",
      "hsl(160, 60%, 45%)",
      "hsl(200, 50%, 60%)",
      "hsl(45, 70%, 50%)",
      "hsl(0, 0%, 55%)",
    ],
    pie: {
      style: {
        cornerRadius: 3,
        padAngle: 0.02,
      },
      state: {
        hover: { outerRadius: 0.88 },
      },
    },
    label: {
      visible: true,
      position: "outside" as const,
      style: { fontSize: 11 },
      line: { style: { stroke: "rgba(148,163,184,0.3)" } },
    },
    legends: {
      visible: true,
      orient: "right" as const,
      position: "middle" as const,
      item: {
        shape: { style: { symbolType: "circle" } },
        label: { style: { fontSize: 11 } },
      },
    },
    animationAppear: { duration: 800 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
