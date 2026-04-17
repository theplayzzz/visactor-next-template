"use client";

import { type IBarChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";

import { useHydration } from "@/hooks/use-hydration";

const COLORS: Record<string, string> = {
  "Sem rede": "#f43f5e",
  "Parou de responder": "#3b82f6",
  Desistência: "#f59e0b",
  "Achou caro": "#8b5cf6",
  "Já é cliente": "#06b6d4",
  Outros: "#64748b",
};

// Dataset completo com TODOS os motivos por canal
const raw = [
  { canal: "Meta", motivo: "Sem rede", count: 141 },
  { canal: "Meta", motivo: "Parou de responder", count: 104 },
  { canal: "Meta", motivo: "Desistência", count: 34 },
  { canal: "Meta", motivo: "Outros", count: 25 },
  { canal: "Google", motivo: "Parou de responder", count: 81 },
  { canal: "Google", motivo: "Sem rede", count: 53 },
  { canal: "Google", motivo: "Desistência", count: 47 },
  { canal: "Google", motivo: "Achou caro", count: 21 },
  { canal: "Google", motivo: "Outros", count: 31 },
  { canal: "Outbound", motivo: "Parou de responder", count: 126 },
  { canal: "Outbound", motivo: "Desistência", count: 74 },
  { canal: "Outbound", motivo: "Já é cliente", count: 43 },
  { canal: "Outbound", motivo: "Sem rede", count: 41 },
  { canal: "Outbound", motivo: "Outros", count: 88 },
];

export function LossByChannelChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  // Calculate totals and percentages per channel
  const totals: Record<string, number> = {};
  for (const r of raw) {
    totals[r.canal] = (totals[r.canal] ?? 0) + r.count;
  }

  const dataWithPct = raw.map((r) => ({
    ...r,
    pct: (r.count / totals[r.canal]!) * 100,
  }));

  const spec: IBarChartSpec = {
    type: "bar",
    data: [{ id: "losses", values: dataWithPct }],
    xField: "pct",
    yField: "canal",
    seriesField: "motivo",
    direction: "horizontal",
    stack: true,
    percent: false,
    bar: {
      style: {
        fillOpacity: 0.95,
        stroke: "#0f172a",
        lineWidth: 1,
        fill: (datum: Datum) =>
          COLORS[datum.motivo as string] ?? "#64748b",
      },
      state: {
        hover: { fillOpacity: 1, stroke: "#fff", lineWidth: 2 },
      },
    },
    label: {
      visible: true,
      position: "inside",
      overlap: { hideOnHit: true },
      style: {
        fontSize: 11,
        fontWeight: "bold",
        fill: "#fff",
      },
      formatMethod: ((_text: unknown, datum?: Datum) => {
        const p = (datum?.pct as number) ?? 0;
        if (p < 6) return "";
        return `${Math.round(p)}%`;
      }) as never,
    },
    axes: [
      {
        orient: "left",
        type: "band",
        label: {
          style: { fontSize: 13, fontWeight: "bold", fill: "#e2e8f0" },
        },
        domainLine: { visible: false },
        tick: { visible: false },
      },
      {
        orient: "bottom",
        type: "linear",
        min: 0,
        max: 100,
        label: {
          style: { fontSize: 10, fill: "#94a3b8" },
          formatMethod: (text: string | string[]) => {
            const v = Array.isArray(text) ? text[0] : text;
            return `${v}%`;
          },
        },
        grid: {
          visible: true,
          style: { lineDash: [3, 3], stroke: "#94a3b8", strokeOpacity: 0.15 },
        },
        title: {
          visible: true,
          text: "% dos leads perdidos de cada canal",
          style: { fontSize: 11, fill: "#94a3b8" },
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
        label: { style: { fontSize: 11, fill: "#cbd5e1" } },
      },
    },
    tooltip: {
      mark: {
        title: {
          visible: true,
          value: (datum: Datum | undefined) =>
            `${datum?.canal} — ${datum?.motivo}`,
        },
        content: [
          {
            key: "Leads perdidos",
            value: (datum: Datum | undefined) =>
              `${datum?.count} (${(Number(datum?.pct ?? 0)).toFixed(1)}%)`,
          },
        ],
      },
    },
    animationAppear: { duration: 800 },
    padding: { left: 8, right: 16, top: 8, bottom: 8 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
