"use client";

import { type IBarChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";

import { useHydration } from "@/hooks/use-hydration";

// Dados reais Q1 validados via API Kommo + Neon DB (492 vendas totais)
const data = [
  { plano: "Ultra Basic 730Mb (venc.)", vendas: 295, pct: 60.0 },
  { plano: "Giga 1Gb (venc.)", vendas: 84, pct: 17.1 },
  { plano: "Ultra Basic 730Mb (recor.)", vendas: 53, pct: 10.8 },
  { plano: "Giga 1Gb (recor.)", vendas: 17, pct: 3.5 },
  { plano: "Basic 330Mb", vendas: 14, pct: 2.8 },
  { plano: "Ponto Adicional", vendas: 9, pct: 1.8 },
  { plano: "Roteador Adicional Giga", vendas: 4, pct: 0.8 },
  { plano: "UFRRJ Alojamento 90Mb", vendas: 4, pct: 0.8 },
  { plano: "UFRRJ Alojamento 60Mb", vendas: 4, pct: 0.8 },
  { plano: "Outros", vendas: 8, pct: 1.6 },
];

export function PlanMixChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const spec: IBarChartSpec = {
    type: "bar",
    data: [{ id: "plans", values: data }],
    xField: "vendas",
    yField: "plano",
    direction: "horizontal",
    bar: {
      style: {
        cornerRadius: [0, 4, 4, 0],
        fillOpacity: 0.9,
        fill: (datum: Datum) => {
          const pct = datum.pct as number;
          if (pct >= 50) return "#3b82f6";
          if (pct >= 15) return "#60a5fa";
          if (pct >= 5) return "#93c5fd";
          return "#64748b";
        },
      },
      state: {
        hover: { fillOpacity: 1, stroke: "#fff", lineWidth: 1 },
      },
    },
    label: {
      visible: true,
      position: "outside",
      style: {
        fontSize: 11,
        fontWeight: "bold",
        fill: "#e2e8f0",
      },
      formatMethod: ((_text: unknown, datum?: Datum) => {
        if (!datum) return "";
        return `${datum.vendas} (${datum.pct}%)`;
      }) as never,
    },
    axes: [
      {
        orient: "left",
        type: "band",
        label: {
          style: { fontSize: 11, fill: "#cbd5e1" },
        },
        domainLine: { visible: false },
        tick: { visible: false },
      },
      {
        orient: "bottom",
        type: "linear",
        label: {
          style: { fontSize: 10, fill: "#94a3b8" },
        },
        grid: {
          visible: true,
          style: { lineDash: [3, 3], stroke: "#94a3b8", strokeOpacity: 0.15 },
        },
        title: {
          visible: true,
          text: "Vendas no Trimestre (Jan-Mar)",
          style: { fontSize: 11, fill: "#94a3b8" },
        },
      },
    ],
    tooltip: {
      mark: {
        title: {
          visible: true,
          value: (datum: Datum | undefined) => datum?.plano,
        },
        content: [
          {
            key: "Vendas",
            value: (datum: Datum | undefined) =>
              `${datum?.vendas} (${datum?.pct}% do total)`,
          },
        ],
      },
    },
    animationAppear: { duration: 800 },
    padding: { left: 8, right: 60, top: 8, bottom: 8 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
