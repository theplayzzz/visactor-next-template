import { PieChart } from "lucide-react";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";
import type { NPSDistribution } from "@/types/nps";

interface NPSGaugeProps {
  distribution: NPSDistribution[];
  scoreNPS: number;
}

export default function NPSGauge({ distribution, scoreNPS }: NPSGaugeProps) {
  return (
    <section className="flex h-full min-h-[400px] flex-col gap-2 rounded-lg border border-border p-4">
      <ChartTitle title="Distribuição NPS" icon={PieChart} />
      <div className="flex h-full items-center justify-center">
        <Chart distribution={distribution} scoreNPS={scoreNPS} />
      </div>
    </section>
  );
}
