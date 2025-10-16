"use client";

import { type IPieChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";
import { useHydration } from "@/hooks/use-hydration";
import type { NPSDistribution } from "@/types/nps";
import { addThousandsSeparator } from "@/lib/utils";

interface ChartProps {
  distribution: NPSDistribution[];
  scoreNPS: number;
}

export default function NPSGaugeChart({
  distribution,
  scoreNPS,
}: ChartProps) {
  const isHydrated = useHydration();

  if (!isHydrated) return null;

  const getScoreColor = (score: number) => {
    if (score >= 50) return "#5fb67a";
    if (score >= 0) return "#f5c36e";
    return "#da6d67";
  };

  const getCategoryColor = (type: string) => {
    if (type.includes("Promotor")) return "#5fb67a";
    if (type.includes("Neutro")) return "#f5c36e";
    return "#da6d67";
  };


  const spec: IPieChartSpec = {
    type: "pie",
    data: [
      {
        id: "distribution",
        values: distribution,
      },
    ],
    valueField: "value",
    categoryField: "type",
    outerRadius: 0.85,
    innerRadius: 0.65,
    startAngle: -180,
    endAngle: 0,
    centerY: "80%",
    padAngle: 2,
    pie: {
      style: {
        cornerRadius: 6,
        fill: (datum: Datum) => getCategoryColor(datum.type as string),
      },
      state: {
        hover: {
          outerRadius: 0.88,
          stroke: "#fff",
          lineWidth: 2,
        },
      },
    },
    indicator: [
      {
        visible: true,
        offsetY: "35%",
        title: {
          style: {
            text: "Score NPS",
            fontSize: 14,
            fontWeight: 500,
            fillOpacity: 0.6,
          },
        },
      },
      {
        visible: true,
        offsetY: "55%",
        title: {
          style: {
            text: scoreNPS.toString(),
            fontSize: 36,
            fontWeight: 700,
            fill: getScoreColor(scoreNPS),
          },
        },
      },
    ],
    legends: {
      visible: true,
      orient: "bottom",
      position: "middle",
      padding: {
        top: 16,
      },
      item: {
        shape: {
          style: {
            symbolType: "circle",
          },
        },
      },
    },
    tooltip: {
      trigger: ["click", "hover"],
      mark: {
        title: {
          visible: false,
        },
        content: [
          {
            key: (datum: Datum | undefined) => datum?.type,
            value: (datum: Datum | undefined) =>
              `${addThousandsSeparator(datum?.value)} (${datum?.percentage}%)`,
          },
        ],
      },
    },
    animationAppear: {
      duration: 1000,
      easing: "cubicInOut",
    },
  };

  return <VChart spec={spec} />;
}
