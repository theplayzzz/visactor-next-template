import {
  CalendarCheck,
  DollarSign,
  HandCoins,
  Megaphone,
  Search,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { endOfDay, format, parseISO, startOfDay, subDays } from "date-fns";

import { ComercialDatePicker } from "@/components/comercial/date-range-picker";
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

// Componente para linha de métricas compacta (usado em subtotais)
function MetricasRow({
  leads,
  vendas,
  faturamento,
  perdidos,
  agendamentos,
  className,
}: {
  leads: number;
  vendas: number;
  faturamento: number;
  perdidos: number;
  agendamentos: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 phone:grid-cols-3 tablet:grid-cols-5",
        className,
      )}
    >
      <div>
        <p className={cn(chartTitle({ color: "mute", size: "sm" }))}>Leads</p>
        <p className="text-xl font-semibold">{leads}</p>
      </div>
      <div>
        <p className={cn(chartTitle({ color: "mute", size: "sm" }))}>Vendas</p>
        <p className="text-xl font-semibold text-green-500">{vendas}</p>
      </div>
      <div>
        <p className={cn(chartTitle({ color: "mute", size: "sm" }))}>
          Faturamento
        </p>
        <p className="text-xl font-semibold text-emerald-500">
          {formatCurrency(faturamento)}
        </p>
      </div>
      <div>
        <p className={cn(chartTitle({ color: "mute", size: "sm" }))}>
          Perdidos
        </p>
        <p className="text-xl font-semibold text-red-500">{perdidos}</p>
      </div>
      <div>
        <p className={cn(chartTitle({ color: "mute", size: "sm" }))}>
          Agendamentos
        </p>
        <p className="text-xl font-semibold text-blue-500">{agendamentos}</p>
      </div>
    </div>
  );
}

