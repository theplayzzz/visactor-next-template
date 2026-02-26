import {
  CalendarCheck,
  DollarSign,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { startOfMonth } from "date-fns";

import Container from "@/components/container";
import { chartTitle } from "@/components/primitives";
import {
  type ComercialMetrics,
  getComercialMetrics,
} from "@/lib/kommo-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default async function ComercialPage() {
  let data: ComercialMetrics | null = null;
  let error: string | null = null;

  try {
    const now = new Date();
    const start = startOfMonth(now);
    data = await getComercialMetrics(start, now);
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Erro desconhecido ao carregar dados";
  }

  if (error || !data) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
              Erro ao carregar dados comerciais
            </h2>
            <p className="text-sm text-red-600 dark:text-red-300">
              Não foi possível conectar ao banco de dados. Verifique se a
              variável{" "}
              <code className="rounded bg-red-100 px-1 dark:bg-red-900">
                DATABASE_URL
              </code>{" "}
              está configurada corretamente.
            </p>
            <p className="mt-3 text-xs text-red-500 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  const metricsCards = [
    {
      title: "Vendas do Mês",
      value: data.vendasMes.count.toString(),
      icon: TrendingUp,
      colorClass: "text-green-500 dark:text-green-400",
      bgClass: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Faturamento",
      value: formatCurrency(data.vendasMes.faturamento),
      icon: DollarSign,
      colorClass: "text-emerald-500 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Perdidos",
      value: data.perdidosMes.toString(),
      icon: TrendingDown,
      colorClass: "text-red-500 dark:text-red-400",
      bgClass: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Agendamentos Abertos",
      value: data.agendamentosAbertos.toString(),
      icon: CalendarCheck,
      colorClass: "text-blue-500 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  return (
    <>
      {/* Seção 1 — Cards de métricas */}
      <Container className="grid grid-cols-1 gap-y-6 border-b border-border py-4 phone:grid-cols-2 laptop:grid-cols-4">
        {metricsCards.map((metric) => (
          <section key={metric.title} className="flex flex-col">
            <h2
              className={cn(
                chartTitle({ color: "mute", size: "sm" }),
                "mb-1",
              )}
            >
              {metric.title}
            </h2>
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", metric.bgClass)}>
                <metric.icon
                  className={cn("h-5 w-5", metric.colorClass)}
                />
              </div>
              <span className="text-2xl font-medium">{metric.value}</span>
            </div>
          </section>
        ))}
      </Container>

      <Container>
        <div className="flex flex-col gap-6 py-6">
          {/* Seção 2 — Pipeline Status */}
          <section>
            <h2
              className={cn(
                chartTitle({ color: "default", size: "lg" }),
                "mb-4 flex items-center gap-2",
              )}
            >
              <HandCoins className="h-5 w-5 text-primary" />
              Pipeline
            </h2>
            <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 laptop:grid-cols-4">
              {data.leadsPorStatus.map((status) => (
                <div
                  key={status.statusId}
                  className="rounded-lg border border-border p-4"
                >
                  <p
                    className={cn(
                      chartTitle({ color: "mute", size: "sm" }),
                    )}
                  >
                    {status.statusName}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {status.count}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Seção 3 — Vendas por Vendedor */}
          {data.vendasPorVendedor.length > 0 && (
            <section>
              <h2
                className={cn(
                  chartTitle({ color: "default", size: "lg" }),
                  "mb-4 flex items-center gap-2",
                )}
              >
                <Users className="h-5 w-5 text-primary" />
                Vendas por Vendedor
              </h2>
              <div className="rounded-lg border border-border">
                <div className="grid grid-cols-3 border-b border-border px-4 py-2">
                  <span
                    className={cn(
                      chartTitle({ color: "mute", size: "sm" }),
                    )}
                  >
                    Vendedor
                  </span>
                  <span
                    className={cn(
                      chartTitle({ color: "mute", size: "sm" }),
                      "text-center",
                    )}
                  >
                    Vendas
                  </span>
                  <span
                    className={cn(
                      chartTitle({ color: "mute", size: "sm" }),
                      "text-right",
                    )}
                  >
                    Faturamento
                  </span>
                </div>
                {data.vendasPorVendedor.map((vendedor) => (
                  <div
                    key={vendedor.userId}
                    className="grid grid-cols-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <span className="font-medium">{vendedor.userName}</span>
                    <span className="text-center">{vendedor.count}</span>
                    <span className="text-right">
                      {formatCurrency(vendedor.faturamento)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Seção 4 — Leads por Origem */}
          {data.leadsPorOrigem.length > 0 && (
            <section>
              <h2
                className={cn(
                  chartTitle({ color: "default", size: "lg" }),
                  "mb-4 flex items-center gap-2",
                )}
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                Leads por Origem
              </h2>
              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 laptop:grid-cols-4">
                {data.leadsPorOrigem.map((origem) => (
                  <div
                    key={origem.origem}
                    className="rounded-lg border border-border p-4"
                  >
                    <p
                      className={cn(
                        chartTitle({ color: "mute", size: "sm" }),
                      )}
                    >
                      {origem.origem}
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      {origem.count}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer — Último sync */}
        <div className="border-t border-border py-4">
          <p className="text-xs text-muted-foreground">
            Último sync:{" "}
            {data.lastSyncAt
              ? data.lastSyncAt.toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })
              : "Nunca"}
          </p>
        </div>
      </Container>
    </>
  );
}
