"use client";

import { type IBarChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";

import { useHydration } from "@/hooks/use-hydration";

// Dados mensais reais Q1+Abr
// Meta Ads = ads_insights Airbyte
// Google Ads = BigQuery p_ads_CampaignStats
// Vendas atribuídas por tag no Kommo
const data = [
  { mes: "Jan", canal: "Meta", spend: 1146, vendas: 13 },
  { mes: "Jan", canal: "Google", spend: 2432, vendas: 28 },
  { mes: "Fev", canal: "Meta", spend: 1035, vendas: 12 },
  { mes: "Fev", canal: "Google", spend: 2341, vendas: 20 },
  { mes: "Mar", canal: "Meta", spend: 1160, vendas: 15 },
  { mes: "Mar", canal: "Google", spend: 2222, vendas: 36 },
];

const COLORS: Record<string, string> = {
  Meta: "#ec4899",
  Google: "#3b82f6",
};

export function SpendVsReturnsChart() {
  const isHydrated = useHydration();
  if (!isHydrated) return null;

  const spec: IBarChartSpec = {
    type: "bar",
    data: [{ id: "spend", values: data }],
    xField: ["mes", "canal"],
    yField: "spend",
    seriesField: "canal",
    bar: {
      style: {
        cornerRadius: [4, 4, 0, 0],
        fillOpacity: 0.95,
        fill: (datum: Datum) =>
          COLORS[datum.canal as string] ?? "#94a3b8",
      },
    },
    label: {
      visible: true,
      position: "top",
      style: {
        fontSize: 11,
        fontWeight: "bold",
        fill: "#e2e8f0",
      },
      formatMethod: ((_text: unknown, datum?: Datum) => {
        if (!datum) return "";
        return `${datum.vendas}v`;
      }) as never,
    },
    axes: [
      {
        orient: "bottom",
        type: "band",
        label: { style: { fontSize: 12, fill: "#cbd5e1" } },
      },
      {
        orient: "left",
        type: "linear",
        label: {
          style: { fontSize: 10, fill: "#94a3b8" },
          formatMethod: (text: string | string[]) => {
            const v = Array.isArray(text) ? text[0] : text;
            return `R$ ${Number(v).toLocaleString("pt-BR")}`;
          },
        },
        grid: {
          visible: true,
          style: { lineDash: [3, 3], stroke: "#94a3b8", strokeOpacity: 0.15 },
        },
        title: {
          visible: true,
          text: "Investimento mensal (R$) · label = vendas atribuídas",
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
        label: { style: { fontSize: 12, fill: "#cbd5e1" } },
      },
    },
    tooltip: {
      mark: {
        title: {
          visible: true,
          value: (datum: Datum | undefined) =>
            `${datum?.canal} — ${datum?.mes}`,
        },
        content: [
          {
            key: "Investimento",
            value: (datum: Datum | undefined) =>
              `R$ ${Number(datum?.spend ?? 0).toLocaleString("pt-BR")}`,
          },
          {
            key: "Vendas atribuídas",
            value: (datum: Datum | undefined) => `${datum?.vendas}`,
          },
          {
            key: "CPA",
            value: (datum: Datum | undefined) => {
              if (!datum) return "";
              const cpa = Number(datum.spend) / Number(datum.vendas);
              return `R$ ${cpa.toFixed(0)}`;
            },
          },
        ],
      },
    },
    animationAppear: { duration: 800 },
    padding: { left: 8, right: 8, top: 20, bottom: 8 },
  };

  return <VChart spec={spec} style={{ height: "100%", width: "100%" }} />;
}
