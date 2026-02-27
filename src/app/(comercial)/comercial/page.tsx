import {
  BarChart3,
  CalendarCheck,
  Clock,
  DollarSign,
  HandCoins,
  Megaphone,
  Percent,
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
  type CurvaFechamento,
  getComercialMetrics,
  getMinLeadDate,
} from "@/lib/kommo-queries";
import { getMetaSpend } from "@/lib/meta-ads-queries";
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

// Barra de progresso reutilizável
function ProgressBar({
  pct,
  colorClass,
  height = "h-1.5",
}: {
  pct: number;
  colorClass: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-muted",
        height,
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-all",
          colorClass,
        )}
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </div>
  );
}

// Métrica compacta label + valor
function StatRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn("text-sm font-semibold tabular-nums", valueClass)}
      >
        {value}
      </span>
    </div>
  );
}

// Card por canal para seção ROI
function CanalCard({
  canal,
  icon: Icon,
  borderColor,
  fillColor,
  textColor,
  leads,
  mqls,
  vendas,
  faturamento,
  spend,
  maxMqlRate,
}: {
  canal: string;
  icon: React.ElementType;
  borderColor: string;
  fillColor: string;
  textColor: string;
  leads: number;
  mqls: number;
  vendas: number;
  faturamento: number;
  spend?: number;
  maxMqlRate: number;
}) {
  const mqlRate = leads > 0 ? mqls / leads : 0;
  const mqlToVendaRate = mqls > 0 ? vendas / mqls : 0;
  const leadToVendaRate = leads > 0 ? vendas / leads : 0;
  const barPct = maxMqlRate > 0 ? (mqlRate / maxMqlRate) * 100 : 0;

  const cpl = spend && spend > 0 && leads > 0 ? spend / leads : 0;
  const cpa = spend && spend > 0 && vendas > 0 ? spend / vendas : 0;
  const roas =
    spend && spend > 0 && faturamento > 0 ? faturamento / spend : 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/50 p-4",
        borderColor,
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("h-4 w-4", textColor)} />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {canal}
        </span>
      </div>

      {/* Métrica principal: Lead→MQL */}
      <p className={cn("text-4xl font-bold tabular-nums", textColor)}>
        {(mqlRate * 100).toFixed(1)}%
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        taxa de qualificação (Lead→MQL)
      </p>

      {/* Barra comparativa */}
      <div className="mt-3">
        <ProgressBar pct={barPct} colorClass={fillColor} />
      </div>

      {/* Leads / MQLs / Vendas */}
      <div className="mt-3 border-t border-border pt-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Leads</p>
            <p className="text-base font-semibold tabular-nums">{leads}</p>
          </div>
          <div>
            <p className={cn("text-xs", textColor, "opacity-80")}>MQLs</p>
            <p className={cn("text-base font-semibold tabular-nums", textColor)}>
              {mqls}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vendas</p>
            <p className="text-base font-semibold tabular-nums text-green-500">
              {vendas}
            </p>
          </div>
        </div>
      </div>

      {/* Custo (somente se spend > 0) */}
      {spend !== undefined && spend > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <StatRow label="Investimento" value={formatCurrency(spend)} />
            <StatRow
              label="CPL real"
              value={cpl > 0 ? formatCurrency(cpl) : "—"}
            />
            <StatRow
              label="CPA"
              value={cpa > 0 ? formatCurrency(cpa) : "—"}
            />
            <StatRow
              label="ROAS"
              value={roas > 0 ? roas.toFixed(1) + "×" : "—"}
            />
          </div>
        </div>
      )}

      {/* Taxas de conversão */}
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex flex-col gap-1">
          <StatRow
            label="MQL→Venda"
            value={(mqlToVendaRate * 100).toFixed(1) + "%"}
          />
          <StatRow
            label="Lead→Venda"
            value={(leadToVendaRate * 100).toFixed(1) + "%"}
          />
        </div>
      </div>
    </div>
  );
}

