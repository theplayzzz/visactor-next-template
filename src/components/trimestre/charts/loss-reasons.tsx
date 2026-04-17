"use client";

import { VChart, type IPieChartSpec } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";

import { useHydration } from "@/hooks/use-hydration";

const COLORS = [
  "#3b82f6", // blue
  "#f43f5e", // rose (viabilidade — destaque)
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#64748b", // slate
];

export const lossReasonsData = [
  { motivo: "Parou de responder", count: 330 },
  { motivo: "Sem rede no endereço", count: 239 },
  { motivo: "Desistência", count: 167 },
  { motivo: "Já é cliente", count: 55 },
  { motivo: "Serasa com Adapt", count: 45 },
  { motivo: "Achou caro", count: 41 },
  { motivo: "Mais de 400m da caixa", count: 20 },
  { motivo: "Outros", count: 53 },
];

const TOTAL = lossReasonsData.reduce((s, d) => s + d.count, 0);

export function LossReasonsChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const dataWithPct = lossReasonsData.map((d, i) => ({
    ...d,
    pct: ((d.count / TOTAL) * 100).toFixed(1),
    color: COLORS[i],
  }));

  const spec: IPieChartSpec = {
    type: "pie",
    data: [{ id: "losses", values: dataWithPct }],
    valueField: "count",
    categoryField: "motivo",
    outerRadius: 0.82,
    innerRadius: 0.55,
    pie: {
      style: {
        cornerRadius: 2,
        fill: (datum: Datum) => datum.color as string,
      },
      state: {
        hover: { outerRadius: 0.88, lineWidth: 2, stroke: "#fff" },
      },
    },
    label: {
      visible: true,
      position: "outside",
      style: { fontSize: 11, fill: "#cbd5e1" },
      line: { style: { stroke: "#94a3b8", strokeOpacity: 0.3 } },
    },
    legends: {
      visible: true,
      orient: "right",
      position: "middle",
      item: {
        shape: { style: { symbolType: "circle" } },
        label: {
          style: { fontSize: 12, fill: "#cbd5e1" },
          formatMethod: ((text: unknown) => {
            const name = String(text);
            const item = lossReasonsData.find((d) => d.motivo === name);
            if (!item) return name;
            const pct = ((item.count / TOTAL) * 100).toFixed(1);
            return `${name}  •  ${pct}%`;
          }) as never,
        },
      },
    },
    tooltip: {
      mark: {
        title: { visible: false },
        content: [
          {
            key: (datum: Datum | undefined) => datum?.motivo,
            value: (datum: Datum | undefined) => {
              if (!datum) return "";
              const count = Number(datum.count);
              const pct = ((count / TOTAL) * 100).toFixed(1);
              return `${count} leads · ${pct}%`;
            },
          },
        ],
      },
    },
    animationAppear: { duration: 900 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
