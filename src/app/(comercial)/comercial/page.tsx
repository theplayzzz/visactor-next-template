import {
  CalendarCheck,
  DollarSign,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { endOfDay, format, parseISO, startOfDay, subDays } from "date-fns";

import { ComercialDatePicker } from "@/components/comercial/date-range-picker";
import Container from "@/components/container";
import { chartTitle } from "@/components/primitives";
import {
  type ComercialMetrics,
  getComercialMetrics,
  getMinLeadDate,
} from "@/lib/kommo-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const META_VENDAS = 55;

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;

  const now = new Date();
  const defaultFrom = startOfDay(subDays(now, 29));
  const defaultTo = endOfDay(now);

  const startDate = params.from
    ? startOfDay(parseISO(params.from))
    : defaultFrom;
  const endDate = params.to ? endOfDay(parseISO(params.to)) : defaultTo;

  let data: ComercialMetrics | null = null;
  let error: string | null = null;
  let minDate = defaultFrom;

  try {
    [data, minDate] = await Promise.all([
      getComercialMetrics(startDate, endDate),
      getMinLeadDate(),
    ]);
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

  const fromStr = format(startDate, "yyyy-MM-dd");
  const toStr = format(endDate, "yyyy-MM-dd");
  const minDateStr = format(minDate, "yyyy-MM-dd");

  const metricsCards = [
    {
      title: "Vendas no Período",
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
      {/* Date Picker */}
      <Container className="border-b border-border py-4">
        <ComercialDatePicker
          from={fromStr}
          to={toStr}
          minDate={minDateStr}
        />
      </Container>

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
          {/* Seção 2 — Pipeline Status (tabela horizontal na ordem do Kommo) */}
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
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {data.leadsPorStatus.map((status) => (
                      <th
                        key={status.statusId}
                        className={cn(
                          chartTitle({ color: "mute", size: "sm" }),
                          "whitespace-nowrap px-4 py-2 text-center font-normal",
                        )}
                      >
                        {status.statusName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {data.leadsPorStatus.map((status) => (
                      <td
                        key={status.statusId}
                        className="px-4 py-3 text-center text-2xl font-semibold"
                      >
                        {status.count}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Seção 3 — Vendas por Vendedor (barras de progresso com meta) */}
          {data.vendasPorVendedor.length > 0 && (
            <section>
              <h2
                className={cn(
                  chartTitle({ color: "default", size: "lg" }),
                  "mb-1 flex items-center gap-2",
                )}
              >
                <Users className="h-5 w-5 text-primary" />
                Vendas por Vendedor
              </h2>
              <p
                className={cn(
                  chartTitle({ color: "mute", size: "sm" }),
                  "mb-4",
                )}
              >
                Meta individual: {META_VENDAS} vendas
              </p>
              <div className="flex flex-col gap-4">
                {data.vendasPorVendedor.map((vendedor) => {
                  const bateuMeta = vendedor.count >= META_VENDAS;
                  const maxValue = Math.max(
                    ...data.vendasPorVendedor.map((v) => v.count),
                    META_VENDAS,
                  );
                  const barPercent = Math.min(
                    (vendedor.count / maxValue) * 100,
                    100,
                  );
                  const metaLinePercent = (META_VENDAS / maxValue) * 100;

                  return (
                    <div key={vendedor.userId}>
                      <div className="mb-1 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">
                            {vendedor.userName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(vendedor.faturamento)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 text-sm">
                          <span className="font-semibold tabular-nums">
                            {vendedor.count}
                          </span>
                          <span className="text-muted-foreground">
                            / {META_VENDAS}
                          </span>
                          {bateuMeta ? (
                            <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                              Meta batida
                            </span>
                          ) : (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (faltam {META_VENDAS - vendedor.count})
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Barra de progresso */}
                      <div className="relative h-5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full transition-all",
                            bateuMeta
                              ? "bg-green-500 dark:bg-green-400"
                              : "bg-blue-500 dark:bg-blue-400",
                          )}
                          style={{ width: `${barPercent}%` }}
                        />
                        {/* Linha vertical da meta */}
                        <div
                          className="absolute inset-y-0 w-0.5 bg-foreground/40"
                          style={{ left: `${metaLinePercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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