// Componente para card de origem individual
function OrigemCard({
  title,
  icon: Icon,
  iconColor,
  leads,
  vendas,
  faturamento,
  perdidos,
  agendamentos,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  leads: number;
  vendas: number;
  faturamento: number;
  perdidos: number;
  agendamentos: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      <MetricasRow
        leads={leads}
        vendas={vendas}
        faturamento={faturamento}
        perdidos={perdidos}
        agendamentos={agendamentos}
      />
    </div>
  );
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
      <div className="mx-auto max-w-5xl px-6 tablet:px-10">
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
      </div>
    );
  }

  const fromStr = format(startDate, "yyyy-MM-dd");
  const toStr = format(endDate, "yyyy-MM-dd");
  const minDateStr = format(minDate, "yyyy-MM-dd");

  // Calcular totais de Inbound (Google + Meta)
  const inboundLeads =
    data.metricasGoogleAds.leads + data.metricasMetaAds.leads;
  const inboundVendas =
    data.metricasGoogleAds.vendas + data.metricasMetaAds.vendas;
  const inboundFaturamento =
    data.metricasGoogleAds.faturamento + data.metricasMetaAds.faturamento;
  const inboundPerdidos =
    data.metricasGoogleAds.perdidos + data.metricasMetaAds.perdidos;
  const inboundAgendamentos =
    data.metricasGoogleAds.agendamentos + data.metricasMetaAds.agendamentos;

  return (
    <div className="mx-auto max-w-5xl px-6 tablet:px-10">
      {/* Date Picker */}
      <div className="border-b border-border py-4">
        <ComercialDatePicker
          from={fromStr}
          to={toStr}
          minDate={minDateStr}
        />
      </div>

      {/* Seção 1 — Inbound (Google + Meta) */}
      <div className="flex flex-col gap-4 border-b border-border py-6">
        <h2
          className={cn(
            chartTitle({ color: "default", size: "lg" }),
            "flex items-center gap-2",
          )}
        >
          <Megaphone className="h-5 w-5 text-primary" />
          Inbound
        </h2>

        {/* Cards individuais */}
        <div className="flex flex-col gap-3">
          <OrigemCard
            title="Google Ads"
            icon={Search}
            iconColor="text-blue-500"
            leads={data.metricasGoogleAds.leads}
            vendas={data.metricasGoogleAds.vendas}
            faturamento={data.metricasGoogleAds.faturamento}
            perdidos={data.metricasGoogleAds.perdidos}
            agendamentos={data.metricasGoogleAds.agendamentos}
          />
          <OrigemCard
            title="Meta Ads"
            icon={Megaphone}
            iconColor="text-pink-500"
            leads={data.metricasMetaAds.leads}
            vendas={data.metricasMetaAds.vendas}
            faturamento={data.metricasMetaAds.faturamento}
            perdidos={data.metricasMetaAds.perdidos}
            agendamentos={data.metricasMetaAds.agendamentos}
          />
        </div>

        {/* Total Inbound */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p
            className={cn(
              chartTitle({ color: "mute", size: "sm" }),
              "mb-2 font-medium",
            )}
          >
            Total Inbound
          </p>
          <MetricasRow
            leads={inboundLeads}
            vendas={inboundVendas}
            faturamento={inboundFaturamento}
            perdidos={inboundPerdidos}
            agendamentos={inboundAgendamentos}
          />
        </div>
      </div>

      {/* Seção 2 — Outbound */}
      <div className="flex flex-col gap-4 border-b border-border py-6">
        <h2
          className={cn(
            chartTitle({ color: "default", size: "lg" }),
            "flex items-center gap-2",
          )}
        >
          <UserPlus className="h-5 w-5 text-orange-500" />
          Outbound
        </h2>
        <div className="rounded-lg border border-border p-4">
          <MetricasRow
            leads={data.metricasOutbound.leads}
            vendas={data.metricasOutbound.vendas}
            faturamento={data.metricasOutbound.faturamento}
            perdidos={data.metricasOutbound.perdidos}
            agendamentos={data.metricasOutbound.agendamentos}
          />
        </div>
      </div>

      {/* Seção 3 — Total Geral */}
      <div className="border-b border-border py-6">
        <h2
          className={cn(
            chartTitle({ color: "default", size: "lg" }),
            "mb-4 flex items-center gap-2",
          )}
        >
          <TrendingUp className="h-5 w-5 text-primary" />
          Total Geral
        </h2>
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-5">
          <div>
            <p
              className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-1")}
            >
              Leads
            </p>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950">
                <UserPlus className="h-4 w-4 text-purple-500" />
              </div>
              <span className="text-2xl font-semibold">{data.leadsTotal}</span>
            </div>
          </div>
          <div>
            <p
              className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-1")}
            >
              Vendas
            </p>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-2xl font-semibold">
                {data.vendasMes.count}
              </span>
            </div>
          </div>
          <div>
            <p
              className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-1")}
            >
              Faturamento
            </p>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-semibold">
                {formatCurrency(data.vendasMes.faturamento)}
              </span>
            </div>
          </div>
          <div>
            <p
              className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-1")}
            >
              Perdidos
            </p>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-2xl font-semibold">{data.perdidosMes}</span>
            </div>
          </div>
          <div>
            <p
              className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-1")}
            >
              Agendamentos
            </p>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                <CalendarCheck className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-2xl font-semibold">
                {data.agendamentosAbertos}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 4 — Pipeline Status */}
      <div className="border-b border-border py-6">
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
                      "whitespace-nowrap px-3 py-2 text-center font-normal",
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
                    className="px-3 py-3 text-center text-xl font-semibold"
                  >
                    {status.count}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção 5 — Vendas por Vendedor */}
      {data.vendasPorVendedor.length > 0 && (
        <div className="border-b border-border py-6">
          <h2
            className={cn(
              chartTitle({ color: "default", size: "lg" }),
              "mb-1 flex items-center gap-2",
            )}
          >
            <Users className="h-5 w-5 text-primary" />
            Vendas por Vendedor
          </h2>
          <p className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-4")}>
            Meta individual: {META_VENDAS} vendas
          </p>
          <div className="flex flex-col gap-3">
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
                      <span className="font-medium">{vendedor.userName}</span>
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
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all",
                        bateuMeta
                          ? "bg-green-500 dark:bg-green-400"
                          : "bg-blue-500 dark:bg-blue-400",
                      )}
                      style={{ width: `${barPercent}%` }}
                    />
                    <div
                      className="absolute inset-y-0 w-0.5 bg-foreground/40"
                      style={{ left: `${metaLinePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seção 6 — Leads por Origem */}
      {data.leadsPorOrigem.length > 0 && (
        <div className="border-b border-border py-6">
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
                className="rounded-lg border border-border p-3"
              >
                <p className={cn(chartTitle({ color: "mute", size: "sm" }))}>
                  {origem.origem}
                </p>
                <p className="mt-1 text-xl font-semibold">{origem.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer — Último sync */}
      <div className="py-4">
        <p className="text-xs text-muted-foreground">
          Último sync:{" "}
          {data.lastSyncAt
            ? data.lastSyncAt.toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })
            : "Nunca"}
        </p>
      </div>
    </div>
  );
}