// Card de curva de fechamento por canal
function CurvaCard({
  curva,
  icon: Icon,
  textColor,
  fillColor,
}: {
  curva: CurvaFechamento;
  icon: React.ElementType;
  textColor: string;
  fillColor: string;
}) {
  const maxCount = Math.max(...curva.distribution.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border border-border p-4">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn("h-4 w-4", textColor)} />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {curva.origem}
        </span>
      </div>

      {/* Mediana */}
      <p className="text-xs text-muted-foreground">mediana</p>
      <p className={cn("text-3xl font-bold tabular-nums", textColor)}>
        {curva.medianDays.toFixed(1)} d
      </p>
      <p className="text-xs text-muted-foreground">
        média {curva.avgDays.toFixed(1)}d · {curva.total} vendas
      </p>

      {/* Distribuição */}
      <div className="mt-4 flex flex-col gap-2">
        {curva.distribution.map((d) => {
          const pct = curva.total > 0 ? (d.count / curva.total) * 100 : 0;
          return (
            <div key={d.bucket} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {d.bucket}
              </span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    fillColor,
                  )}
                  style={{
                    width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
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
  let metaSpend = 0;

  try {
    const fromStr0 = format(startDate, "yyyy-MM-dd");
    const toStr0 = format(endDate, "yyyy-MM-dd");
    [data, minDate, metaSpend] = await Promise.all([
      getComercialMetrics(startDate, endDate),
      getMinLeadDate(),
      getMetaSpend(fromStr0, toStr0),
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

      {/* Seção ROI — ROI por Canal */}
      {(() => {
        const canais = [
          {
            canal: "Meta Ads",
            icon: Megaphone,
            borderColor: "border-l-4 border-l-pink-400 dark:border-l-pink-600",
            fillColor: "bg-pink-500",
            textColor: "text-pink-500",
            leads: data.metricasMetaAds.leads,
            mqls: data.metricasMetaAds.mqls,
            vendas: data.metricasMetaAds.vendas,
            faturamento: data.metricasMetaAds.faturamento,
            spend: metaSpend,
          },
          {
            canal: "Google Ads",
            icon: Search,
            borderColor: "border-l-4 border-l-blue-400 dark:border-l-blue-600",
            fillColor: "bg-blue-500",
            textColor: "text-blue-500",
            leads: data.metricasGoogleAds.leads,
            mqls: data.metricasGoogleAds.mqls,
            vendas: data.metricasGoogleAds.vendas,
            faturamento: data.metricasGoogleAds.faturamento,
          },
          {
            canal: "Outbound",
            icon: UserPlus,
            borderColor:
              "border-l-4 border-l-slate-400 dark:border-l-slate-600",
            fillColor: "bg-slate-500",
            textColor: "text-slate-500 dark:text-slate-400",
            leads: data.metricasOutbound.leads,
            mqls: data.metricasOutbound.mqls,
            vendas: data.metricasOutbound.vendas,
            faturamento: data.metricasOutbound.faturamento,
          },
        ];
        const maxMqlRate = Math.max(
          ...canais.map((c) => (c.leads > 0 ? c.mqls / c.leads : 0)),
          0.001,
        );
        return (
          <div className="flex flex-col gap-4 border-b border-border py-6">
            <h2
              className={cn(
                chartTitle({ color: "default", size: "lg" }),
                "flex items-center gap-2",
              )}
            >
              <BarChart3 className="h-5 w-5 text-primary" />
              ROI por Canal
            </h2>
            <div className="grid gap-3 tablet:grid-cols-3">
              {canais.map((c) => (
                <CanalCard
                  key={c.canal}
                  canal={c.canal}
                  icon={c.icon}
                  borderColor={c.borderColor}
                  fillColor={c.fillColor}
                  textColor={c.textColor}
                  leads={c.leads}
                  mqls={c.mqls}
                  vendas={c.vendas}
                  faturamento={c.faturamento}
                  spend={"spend" in c ? c.spend : undefined}
                  maxMqlRate={maxMqlRate}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Seção Curva — Curva de Fechamento */}
      {(() => {
        const curvaConfig: Record<
          string,
          {
            icon: React.ElementType;
            textColor: string;
            fillColor: string;
          }
        > = {
          Meta: {
            icon: Megaphone,
            textColor: "text-pink-500",
            fillColor: "bg-pink-500",
          },
          Google: {
            icon: Search,
            textColor: "text-blue-500",
            fillColor: "bg-blue-500",
          },
          Outbound: {
            icon: UserPlus,
            textColor: "text-slate-500 dark:text-slate-400",
            fillColor: "bg-slate-500",
          },
        };
        return (
          <div className="flex flex-col gap-4 border-b border-border py-6">
            <h2
              className={cn(
                chartTitle({ color: "default", size: "lg" }),
                "flex items-center gap-2",
              )}
            >
              <Clock className="h-5 w-5 text-primary" />
              Curva de Fechamento
            </h2>
            <div className="grid gap-3 tablet:grid-cols-3">
              {data.curvaFechamento.map((curva) => {
                const cfg = curvaConfig[curva.origem] ?? {
                  icon: TrendingUp,
                  textColor: "text-primary",
                  fillColor: "bg-primary",
                };
                return (
                  <CurvaCard
                    key={curva.origem}
                    curva={curva}
                    icon={cfg.icon}
                    textColor={cfg.textColor}
                    fillColor={cfg.fillColor}
                  />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              A curva de fechamento mostra o tempo entre a criação do lead e a
              venda. A mediana é mais representativa que a média, pois ignora
              casos extremos.
            </p>
          </div>
        );
      })()}

      {/* Seção Unit Economics */}
      {(() => {
        const totalLeadsAll = data.leadsTotal;
        const totalVendasAll = data.vendasMes.count;
        const totalFaturamento = data.vendasMes.faturamento;
        const metaVendas = data.metricasMetaAds.vendas;
        const metaFaturamento = data.metricasMetaAds.faturamento;

        const cac =
          metaSpend > 0 && metaVendas > 0 ? metaSpend / metaVendas : 0;
        const ticketMedio =
          totalVendasAll > 0 ? totalFaturamento / totalVendasAll : 0;
        const roas =
          metaSpend > 0 && metaFaturamento > 0
            ? metaFaturamento / metaSpend
            : 0;
        const convGeral =
          totalLeadsAll > 0 ? (totalVendasAll / totalLeadsAll) * 100 : 0;

        const cards = [
          {
            icon: DollarSign,
            iconBg: "bg-emerald-50 dark:bg-emerald-950",
            iconColor: "text-emerald-500",
            value: metaSpend > 0 ? formatCurrency(cac) : "—",
            label: "CAC Meta",
            sub:
              metaSpend > 0
                ? "por cliente adquirido via Meta"
                : "sem dados de investimento",
          },
          {
            icon: TrendingUp,
            iconBg: "bg-green-50 dark:bg-green-950",
            iconColor: "text-green-500",
            value: formatCurrency(ticketMedio),
            label: "Ticket Médio",
            sub: "faturamento médio por venda",
          },
          {
            icon: BarChart3,
            iconBg: "bg-blue-50 dark:bg-blue-950",
            iconColor: "text-blue-500",
            value: metaSpend > 0 ? roas.toFixed(1) + "×" : "—",
            label: "ROAS",
            sub:
              metaSpend > 0
                ? "retorno sobre investimento Meta"
                : "sem dados de investimento",
          },
          {
            icon: Percent,
            iconBg: "bg-purple-50 dark:bg-purple-950",
            iconColor: "text-purple-500",
            value: convGeral.toFixed(1) + "%",
            label: "Conv. Geral",
            sub: "de lead a venda (todos canais)",
          },
        ];

        return (
          <div className="flex flex-col gap-4 border-b border-border py-6">
            <h2
              className={cn(
                chartTitle({ color: "default", size: "lg" }),
                "flex items-center gap-2",
              )}
            >
              <DollarSign className="h-5 w-5 text-primary" />
              Unit Economics
            </h2>
            <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="rounded-lg border border-border bg-card/50 p-4"
                >
                  <div className={cn("mb-2 inline-flex rounded-lg p-2", c.iconBg)}>
                    <c.icon className={cn("h-4 w-4", c.iconColor)} />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {c.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
