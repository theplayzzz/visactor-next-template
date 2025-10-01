import { BarChart3 } from "lucide-react";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";
import type { NPSComparison } from "@/types/nps";

interface NPSComparisonProps {
  comparison: NPSComparison[];
}

export default function NPSComparisonChart({
  comparison,
}: NPSComparisonProps) {
  return (
    <section className="flex h-full min-h-[400px] flex-col gap-2 rounded-lg border border-border p-4">
      <ChartTitle title="Comparação R1 vs R2" icon={BarChart3} />
      <div className="flex h-full items-center justify-center">
        <Chart comparison={comparison} />
      </div>
    </section>
  );
}
