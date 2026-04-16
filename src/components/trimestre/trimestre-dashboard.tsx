"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  Clock,
  DollarSign,
  Megaphone,
  Search,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ChannelComparisonChart } from "./charts/channel-comparison";
import { FunnelEvolutionChart } from "./charts/funnel-evolution";
import { LossByChannelChart } from "./charts/loss-by-channel";
import { LossReasonsChart } from "./charts/loss-reasons";
import { PlanMixChart } from "./charts/plan-mix";

/* ─── helpers ─── */
function fmt(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2">
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              accent ?? "bg-primary/10",
            )}
          >
            <Icon className="h-4 w-4 text-foreground/70" />
          </div>
        )}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

function SectionTitle({
  children,
  icon: Icon,
  description,
}: {
  children: React.ReactNode;
  icon?: React.ElementType;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        {children}
      </h3>
      {description && (
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

function ChartCard({
  children,
  className,
  height = "h-[340px]",
}: {
  children: React.ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/60 p-4",
        height,
        className,
      )}
    >
      {children}
    </div>
  );
}

function ProgressBar({
  pct,
  color,
  height = "h-3",
}: {
  pct: number;
  color: string;
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
        className={cn("absolute inset-y-0 left-0 rounded-full", color)}
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </div>
  );
}

/* ─── Tab: Visao Geral ─── */
function TabOverview() {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div>
        <SectionTitle
          icon={BarChart3}
          description="Consolidado do 1º trimestre de 2026 (Janeiro a Março). Dados extraídos do Kommo CRM (pipeline Hunter) com cruzamento das plataformas de anúncio."
        >
          Indicadores do Trimestre
        </SectionTitle>

        <div className="grid grid-cols-2 gap-4 laptop:grid-cols-4">
          <StatCard
            label="Total de Leads"
            value="1.414"
            sub="Março foi o pico com 546"
            icon={UserPlus}
            accent="bg-blue-500/10"
          />
          <StatCard
            label="Vendas Fechadas"
            value="492"
            sub="Taxa de conversão global: 34,8%"
            icon={TrendingUp}
            accent="bg-emerald-500/10"
          />
          <StatCard
            label="Faturamento 1ª Mens."
            value={fmt(57444)}
            sub="Apenas primeira mensalidade contabilizada"
            icon={DollarSign}
            accent="bg-emerald-500/10"
          />
          <StatCard
            label="Perdidos no Trimestre"
            value="950"
            sub="67% do total de leads"
            icon={TrendingDown}
            accent="bg-rose-500/10"
          />
        </div>
      </div>

      {/* Funnel Evolution */}
      <div>
        <SectionTitle
          icon={TrendingUp}
          description="Evolução mensal de leads gerados, vendas concretizadas e leads perdidos. Março apresentou o melhor desempenho do trimestre com +18% em leads e +22% em vendas frente a Janeiro."
        >
          Evolução Mensal do Funil
        </SectionTitle>

        <ChartCard height="h-[380px]">
          <FunnelEvolutionChart />
        </ChartCard>
      </div>

      {/* Monthly Detail Table */}
      <div>
        <SectionTitle icon={CalendarRange}>
          Detalhamento por Mês
        </SectionTitle>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Mês
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Leads
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  MQLs
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Vendas
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Perdidos
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Faturamento
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Ticket Médio
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Close Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  mes: "Janeiro",
                  leads: 463,
                  mqls: 154,
                  vendas: 159,
                  perdidos: 310,
                  fat: 19875,
                  ticket: 125,
                  close: 33.9,
                },
                {
                  mes: "Fevereiro",
                  leads: 405,
                  mqls: 133,
                  vendas: 139,
                  perdidos: 275,
                  fat: 15739,
                  ticket: 113,
                  close: 33.6,
                },
                {
                  mes: "Março",
                  leads: 546,
                  mqls: 180,
                  vendas: 194,
                  perdidos: 365,
                  fat: 21830,
                  ticket: 113,
                  close: 34.7,
                },
              ].map((r) => (
                <tr
                  key={r.mes}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{r.mes}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.leads}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-purple-400">
                    {r.mqls}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-400">
                    {r.vendas}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-rose-400">
                    {r.perdidos}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmt(r.fat)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmt(r.ticket)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.close}%
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-semibold">
                <td className="px-4 py-3">Total Q1</td>
                <td className="px-4 py-3 text-right tabular-nums">1.414</td>
                <td className="px-4 py-3 text-right tabular-nums text-purple-400">
                  467
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-400">
                  492
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-400">
                  950
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmt(57444)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmt(117)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">34,8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Seasonality */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <h4 className="flex items-center gap-2 font-semibold text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          Impacto Sazonal — Carnaval 2026
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          A semana de Carnaval (14-18 fev) registrou{" "}
          <strong className="text-foreground">42 leads</strong> contra 81 da
          semana anterior — queda de{" "}
          <strong className="text-rose-400">48%</strong>. As vendas
          caíram ainda mais:{" "}
          <strong className="text-rose-400">
            11 vendas vs 34 (-68%)
          </strong>
          . Fevereiro fechou como o pior mês do trimestre, apesar do mesmo
          investimento em ads. Recomenda-se reduzir budget e focar em
          remarketing em semanas de feriado prolongado.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Semana anterior</p>
            <p className="text-lg font-bold tabular-nums">81 leads</p>
            <p className="text-xs text-muted-foreground">34 vendas</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 p-3">
            <p className="text-xs text-rose-400">Semana Carnaval</p>
            <p className="text-lg font-bold tabular-nums text-rose-400">
              42 leads
            </p>
            <p className="text-xs text-rose-400">11 vendas</p>
          </div>
          <div className="rounded-lg bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Semana pós</p>
            <p className="text-lg font-bold tabular-nums">72 leads</p>
            <p className="text-xs text-muted-foreground">18 vendas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Canais ─── */
function TabChannels() {
  const channels = [
    {
      name: "Outbound",
      icon: UserPlus,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      borderColor: "border-l-slate-400",
      leads: 668,
      vendas: 346,
      fat: 41054,
      perdidos: 372,
      close: 48.2,
      cycle: "~4 dias",
      spend: null as number | null,
    },
    {
      name: "Google Ads",
      icon: Search,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      borderColor: "border-l-blue-400",
      leads: 336,
      vendas: 84,
      fat: 9400,
      perdidos: 233,
      close: 26.5,
      cycle: "~6 dias",
      spend: 1739,
    },
    {
      name: "Meta Ads",
      icon: Megaphone,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      borderColor: "border-l-pink-400",
      leads: 340,
      vendas: 40,
      fat: 4570,
      perdidos: 304,
      close: 11.6,
      cycle: "~12 dias",
      spend: 3340,
    },
    {
      name: "Instagram",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "border-l-purple-400",
      leads: 70,
      vendas: 22,
      fat: 2420,
      perdidos: 41,
      close: 34.9,
      cycle: "~6 dias",
      spend: null,
    },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Target}
        description="Comparação de desempenho entre os canais de aquisição. As métricas incluem volume, taxas de conversão, custo por aquisição e velocidade de fechamento ao longo do 1º trimestre."
      >
        Performance por Canal de Aquisição
      </SectionTitle>

      {/* Channel Volume Chart */}
      <ChartCard height="h-[380px]">
        <ChannelComparisonChart />
      </ChartCard>

      {/* Channel Detail Cards */}
      <div className="grid gap-4 tablet:grid-cols-2">
        {channels.map((ch) => {
          const cpa =
            ch.spend && ch.vendas > 0
              ? (ch.spend / ch.vendas).toFixed(0)
              : null;
          const cpl =
            ch.spend && ch.leads > 0
              ? (ch.spend / ch.leads).toFixed(2)
              : null;
          return (
            <div
              key={ch.name}
              className={cn(
                "rounded-xl border border-border border-l-4 bg-card/60 p-5",
                ch.borderColor,
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    ch.bg,
                  )}
                >
                  <ch.icon className={cn("h-3.5 w-3.5", ch.color)} />
                </div>
                <span className="font-semibold">{ch.name}</span>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                    ch.close >= 30
                      ? "bg-emerald-500/10 text-emerald-400"
                      : ch.close >= 20
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-rose-500/10 text-rose-400",
                  )}
                >
                  {ch.close}% close rate
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Leads</p>
                  <p className="text-xl font-bold tabular-nums">{ch.leads}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-400">Vendas</p>
                  <p className="text-xl font-bold tabular-nums text-emerald-400">
                    {ch.vendas}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-rose-400">Perdidos</p>
                  <p className="text-xl font-bold tabular-nums text-rose-400">
                    {ch.perdidos}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faturamento</span>
                    <span className="font-medium tabular-nums">
                      {fmt(ch.fat)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ciclo mediano</span>
                    <span className="font-medium">{ch.cycle}</span>
                  </div>
                  {ch.spend && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Investimento
                        </span>
                        <span className="font-medium tabular-nums">
                          {fmt(ch.spend)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPA</span>
                        <span className="font-medium tabular-nums">
                          {cpa ? fmt(Number(cpa)) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPL</span>
                        <span className="font-medium tabular-nums">
                          {cpl ? `R$ ${cpl}` : "—"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CPA Comparison Callout */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h4 className="flex items-center gap-2 font-semibold text-blue-400">
          <Zap className="h-4 w-4" />
          Google Ads vs Meta Ads — Custo por Aquisição
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Apesar de o Google Ads ter iniciado as campanhas apenas em Março, já
          apresenta CPA de{" "}
          <strong className="text-emerald-400">{fmt(48)}</strong> (em Março)
          contra <strong className="text-rose-400">{fmt(84)}</strong> do Meta
          no trimestre. O ciclo de venda do Google (mediana ~6 dias) é metade
          do Meta (~12 dias). O Meta concentra 59% das perdas por falta de
          viabilidade de rede, indicando targeting geográfico mal calibrado.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-blue-500/20 bg-background/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
              Google Ads (apenas Março)
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              CPA {fmt(48)}
            </p>
            <p className="text-xs text-muted-foreground">
              {fmt(1739)} investidos · 36 vendas atribuídas
            </p>
          </div>
          <div className="rounded-lg border border-pink-500/20 bg-background/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-pink-400">
              Meta Ads (trimestre)
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              CPA {fmt(84)}
            </p>
            <p className="text-xs text-muted-foreground">
              {fmt(3340)} investidos · 40 vendas atribuídas
            </p>
          </div>
        </div>
      </div>

      {/* Day of Week */}
      <div className="rounded-xl border border-border bg-card/60 p-5">
        <h4 className="mb-3 flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          Distribuição de Leads por Dia da Semana
        </h4>
        <p className="mb-4 text-sm text-muted-foreground">
          Segunda a quarta concentram a maior intenção de compra. Recomenda-se
          agendar maior investimento e bid nesses dias.
        </p>
        <div className="grid grid-cols-7 gap-2">
          {[
            { day: "Dom", avg: 8 },
            { day: "Seg", avg: 20 },
            { day: "Ter", avg: 20 },
            { day: "Qua", avg: 19 },
            { day: "Qui", avg: 14 },
            { day: "Sex", avg: 15 },
            { day: "Sáb", avg: 11 },
          ].map((d) => (
            <div key={d.day} className="text-center">
              <div
                className="mx-auto mb-1 rounded-md bg-primary/20"
                style={{ height: `${(d.avg / 20) * 60}px`, width: "100%" }}
              />
              <p className="text-xs font-medium">{d.day}</p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {d.avg}/dia
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Perdas ─── */
function TabLosses() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={ShieldAlert}
        description="Análise dos 950 leads que não converteram no 1º trimestre. Cada lead perdido representa investimento em aquisição desperdiçado. O objetivo é identificar e eliminar os gargalos de maior impacto."
      >
        Diagnóstico de Perdas
      </SectionTitle>

      {/* Top-level Alert */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h4 className="font-semibold text-rose-400">
              Problema central: Falta de Viabilidade Técnica
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong className="text-foreground">311 leads</strong> (33% das
              perdas) foram descartados por motivos de infraestrutura — o lead
              estava fora da área de cobertura da Adapt, mais de 400m da caixa
              ou sem ligação de postes. O Meta Ads sozinho responde por{" "}
              <strong className="text-rose-400">141 desses casos</strong>{" "}
              (45% do total de viabilidade), demonstrando que o targeting
              geográfico está vazando para regiões não atendidas.
            </p>
          </div>
        </div>
      </div>

      {/* Donut + Breakdown */}
      <div className="grid gap-6 laptop:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Distribuição Geral dos Motivos
          </h4>
          <ChartCard height="h-[380px]">
            <LossReasonsChart />
          </ChartCard>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Motivos por Canal de Origem
          </h4>
          <ChartCard height="h-[380px]">
            <LossByChannelChart />
          </ChartCard>
        </div>
      </div>

      {/* Viability by month */}
      <div>
        <h4 className="mb-4 flex items-center gap-2 font-semibold">
          <TrendingDown className="h-4 w-4 text-rose-400" />
          Perdas por Viabilidade Técnica — Evolução Mensal
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { mes: "Janeiro", count: 92, total: 310 },
            { mes: "Fevereiro", count: 76, total: 275 },
            { mes: "Março", count: 104, total: 365 },
          ].map((m) => (
            <div
              key={m.mes}
              className="rounded-xl border border-border bg-card/60 p-4"
            >
              <p className="text-sm text-muted-foreground">{m.mes}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-rose-400">
                {m.count}
              </p>
              <p className="text-xs text-muted-foreground">
                de {m.total} perdidos ({((m.count / m.total) * 100).toFixed(0)}
                %)
              </p>
              <ProgressBar
                pct={(m.count / m.total) * 100}
                color="bg-rose-500"
                height="h-1.5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Per-channel detail */}
      <div className="rounded-xl border border-border bg-card/60 p-5">
        <h4 className="mb-4 font-semibold">
          Destaque por Canal — Onde Atacar Primeiro
        </h4>
        <div className="space-y-4">
          {[
            {
              canal: "Meta Ads",
              color: "text-pink-400",
              bg: "bg-pink-500/10",
              items: [
                {
                  motivo: "Sem rede no endereço",
                  count: 141,
                  insight: "59% de todas as perdas por viabilidade vêm do Meta — targeting geográfico vazando para fora de Seropédica",
                },
                {
                  motivo: "Parou de responder",
                  count: 104,
                  insight: "Leads de menor intenção; ciclo longo (mediana ~12d) dificulta follow-up",
                },
              ],
            },
            {
              canal: "Google Ads",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              items: [
                {
                  motivo: "Parou de responder",
                  count: 81,
                  insight: "Lead mais qualificado mas sem nutrição; oportunidade de automação de follow-up",
                },
                {
                  motivo: "Achou os planos caros",
                  count: 21,
                  insight: "Público comparador — requer argumentação de valor (velocidade, suporte local) e não apenas preço",
                },
              ],
            },
            {
              canal: "Outbound",
              color: "text-slate-400",
              bg: "bg-slate-500/10",
              items: [
                {
                  motivo: "Já é cliente da base",
                  count: 43,
                  insight: "SDRs prospectando clientes ativos — necessário cruzar base antes do disparo",
                },
                {
                  motivo: "Serasa com Adapt",
                  count: 28,
                  insight: "Leads com inadimplência anterior — filtro no CRM pode eliminar antes do contato",
                },
              ],
            },
          ].map((ch) => (
            <div
              key={ch.canal}
              className="rounded-lg border border-border p-4"
            >
              <p className={cn("mb-2 text-sm font-semibold", ch.color)}>
                {ch.canal}
              </p>
              <div className="space-y-2">
                {ch.items.map((item) => (
                  <div
                    key={item.motivo}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 tabular-nums font-medium">
                      {item.count}x
                    </span>
                    <div>
                      <span className="font-medium">{item.motivo}</span>
                      <span className="text-muted-foreground">
                        {" — "}
                        {item.insight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Portfolio & Equipe ─── */
function TabPortfolio() {
  const vendedores = [
    {
      name: "William Vieira",
      initials: "WV",
      jan: 90,
      fev: 68,
      mar: 74,
      total: 232,
      pct: 47.2,
      trend: "stable" as const,
    },
    {
      name: "Luciano Matias",
      initials: "LM",
      jan: 69,
      fev: 50,
      mar: 60,
      total: 179,
      pct: 36.4,
      trend: "stable" as const,
    },
    {
      name: "Carlos Eduardo",
      initials: "CE",
      jan: 0,
      fev: 21,
      mar: 60,
      total: 81,
      pct: 16.5,
      trend: "up" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Plans */}
      <div>
        <SectionTitle
          icon={BarChart3}
          description="Distribuição das vendas por plano no 1º trimestre. O portfólio opera como funil quase único, com 77% das vendas concentradas em dois planos. Planos 'até o vencimento' convertem 2x mais que planos de recorrência."
        >
          Mix de Planos Vendidos
        </SectionTitle>

        <ChartCard height="h-[340px]">
          <PlanMixChart />
        </ChartCard>

        <div className="mt-4 grid gap-4 tablet:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Modelo Dominante
            </p>
            <p className="mt-1 text-lg font-bold">Até o Vencimento</p>
            <p className="text-sm text-muted-foreground">
              77% das vendas usam preço promocional fixo. Funciona como
              principal argumento de conversão.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Segmento B2B
            </p>
            <p className="mt-1 text-lg font-bold">13 vendas no Q1</p>
            <p className="text-sm text-muted-foreground">
              Apenas 2,6% do total. Canal B2B praticamente inativo — avaliar se
              há intenção estratégica ou se pode ser desprioritizado.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Planos Premium
            </p>
            <p className="mt-1 text-lg font-bold">&lt; 1% das vendas</p>
            <p className="text-sm text-muted-foreground">
              Pro Gamer e Full 1Gb vendem 1-2 unidades/mês. Considerar funil de
              upsell pós-venda ao invés de venda direta.
            </p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div>
        <SectionTitle
          icon={Users}
          description="Distribuição das vendas entre os closers no 1º trimestre. Apenas 3 vendedores concentram 98% de todas as vendas. Há outros membros (Jaqueline, Karlla, Benny, Jorge) cadastrados mas sem vendas registradas no pipeline Hunter."
        >
          Desempenho da Equipe Comercial
        </SectionTitle>

        <div className="space-y-4">
          {vendedores.map((v) => (
            <div
              key={v.name}
              className="rounded-xl border border-border bg-card/60 p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {v.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{v.name}</span>
                    {v.trend === "up" && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        Em crescimento
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {v.pct}% das vendas do trimestre
                  </p>
                </div>
                <p className="text-3xl font-bold tabular-nums">{v.total}</p>
                <p className="text-sm text-muted-foreground">vendas</p>
              </div>

              <ProgressBar
                pct={v.pct * 2.1}
                color={
                  v.pct > 40
                    ? "bg-primary"
                    : v.pct > 25
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                }
              />

              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  { mes: "Jan", val: v.jan },
                  { mes: "Fev", val: v.fev },
                  { mes: "Mar", val: v.mar },
                ].map((m) => (
                  <div
                    key={m.mes}
                    className="rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <p className="text-xs text-muted-foreground">{m.mes}</p>
                    <p className="text-lg font-bold tabular-nums">
                      {m.val || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Risk Card */}
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Risco de Concentração
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            William Vieira sozinho representa{" "}
            <strong className="text-foreground">47% das vendas</strong>. Se este
            vendedor ficar indisponível, quase metade da capacidade de fechamento
            é perdida. Carlos Eduardo mostra ramp-up acelerado (0 → 60 vendas em
            2 meses), mas o ideal é ter pelo menos 4-5 closers com volume
            significativo para mitigar o risco.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Plano de Ação ─── */
function TabAction() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Zap}
        description="Recomendações estratégicas derivadas da análise completa do 1º trimestre. Priorizadas por urgência e impacto financeiro direto nas três frentes: campanha de anúncios, CRM e operação comercial."
      >
        Plano de Ação para o 2º Trimestre
      </SectionTitle>

      {/* Campanhas */}
      <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
        <div className="border-b border-border bg-blue-500/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-400" />
            <h4 className="font-semibold">
              Estratégia de Campanhas de Anúncios
            </h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Foco na otimização do investimento entre plataformas e na qualidade
            dos leads gerados
          </p>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              priority: "Crítico",
              priorityColor: "bg-rose-500",
              title: "Restringir targeting geográfico do Meta Ads",
              description:
                "Limitar raio para bairros cobertos de Seropédica e Itaguaí. Aplicar Custom Audience Exclusion com CEPs sem rede. Os 141 leads perdidos por falta de rede representam ~R$ 1.300/mês desperdiçados em CPL.",
              impact: "Economia imediata de ~R$ 4.000/trimestre em CPL desperdiçado",
            },
            {
              priority: "Crítico",
              priorityColor: "bg-rose-500",
              title: "Realocar budget de Meta para Google Ads",
              description:
                "O Google demonstra CPA 43% menor e ciclo de venda 2x mais rápido. Proposta: aumentar Google de R$ 1.700 para R$ 2.500/mês e reduzir Meta de R$ 1.160 para R$ 700/mês. Manter Meta apenas para reconhecimento local.",
              impact: "Estimativa de +15 a +25 vendas adicionais por mês com mesmo investimento total",
            },
            {
              priority: "Importante",
              priorityColor: "bg-amber-500",
              title: "Concentrar investimento em seg-qua (06h-09h)",
              description:
                "Os dados de sazonalidade mostram 35% dos leads chegando nesses 3 dias. Configurar bid scheduling no Google Ads para maximizar impressão nos horários de maior intenção de compra.",
              impact: "Melhor aproveitamento do budget sem custo adicional",
            },
            {
              priority: "Importante",
              priorityColor: "bg-amber-500",
              title: "Criar landing page com proposta de valor diferenciada para Google",
              description:
                "21 leads do Google foram perdidos por 'achou caro'. O público de busca é comparador. Criar LP que destaque velocidade real, uptime, suporte local e comparativo com concorrentes — não apenas preço.",
              impact: "Potencial de reduzir perda por preço em ~50% (10+ vendas a mais/trimestre)",
            },
            {
              priority: "Estratégico",
              priorityColor: "bg-blue-500",
              title: "Definir protocolos de feriado prolongado",
              description:
                "Carnaval mostrou queda de 68% nas vendas. Para Corpus Christi (jun) e períodos similares, reduzir budget em 50% e redirecionar para remarketing de base quente nos 3 dias pré-feriado.",
              impact: "Evitar desperdício estimado de ~R$ 500/evento em leads frios",
            },
          ].map((action, i) => (
            <div key={i} className="flex gap-4 p-5">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    action.priorityColor,
                  )}
                />
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      action.priorityColor === "bg-rose-500"
                        ? "bg-rose-500/10 text-rose-400"
                        : action.priorityColor === "bg-amber-500"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400",
                    )}
                  >
                    {action.priority}
                  </span>
                </div>
                <h5 className="mt-1 font-semibold">{action.title}</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <ArrowRight className="h-3 w-3" />
                  {action.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CRM */}
      <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
        <div className="border-b border-border bg-purple-500/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            <h4 className="font-semibold">Estratégia de CRM e Qualificação</h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ações para melhorar a qualidade do pipeline e reduzir desperdício
            operacional
          </p>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              priority: "Crítico",
              priorityColor: "bg-rose-500",
              title: "Filtrar base ativa antes do disparo Outbound",
              description:
                "43 leads foram perdidos por 'já é cliente' no Q1. Implementar cruzamento automático da lista de prospecção com a base ativa no Kommo antes de iniciar cadências. Filtro simples: match por telefone/email.",
              impact: "Elimina ~15 contatos desperdiçados por mês e evita desgaste com cliente ativo",
            },
            {
              priority: "Importante",
              priorityColor: "bg-amber-500",
              title: "Instalar campo obrigatório de Cidade/Bairro",
              description:
                "Atualmente não há dado geográfico estruturado nos leads — a análise demográfica é inferida pelo motivo de perda. Adicionar campo obrigatório nos formulários de LP e no fluxo de entrada do Kommo para permitir segmentação real.",
              impact: "Habilita análise geográfica precisa e otimização contínua de targeting",
            },
            {
              priority: "Importante",
              priorityColor: "bg-amber-500",
              title: "Automação de follow-up para Google Ads",
              description:
                "81 leads de Google 'pararam de responder'. Criar cadência automatizada de 3 toques (WhatsApp + Ligação + WhatsApp) nos primeiros 48h para leads Google — esse canal tem ciclo curto (~6d) mas precisa de velocidade no primeiro contato.",
              impact: "Estimativa de recuperação de 10-15% dos leads que pararam de responder",
            },
            {
              priority: "Estratégico",
              priorityColor: "bg-blue-500",
              title: "Pré-qualificação de Serasa antes da atribuição",
              description:
                "45 leads com Serasa/Adapt foram trabalhados sem necessidade. Automatizar consulta de Serasa antes de atribuir o lead ao vendedor, marcando-o como 'bloqueado' se positivo.",
              impact: "Libera ~15 horas/mês de tempo dos vendedores para leads viáveis",
            },
          ].map((action, i) => (
            <div key={i} className="flex gap-4 p-5">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    action.priorityColor,
                  )}
                />
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="flex-1">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    action.priorityColor === "bg-rose-500"
                      ? "bg-rose-500/10 text-rose-400"
                      : action.priorityColor === "bg-amber-500"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400",
                  )}
                >
                  {action.priority}
                </span>
                <h5 className="mt-1 font-semibold">{action.title}</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <ArrowRight className="h-3 w-3" />
                  {action.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendas */}
      <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
        <div className="border-b border-border bg-emerald-500/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <h4 className="font-semibold">
              Estratégia Comercial e de Vendas
            </h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ações para aumentar capacidade de fechamento e reduzir risco
            operacional
          </p>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              priority: "Crítico",
              priorityColor: "bg-rose-500",
              title: "Ramp-up urgente do 4º e 5º closer",
              description:
                "98% das vendas dependem de 3 pessoas, com William absorvendo 47%. Se qualquer um dos dois principais ficar indisponível, o pipeline trava. Ativar Jaqueline e Karlla com treinamento intensivo (shadowing de William) por 2 semanas e meta progressiva.",
              impact: "Reduzir concentração para <35% no vendedor principal até Jul/26",
            },
            {
              priority: "Importante",
              priorityColor: "bg-amber-500",
              title: "Criar funil de Upsell pós-instalação",
              description:
                "Planos Premium (Pro Gamer, Full 1Gb) representam <1% das vendas diretas. Em vez de tentar vender na entrada, criar cadência de upsell 30/60/90 dias pós-instalação via WhatsApp, ofertando upgrade com desconto na primeira mensalidade adicional.",
              impact: "Ticket médio potencial de R$ 140-180 vs R$ 113 atual",
            },
            {
              priority: "Importante",
              priorityColor: "bg-amber-500",
              title: "Revisão estratégica do canal B2B",
              description:
                "Apenas 13 vendas B2B no trimestre (2,6%). Decidir se vale investir: se sim, criar pipeline separado com SDR dedicado e proposta comercial B2B (SLA, IP fixo, suporte prioritário). Se não, desprioritizar e focar 100% em B2C.",
              impact: "Clareza estratégica — evita dispersão de esforço em canal sem tração",
            },
            {
              priority: "Estratégico",
              priorityColor: "bg-blue-500",
              title: "Benchmark e meta por vendedor baseada em origem",
              description:
                "Definir metas diferenciadas por fonte: leads Outbound convertem a 48% e leads Google a 27%. Distribuir leads de maior qualidade (Outbound) entre vendedores em ramp-up para acelerar curva de aprendizado, e leads de ads para os mais experientes.",
              impact: "Maximiza taxa de conversão por perfil de vendedor e reduz tempo de ramp-up",
            },
          ].map((action, i) => (
            <div key={i} className="flex gap-4 p-5">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    action.priorityColor,
                  )}
                />
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="flex-1">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    action.priorityColor === "bg-rose-500"
                      ? "bg-rose-500/10 text-rose-400"
                      : action.priorityColor === "bg-amber-500"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400",
                  )}
                >
                  {action.priority}
                </span>
                <h5 className="mt-1 font-semibold">{action.title}</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <ArrowRight className="h-3 w-3" />
                  {action.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs to Monitor */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h4 className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          KPIs para Monitorar no Q2
        </h4>
        <div className="mt-4 grid gap-3 tablet:grid-cols-2">
          {[
            {
              kpi: "CPA por canal (semanal)",
              meta: "Google ≤ R$ 60 · Meta ≤ R$ 70",
            },
            {
              kpi: "% perdidos por viabilidade (Meta)",
              meta: "Reduzir de 41% para < 20%",
            },
            {
              kpi: "Mediana do ciclo lead→venda",
              meta: "Manter < 7 dias",
            },
            {
              kpi: "Concentração top-2 vendedores",
              meta: "Reduzir de 84% para < 70%",
            },
            {
              kpi: "Close rate global",
              meta: "Manter ≥ 34% (meta: 38%)",
            },
            {
              kpi: "Ticket médio mensal",
              meta: "Recuperar de R$ 113 para ≥ R$ 120",
            },
          ].map((item) => (
            <div
              key={item.kpi}
              className="flex items-center gap-3 rounded-lg bg-background/50 p-3"
            >
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">{item.kpi}</p>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export function TrimestreDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarRange className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              1º Trimestre 2026
            </h1>
            <p className="text-sm text-muted-foreground">
              Análise completa do funil de vendas — Janeiro a Março
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start gap-1 overflow-x-auto bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs tablet:text-sm">
            <BarChart3 className="hidden h-3.5 w-3.5 tablet:block" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-1.5 text-xs tablet:text-sm">
            <Target className="hidden h-3.5 w-3.5 tablet:block" />
            Canais de Mídia
          </TabsTrigger>
          <TabsTrigger value="losses" className="gap-1.5 text-xs tablet:text-sm">
            <ShieldAlert className="hidden h-3.5 w-3.5 tablet:block" />
            Gargalos e Perdas
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5 text-xs tablet:text-sm">
            <Users className="hidden h-3.5 w-3.5 tablet:block" />
            Portfólio e Equipe
          </TabsTrigger>
          <TabsTrigger value="action" className="gap-1.5 text-xs tablet:text-sm">
            <Zap className="hidden h-3.5 w-3.5 tablet:block" />
            Plano de Ação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <TabOverview />
        </TabsContent>
        <TabsContent value="channels" className="mt-6">
          <TabChannels />
        </TabsContent>
        <TabsContent value="losses" className="mt-6">
          <TabLosses />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-6">
          <TabPortfolio />
        </TabsContent>
        <TabsContent value="action" className="mt-6">
          <TabAction />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Dados: Kommo CRM (pipeline Hunter 8480507) · Meta Ads (Airbyte) ·
          Google Ads (BigQuery DTS) · Referência: 15/04/2026
        </p>
      </div>
    </div>
  );
}
