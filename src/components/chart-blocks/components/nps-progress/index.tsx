import { Minus, ThumbsDown, ThumbsUp } from "lucide-react";
import LinearProgress from "../../charts/customer-satisfication/components/linear-progress";
import type { NPSDistribution } from "@/types/nps";

interface NPSProgressProps {
  distribution: NPSDistribution[];
}

export default function NPSProgressBars({ distribution }: NPSProgressProps) {
  const progressOptions = distribution.map((item) => {
    let icon;
    let color;

    if (item.type.includes("Promotor")) {
      icon = <ThumbsUp className="h-6 w-6" stroke="#5fb67a" fill="#5fb67a" />;
      color = "#5fb67a";
    } else if (item.type.includes("Neutro")) {
      icon = <Minus className="h-6 w-6" stroke="#f5c36e" fill="#f5c36e" />;
      color = "#f5c36e";
    } else {
      icon = <ThumbsDown className="h-6 w-6" stroke="#da6d67" fill="#da6d67" />;
      color = "#da6d67";
    }

    return {
      label: item.type,
      color,
      percentage: item.percentage / 100,
      icon,
      value: item.value,
    };
  });

  return (
    <section className="rounded-lg border border-border p-6">
      <h3 className="mb-6 text-lg font-semibold">Distribuição Detalhada</h3>
      <div className="grid grid-cols-1 gap-8 laptop:grid-cols-3">
        {progressOptions.map((option) => (
          <div key={option.label} className="flex flex-col gap-2">
            <LinearProgress
              label={option.label}
              color={option.color}
              percentage={option.percentage}
              icon={option.icon}
            />
            <div className="mt-1 text-sm text-muted-foreground">
              {option.value.toLocaleString("pt-BR")} respostas
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
