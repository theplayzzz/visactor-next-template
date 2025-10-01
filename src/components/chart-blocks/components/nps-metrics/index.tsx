import { MessageSquare, Send, TrendingDown, TrendingUp, Users } from "lucide-react";
import Container from "@/components/container";
import { chartTitle } from "@/components/primitives";
import type { NPSMetrics } from "@/types/nps";
import { cn } from "@/lib/utils";

interface NPSMetricsProps {
  metrics: NPSMetrics;
}

export default function NPSMetricsCards({ metrics }: NPSMetricsProps) {
  const getNPSColor = (score: number) => {
    if (score >= 50) return "text-green-500 dark:text-green-400";
    if (score >= 0) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  const getNPSBgColor = (score: number) => {
    if (score >= 50) return "bg-green-50 dark:bg-green-950";
    if (score >= 0) return "bg-yellow-50 dark:bg-yellow-950";
    return "bg-red-50 dark:bg-red-950";
  };

  const metricsData = [
    {
      title: "Score NPS",
      value: metrics.scoreNPS.toString(),
      icon: metrics.scoreNPS >= 0 ? TrendingUp : TrendingDown,
      colorClass: getNPSColor(metrics.scoreNPS),
      bgClass: getNPSBgColor(metrics.scoreNPS),
      suffix: "",
    },
    {
      title: "Taxa de Resposta",
      value: metrics.responseRate.toString(),
      icon: Users,
      colorClass: "text-blue-500 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950",
      suffix: "%",
    },
    {
      title: "Total de Pesquisas",
      value: metrics.totalSurveys.toLocaleString("pt-BR"),
      icon: Send,
      colorClass: "text-purple-500 dark:text-purple-400",
      bgClass: "bg-purple-50 dark:bg-purple-950",
      suffix: "",
    },
    {
      title: "Total de Respostas",
      value: metrics.totalResponses.toLocaleString("pt-BR"),
      icon: MessageSquare,
      colorClass: "text-indigo-500 dark:text-indigo-400",
      bgClass: "bg-indigo-50 dark:bg-indigo-950",
      suffix: "",
    },
  ];

  return (
    <Container className="grid grid-cols-1 gap-y-6 border-b border-border py-4 phone:grid-cols-2 laptop:grid-cols-4">
      {metricsData.map((metric) => (
        <section key={metric.title} className="flex flex-col">
          <h2 className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-1")}>
            {metric.title}
          </h2>
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", metric.bgClass)}>
              <metric.icon className={cn("h-5 w-5", metric.colorClass)} />
            </div>
            <span className="text-2xl font-medium">
              {metric.value}
              {metric.suffix}
            </span>
          </div>
        </section>
      ))}
    </Container>
  );
}
