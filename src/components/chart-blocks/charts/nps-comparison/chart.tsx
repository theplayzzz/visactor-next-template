"use client";

import { type IBarChartSpec, VChart } from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";
import { useHydration } from "@/hooks/use-hydration";
import type { NPSComparison } from "@/types/nps";

interface ChartProps {
  comparison: NPSComparison[];
}

export default function NPSComparisonChart({ comparison }: ChartProps) {
  const isHydrated = useHydration();

  if (!isHydrated) return null;

  const getDimensionColor = (dimension: string) => {
    if (dimension.includes("R1")) return "#4D96FF";
    return "#6BCB77";
  };

  const spec: IBarChartSpec = {
    type: "bar",
    data: [
      {
        id: "comparison",
        values: comparison,
      },
    ],
    xField: "dimension",
    yField: "average",
    seriesField: "dimension",
    bar: {
      style: {
        cornerRadius: [8, 8, 0, 0],
        fill: (datum: Datum) => getDimensionColor(datum.dimension as string),
      },
      state: {
        hover: {
          stroke: "#fff",
          lineWidth: 2,
        },
      },
    },
    axes: [
      {
        orient: "left",
        type: "linear",
        min: 0,
        max: 5,
        grid: {
          visible: true,
          style: {
            lineDash: [4, 4],
            lineWidth: 1,
            strokeOpacity: 0.3,
          },
        },
        label: {
          formatMethod: (text: string | string[]) => {
            const value = Array.isArray(text) ? text[0] : text;
            return parseFloat(value).toFixed(1);
          },
        },
        title: {
          visible: true,
          text: "Média de Estrelas",
          style: {
            fontSize: 12,
            fontWeight: 500,
          },
        },
      },
      {
        orient: "bottom",
        type: "band",
        label: {
          style: {
            fontSize: 12,
          },
        },
      },
    ],
    tooltip: {
      trigger: ["click", "hover"],
      mark: {
        title: {
          visible: false,
        },
        content: [
          {
            key: "Dimensão",
            value: (datum: Datum | undefined) => datum?.dimension,
          },
          {
            key: "Média",
            value: (datum: Datum | undefined) =>
              `${datum?.average.toFixed(2)} ⭐`,
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
