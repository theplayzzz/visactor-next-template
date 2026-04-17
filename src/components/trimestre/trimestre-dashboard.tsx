"use client";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  CalendarRange,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Eye,
  HandHeart,
  Lightbulb,
  Megaphone,
  Phone,
  Search,
  ShieldAlert,
  ShoppingCart,
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
import { DayOfWeekChart } from "./charts/day-of-week";
import { FunnelEvolutionChart } from "./charts/funnel-evolution";
import { LossByChannelChart } from "./charts/loss-by-channel";
import { LossReasonsChart } from "./charts/loss-reasons";
import { PlanMixChart } from "./charts/plan-mix";
import { SpendVsReturnsChart } from "./charts/spend-vs-returns";

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
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
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

/* ═════════════════════════════════════════════════════════════
   TAB: VISÃO GERAL
   ═════════════════════════════════════════════════════════════ */
function TabOverview() {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div>
        <SectionTitle
          icon={BarChart3}
          description="Consolidado do 1º trimestre de 2026 (Janeiro a Março). Dados extraídos do Kommo CRM (pipeline Hunter) cruzados com Meta Ads (Airbyte) e Google Ads (BigQuery DTS)."
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
            sub="LTV 12m estimado: ≈ R$ 778 mil"
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

        <ChartCard height="h-[400px]">
          <FunnelEvolutionChart />
        </ChartCard>

        {/* Mini KPI cards below chart */}
        <div className="mt-4 grid gap-3 tablet:grid-cols-3">
          {[
            {
              mes: "Janeiro",
              leads: 463,
              vendas: 159,
              close: 33.9,
              color: "text-blue-400",
            },
            {
              mes: "Fevereiro",
              leads: 405,
              vendas: 139,
              close: 33.6,
              color: "text-amber-400",
            },
            {
              mes: "Março",
              leads: 546,
              vendas: 194,
              close: 34.7,
              color: "text-emerald-400",
            },
          ].map((m) => (
            <div
              key={m.mes}
              className="rounded-lg border border-border bg-card/50 p-3"
            >
              <p className={cn("text-sm font-semibold", m.color)}>{m.mes}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Leads
                  </p>
                  <p className="text-lg font-bold tabular-nums">{m.leads}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Vendas
                  </p>
                  <p className="text-lg font-bold tabular-nums text-emerald-400">
                    {m.vendas}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Close
                  </p>
                  <p className="text-lg font-bold tabular-nums">{m.close}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Detail Table */}
      <div>
        <SectionTitle icon={CalendarRange}>Detalhamento por Mês</SectionTitle>

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
                  1ª Mens.
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Ticket
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Close
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
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
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
                <td className="px-4 py-3 text-right tabular-nums">{fmt(117)}</td>
                <td className="px-4 py-3 text-right tabular-nums">34,8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sazonalidade — Carnaval — REDESENHADA */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <h4 className="flex items-center gap-2 font-semibold text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          Impacto Sazonal — Carnaval 2026
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          A semana de Carnaval (14-18 fev) registrou{" "}
          <strong className="text-foreground">42 leads</strong> contra{" "}
          <strong className="text-foreground">81 da semana anterior</strong> —
          queda de <strong className="text-rose-400">48%</strong>. As vendas
          caíram ainda mais:{" "}
          <strong className="text-rose-400">11 vs 34 (-68%)</strong>. A semana
          pós-carnaval não recuperou totalmente o patamar.
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

        <div className="mt-4 rounded-lg border border-amber-500/20 bg-background/40 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Lightbulb className="h-3.5 w-3.5" />
            Recomendação revisada
          </p>
          <p className="text-sm text-muted-foreground">
            Em feriados prolongados a queda acontece no{" "}
            <strong className="text-foreground">
              volume de leads novos (demanda)
            </strong>
            , não na eficiência do funil. Reduzir budget nessa janela só economiza
            marginalmente — o ganho real está em{" "}
            <strong className="text-foreground">
              mobilizar o time comercial para reaquecer leads já gerados
            </strong>{" "}
            nas semanas anteriores. Nos 5 dias de Carnaval, o CRM tinha 300+
            leads no pipeline Hunter (entre PROPECCAO, VIABILIDADE, NEGOCIACAO,
            AGENDAMENTO) que poderiam ser trabalhados com follow-up ativo. Com
            18 vendas pós-feriado, é evidente que a demanda voltou — faltou
            aproveitar a base fria da janela.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 rounded-full bg-amber-400" />
              <span>
                <strong className="text-foreground">
                  Durante feriados prolongados:
                </strong>{" "}
                manter budget, focar SDRs/closers em follow-up dos leads em
                pipeline (VIABILIDADE, NEGOCIACAO, AGENDAMENTO).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 rounded-full bg-amber-400" />
              <span>
                <strong className="text-foreground">
                  Pré-feriado (D-3 a D-1):
                </strong>{" "}
                cadência acelerada de contatos no pipeline quente para fechar
                antes do vácuo.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 rounded-full bg-amber-400" />
              <span>
                <strong className="text-foreground">
                  Pós-feriado (D+1 a D+5):
                </strong>{" "}
                reabordagem dos leads que ficaram em VIABILIDADE ou
                NEGOCIACAO durante o feriado com oferta de instalação express.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   TAB: CANAIS
   ═════════════════════════════════════════════════════════════ */
function TabChannels() {
  // DADOS ATUALIZADOS: Google Ads agora tem Q1 completo (BigQuery)
  const channels = [
    {
      name: "Outbound",
      icon: UserPlus,
      color: "text-slate-300",
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
      spend: 6995, // Q1 completo: Jan 2.432 + Fev 2.341 + Mar 2.222
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
      spend: 3341, // Jan 1.146 + Fev 1.035 + Mar 1.160
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
        description="Comparação de desempenho entre os canais de aquisição. Dados do Google Ads foram completados via BigQuery (anteriormente só existia dado de março) — o investimento trimestral é 2x maior que Meta, com CPA quase equivalente."
      >
        Performance por Canal de Aquisição
      </SectionTitle>

      <ChartCard height="h-[400px]">
        <ChannelComparisonChart />
      </ChartCard>

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
                    <span className="text-muted-foreground">
                      Fat. 1ª mens.
                    </span>
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
                          Investimento Q1
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ROAS (1ª mens)
                        </span>
                        <span className="font-medium tabular-nums">
                          {(ch.fat / ch.spend).toFixed(2)}×
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

      {/* CPA Revisado */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h4 className="flex items-center gap-2 font-semibold text-blue-400">
          <Zap className="h-4 w-4" />
          Google Ads vs Meta Ads — Análise completa do trimestre
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Com os dados completos do BigQuery, o{" "}
          <strong className="text-foreground">CPA dos dois canais é quase idêntico</strong>{" "}
          (~R$ 83). A diferença decisiva está em{" "}
          <strong className="text-emerald-400">volume e eficiência do funil</strong>:
          o Google entregou 2× mais vendas (84 vs 40), ciclo 2× mais curto e
          close rate 2,3× maior. Meta perde 41% dos seus leads por falta de
          viabilidade técnica (targeting geográfico vazando) — eliminar isso é
          o que vai virar o jogo.
        </p>

        <div className="mt-4 grid gap-4 tablet:grid-cols-2">
          <div className="rounded-lg border border-blue-500/20 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                Google Ads (Q1 completo)
              </p>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              CPA {fmt(83)}
            </p>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Investimento</span>
                <span className="tabular-nums text-foreground">
                  {fmt(6995)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Leads</span>
                <span className="tabular-nums text-foreground">336</span>
              </div>
              <div className="flex justify-between">
                <span>Vendas</span>
                <span className="tabular-nums text-emerald-400">84</span>
              </div>
              <div className="flex justify-between">
                <span>ROAS 1ª mens</span>
                <span className="tabular-nums text-foreground">1,34×</span>
              </div>
              <div className="flex justify-between">
                <span>ROAS 12m estim.</span>
                <span className="tabular-nums text-emerald-400">16,3×</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-pink-500/20 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-pink-400">
                Meta Ads (Q1 completo)
              </p>
              <TrendingDown className="h-4 w-4 text-rose-400" />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              CPA {fmt(84)}
            </p>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Investimento</span>
                <span className="tabular-nums text-foreground">
                  {fmt(3341)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Leads</span>
                <span className="tabular-nums text-foreground">340</span>
              </div>
              <div className="flex justify-between">
                <span>Vendas</span>
                <span className="tabular-nums text-emerald-400">40</span>
              </div>
              <div className="flex justify-between">
                <span>ROAS 1ª mens</span>
                <span className="tabular-nums text-foreground">1,37×</span>
              </div>
              <div className="flex justify-between">
                <span>ROAS 12m estim.</span>
                <span className="tabular-nums text-emerald-400">16,4×</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          <strong className="text-amber-400">Observação:</strong> O ROAS 12m
          usa projeção conservadora de R$ 113 × 12 = R$ 1.356 por cliente
          (assumindo ticket constante). O contrato mínimo é de 12 meses.
        </div>
      </div>

      {/* Day of Week — chart dedicated */}
      <div>
        <SectionTitle
          icon={Clock}
          description="Distribuição dos leads por dia da semana durante o Q1. Padrão claro: segunda/terça/quarta concentram 53% dos leads (pico de intenção). Usar essa janela para concentrar bid e investimento."
        >
          Distribuição de Leads por Dia da Semana
        </SectionTitle>

        <ChartCard height="h-[340px]">
          <DayOfWeekChart />
        </ChartCard>

        <div className="mt-4 grid gap-3 tablet:grid-cols-3">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Pico (Seg-Ter-Qua)
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              757 leads · 53%
            </p>
            <p className="text-xs text-muted-foreground">
              Média de 20 leads/dia. Maximizar bid e budget nessa janela.
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Médio (Qui-Sex)
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              399 leads · 28%
            </p>
            <p className="text-xs text-muted-foreground">
              Média de 15/dia. Manter budget normal.
            </p>
          </div>
          <div className="rounded-lg border border-slate-500/20 bg-slate-500/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              Baixo (Sáb-Dom)
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              259 leads · 18%
            </p>
            <p className="text-xs text-muted-foreground">
              Média de 10/dia. Reduzir bid, focar remarketing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   TAB: GARGALOS E PERDAS
   ═════════════════════════════════════════════════════════════ */
function TabLosses() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={ShieldAlert}
        description="Análise dos 950 leads que não converteram no 1º trimestre. Cada lead perdido representa investimento em aquisição desperdiçado. O objetivo é identificar e eliminar os gargalos de maior impacto."
      >
        Diagnóstico de Perdas
      </SectionTitle>

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
              <strong className="text-foreground">300+ leads</strong> (32% das
              perdas) foram descartados por motivos de infraestrutura — o lead
              estava fora da área de cobertura, a mais de 400m da caixa ou sem
              ligação de postes. O Meta Ads sozinho responde por{" "}
              <strong className="text-rose-400">141 desses casos</strong>{" "}
              (41% das suas próprias perdas), demonstrando que o targeting
              geográfico está vazando para regiões não atendidas.
            </p>
          </div>
        </div>
      </div>

      {/* Donut + Stacked */}
      <div className="grid gap-6 laptop:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Distribuição Geral dos Motivos
          </h4>
          <ChartCard height="h-[400px]">
            <LossReasonsChart />
          </ChartCard>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Composição das Perdas por Canal (% do canal)
          </h4>
          <ChartCard height="h-[400px]">
            <LossByChannelChart />
          </ChartCard>
          <p className="mt-2 text-xs text-muted-foreground">
            Cada barra representa 100% das perdas daquele canal. O tamanho de
            cada segmento mostra a proporção do motivo no total — facilita
            comparar onde cada canal mais perde.
          </p>
        </div>
      </div>

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
                  insight:
                    "41% das perdas do Meta — targeting geográfico vazando para fora de Seropédica",
                },
                {
                  motivo: "Parou de responder",
                  count: 104,
                  insight:
                    "Leads de menor intenção; ciclo longo (~12d) dificulta follow-up",
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
                  insight:
                    "Lead mais qualificado mas sem nutrição; oportunidade de automação de follow-up",
                },
                {
                  motivo: "Achou os planos caros",
                  count: 21,
                  insight:
                    "Público comparador — requer argumentação de valor (velocidade, suporte local)",
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
                  insight:
                    "SDRs prospectando clientes ativos — cruzar base antes do disparo",
                },
                {
                  motivo: "Serasa com Adapt",
                  count: 28,
                  insight:
                    "Leads com inadimplência anterior — filtro automático pode eliminar antes do contato",
                },
              ],
            },
          ].map((ch) => (
            <div key={ch.canal} className="rounded-lg border border-border p-4">
              <p className={cn("mb-2 text-sm font-semibold", ch.color)}>
                {ch.canal}
              </p>
              <div className="space-y-2">
                {ch.items.map((item) => (
                  <div
                    key={item.motivo}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-medium tabular-nums">
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

/* ═════════════════════════════════════════════════════════════
   TAB: PORTFÓLIO E EQUIPE
   ═════════════════════════════════════════════════════════════ */
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
      <div>
        <SectionTitle
          icon={BarChart3}
          description="Distribuição das vendas por plano no 1º trimestre — dados validados via API Kommo comparando com Neon DB (492 vendas, consistência total). 77% concentradas em dois planos."
        >
          Mix de Planos Vendidos
        </SectionTitle>

        <ChartCard height="h-[420px]">
          <PlanMixChart />
        </ChartCard>

        <div className="mt-4 grid gap-4 tablet:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Modelo Dominante
            </p>
            <p className="mt-1 text-lg font-bold">Até o Vencimento</p>
            <p className="text-sm text-muted-foreground">
              77% das vendas (379 de 492) usam preço promocional fixo. Funciona
              como principal gancho de conversão.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Top 2 Planos
            </p>
            <p className="mt-1 text-lg font-bold">
              Ultra 730 + Giga 1Gb = 77%
            </p>
            <p className="text-sm text-muted-foreground">
              295 vendas do Ultra Basic 730Mb (60%) + 84 do Giga 1Gb (17%).
              Portfolio está operando como funil quase único.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Planos Premium
            </p>
            <p className="mt-1 text-lg font-bold">
              Pro Gamer + Full 1Gb = 0,4%
            </p>
            <p className="text-sm text-muted-foreground">
              Apenas 2 vendas diretas no trimestre. Melhor estratégia: funil de
              upsell pós-venda (30/60 dias) ao invés de venda direta.
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={Users}
          description="Distribuição das vendas entre os closers no 1º trimestre. Apenas 3 vendedores concentram 98% de todas as vendas. Há outros membros cadastrados (Jaqueline, Karlla, Benny, Jorge) sem vendas registradas no pipeline Hunter."
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
                  <div key={m.mes} className="rounded-lg bg-muted/50 px-3 py-2">
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

        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Risco de Concentração
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            William Vieira sozinho representa{" "}
            <strong className="text-foreground">47% das vendas</strong>. Se este
            vendedor ficar indisponível, quase metade da capacidade de
            fechamento é perdida. Carlos Eduardo mostra ramp-up acelerado (0 →
            60 vendas em 2 meses), mas o ideal é ter pelo menos 4-5 closers com
            volume significativo para mitigar o risco.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   TAB: PLANO DE AÇÃO (com 2 novas seções finais)
   ═════════════════════════════════════════════════════════════ */
function TabAction() {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={Zap}
        description="Recomendações estratégicas derivadas da análise completa do 1º trimestre, priorizadas por urgência e impacto financeiro. Dividido em 3 frentes: Campanhas, CRM e Operação Comercial. Ao final: tabela de investimento vs retorno e projeções de budget, mais correções mapeadas à jornada de compra Kotler 4.0."
      >
        Plano de Ação para o 2º Trimestre
      </SectionTitle>

      {/* Campanhas */}
      <ActionBlock
        title="Estratégia de Campanhas de Anúncios"
        subtitle="Foco na otimização do investimento entre plataformas e na qualidade dos leads gerados"
        icon={Megaphone}
        accent="bg-blue-500/5"
        border="border-blue-500/20"
        iconColor="text-blue-400"
        actions={[
          {
            priority: "Crítico",
            title: "Restringir targeting geográfico do Meta Ads",
            description:
              "Limitar raio para bairros cobertos de Seropédica e Itaguaí. Aplicar Custom Audience Exclusion com CEPs sem rede. Os 141 leads perdidos por falta de rede representam ~R$ 1.300/mês desperdiçados em CPL.",
            impact: "Economia imediata de ~R$ 4.000/trimestre em CPL desperdiçado",
          },
          {
            priority: "Crítico",
            title: "Aumentar Google Ads (não reduzir Meta ainda)",
            description:
              "Com dados Q1 completos, o CPA de ambos é ~R$ 83. O Google já entrega 2x mais vendas com 2x mais investimento — escalável. Antes de reduzir Meta, primeiro conserte o targeting (item acima). Meta com targeting correto pode igualar Google em close rate.",
            impact: "Google +25% (R$ 8.750 Q2) deve entregar +20 vendas incrementais",
          },
          {
            priority: "Importante",
            title: "Landing Page com proposta de valor diferenciada",
            description:
              "21 leads do Google foram perdidos por 'achou caro'. O público de busca compara. LP dedicada destacando velocidade real, uptime, suporte local e comparativo com concorrentes (Vivo, Claro, operadoras locais) — não apenas preço.",
            impact: "Potencial de reduzir perda por preço em ~50% (~10 vendas/trim)",
          },
          {
            priority: "Importante",
            title: "Concentrar bid em seg-qua (06h-09h)",
            description:
              "53% dos leads chegam seg-ter-qua. Configurar bid scheduling no Google Ads para maximizar impressão na janela de maior intenção. Sáb/Dom reduzir bid em 30% e focar remarketing.",
            impact: "Melhor aproveitamento do budget sem custo adicional",
          },
          {
            priority: "Estratégico",
            title: "Criar protocolo de feriado prolongado",
            description:
              "Manter budget em feriados (não cortar) — a queda é de demanda, não eficiência. Mobilizar SDRs/closers para follow-up intensivo do pipeline existente (VIABILIDADE, NEGOCIACAO, AGENDAMENTO) durante a janela.",
            impact: "Recuperar 10-20 vendas que hoje se perdem por vácuo comercial",
          },
        ]}
      />

      {/* CRM */}
      <ActionBlock
        title="Estratégia de CRM e Qualificação"
        subtitle="Ações para melhorar a qualidade do pipeline e reduzir desperdício operacional"
        icon={Target}
        accent="bg-purple-500/5"
        border="border-purple-500/20"
        iconColor="text-purple-400"
        actions={[
          {
            priority: "Crítico",
            title: "Filtrar base ativa antes do disparo Outbound",
            description:
              "43 leads perdidos por 'já é cliente' no Q1. Implementar cruzamento automático da lista de prospecção com a base ativa no Kommo antes de iniciar cadências. Filtro simples: match por telefone/email.",
            impact: "Elimina ~15 contatos desperdiçados/mês e evita desgaste com cliente ativo",
          },
          {
            priority: "Importante",
            title: "Instalar campo obrigatório de Cidade/Bairro",
            description:
              "Não há dado geográfico estruturado nos leads — análise demográfica é inferida por motivo de perda. Adicionar campo obrigatório nos formulários de LP e no fluxo de entrada do Kommo.",
            impact: "Habilita análise geográfica precisa e otimização contínua de targeting",
          },
          {
            priority: "Importante",
            title: "Automação de follow-up para Google Ads",
            description:
              "81 leads de Google 'pararam de responder'. Criar cadência automatizada de 3 toques (WhatsApp + Ligação + WhatsApp) nos primeiros 48h — Google tem ciclo curto (~6d) mas exige velocidade no primeiro contato.",
            impact: "Recuperação estimada de 10-15% dos leads que pararam de responder",
          },
          {
            priority: "Estratégico",
            title: "Pré-qualificação de Serasa antes da atribuição",
            description:
              "45 leads com Serasa foram trabalhados sem necessidade. Automatizar consulta de Serasa antes de atribuir o lead ao vendedor, marcando como 'bloqueado' se positivo.",
            impact: "Libera ~15h/mês de tempo dos vendedores para leads viáveis",
          },
        ]}
      />

      {/* Vendas */}
      <ActionBlock
        title="Estratégia Comercial e de Vendas"
        subtitle="Ações para aumentar capacidade de fechamento e reduzir risco operacional"
        icon={Users}
        accent="bg-emerald-500/5"
        border="border-emerald-500/20"
        iconColor="text-emerald-400"
        actions={[
          {
            priority: "Crítico",
            title: "Ramp-up urgente do 4º e 5º closer",
            description:
              "98% das vendas dependem de 3 pessoas, com William absorvendo 47%. Se qualquer um dos dois principais ficar indisponível, o pipeline trava. Ativar Jaqueline e Karlla com treinamento intensivo (shadowing de William) por 2 semanas e meta progressiva.",
            impact: "Reduzir concentração para <35% no vendedor principal até Jul/26",
          },
          {
            priority: "Importante",
            title: "Funil de Upsell pós-instalação (30/60/90d)",
            description:
              "Planos Premium representam <1% das vendas diretas. Criar cadência de upsell pós-instalação via WhatsApp, ofertando upgrade com desconto na primeira mensalidade adicional. Top alvos: clientes Ultra 730 para Giga 1Gb, e Giga 1Gb para Pro Gamer.",
            impact: "Ticket médio potencial de R$ 140-180 vs R$ 113 atual",
          },
          {
            priority: "Importante",
            title: "Revisão estratégica do canal B2B",
            description:
              "Apenas 13 vendas B2B no trimestre (2,6%). Decidir se vale investir: se sim, pipeline separado com SDR dedicado e proposta B2B (SLA, IP fixo, suporte prioritário). Se não, desprioritizar e focar 100% em B2C.",
            impact: "Clareza estratégica — evita dispersão de esforço em canal sem tração",
          },
          {
            priority: "Estratégico",
            title: "Distribuição de leads por perfil de vendedor",
            description:
              "Outbound converte a 48%, Google a 27%. Distribuir leads Outbound (de alta conversão) entre vendedores em ramp-up para acelerar aprendizado; leads de ads (de ciclo curto) para closers experientes.",
            impact: "Maximiza taxa de conversão por perfil e reduz tempo de ramp-up",
          },
        ]}
      />

      {/* ════════════ NOVA SEÇÃO: INVESTIMENTO vs RETORNO ════════════ */}
      <InvestmentSection />

      {/* ════════════ NOVA SEÇÃO: CORREÇÃO VIA KOTLER 4.0 ════════════ */}
      <KotlerSection />

      {/* KPIs */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h4 className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          KPIs para Monitorar no Q2
        </h4>
        <div className="mt-4 grid gap-3 tablet:grid-cols-2">
          {[
            { kpi: "CPA por canal", meta: "Google ≤ R$ 75 · Meta ≤ R$ 70" },
            {
              kpi: "% perdas por viabilidade (Meta)",
              meta: "Reduzir de 41% → < 20%",
            },
            { kpi: "Mediana do ciclo lead→venda", meta: "Manter < 7 dias" },
            {
              kpi: "Concentração top-2 vendedores",
              meta: "Reduzir de 84% → < 70%",
            },
            { kpi: "Close rate global", meta: "Manter ≥ 34% (meta: 38%)" },
            {
              kpi: "Ticket médio mensal",
              meta: "Recuperar de R$ 113 → ≥ R$ 120",
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

/* ═════════════════════════════════════════════════════════════
   SUB-COMPONENTES DO PLANO DE AÇÃO
   ═════════════════════════════════════════════════════════════ */

function ActionBlock({
  title,
  subtitle,
  icon: Icon,
  accent,
  border,
  iconColor,
  actions,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
  border: string;
  iconColor: string;
  actions: {
    priority: string;
    title: string;
    description: string;
    impact: string;
  }[];
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card/60",
      )}
    >
      <div className={cn("border-b border-border px-5 py-4", accent, border)}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", iconColor)} />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="divide-y divide-border">
        {actions.map((action, i) => {
          const priorityColor =
            action.priority === "Crítico"
              ? "bg-rose-500"
              : action.priority === "Importante"
                ? "bg-amber-500"
                : "bg-blue-500";
          const priorityBadge =
            action.priority === "Crítico"
              ? "bg-rose-500/10 text-rose-400"
              : action.priority === "Importante"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-blue-500/10 text-blue-400";
          return (
            <div key={i} className="flex gap-4 p-5">
              <div className="flex flex-col items-center gap-1">
                <span className={cn("h-2 w-2 rounded-full", priorityColor)} />
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="flex-1">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    priorityBadge,
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
          );
        })}
      </div>
    </div>
  );
}

function InvestmentSection() {
  // Ticket médio para LTV 12m — assume R$ 113 × 12 = R$ 1.356 (conservador)
  const TICKET_12M = 1356;

  // Dados base Q1 (completo via BigQuery)
  const monthly = [
    {
      mes: "Janeiro",
      metaSpend: 1146,
      metaLeads: 122,
      metaVendas: 13,
      googleSpend: 2432,
      googleLeads: 110,
      googleVendas: 28,
    },
    {
      mes: "Fevereiro",
      metaSpend: 1035,
      metaLeads: 78,
      metaVendas: 12,
      googleSpend: 2341,
      googleLeads: 102,
      googleVendas: 20,
    },
    {
      mes: "Março",
      metaSpend: 1160,
      metaLeads: 140,
      metaVendas: 15,
      googleSpend: 2222,
      googleLeads: 124,
      googleVendas: 36,
    },
  ];

  // Totais base para cenários
  const totalSpend = monthly.reduce(
    (s, m) => s + m.metaSpend + m.googleSpend,
    0,
  );
  const totalLeads = monthly.reduce(
    (s, m) => s + m.metaLeads + m.googleLeads,
    0,
  );
  const totalVendas = monthly.reduce(
    (s, m) => s + m.metaVendas + m.googleVendas,
    0,
  );

  // Primeira mensalidade: estimar via ticket médio × vendas
  const ticketMedioPago = 113;
  const totalFat1 = totalVendas * ticketMedioPago;
  const totalFat12 = totalVendas * TICKET_12M;

  // Projeções de escala com eficiência marginal decrescente
  const scenarios = [
    { label: "Atual", mult: 1, efficiency: 1.0 },
    { label: "+25%", mult: 1.25, efficiency: 0.85 }, // 85% da eficiência
    { label: "+50%", mult: 1.5, efficiency: 0.78 }, // 78% da eficiência
    { label: "+100%", mult: 2.0, efficiency: 0.7 }, // 70% da eficiência
  ];

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="border-b border-border bg-emerald-500/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <h4 className="font-semibold">Investimento e Retorno Mensal</h4>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Tabela detalhada por mês e canal (Meta/Google) cruzando investimento
          com leads e vendas atribuídas no Kommo. Faturamento em dois recortes:
          1ª mensalidade e projeção 12m (contrato mínimo).
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* Chart spend vs returns */}
        <ChartCard height="h-[340px]" className="border-border">
          <SpendVsReturnsChart />
        </ChartCard>

        {/* Monthly table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Mês
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-pink-400">
                  Meta
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Spend
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Leads
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Vendas
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  CPA
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-blue-400">
                  Google
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Spend
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Leads
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Vendas
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  CPA
                </th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((r) => (
                <tr
                  key={r.mes}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2.5 font-medium">{r.mes}</td>
                  <td className="px-3 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500 inline-block" />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {fmt(r.metaSpend)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {r.metaLeads}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400">
                    {r.metaVendas}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {fmt(r.metaSpend / r.metaVendas)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {fmt(r.googleSpend)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {r.googleLeads}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400">
                    {r.googleVendas}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {fmt(r.googleSpend / r.googleVendas)}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-semibold">
                <td className="px-3 py-2.5">Total Q1</td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {fmt(3341)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">340</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400">
                  40
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {fmt(84)}
                </td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {fmt(6995)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">336</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400">
                  84
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {fmt(83)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Consolidado */}
        <div className="grid gap-3 tablet:grid-cols-4">
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Investimento total Q1
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {fmt(totalSpend)}
            </p>
            <p className="text-xs text-muted-foreground">
              Meta + Google combinados
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Leads atribuídos
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums">{totalLeads}</p>
            <p className="text-xs text-muted-foreground">
              via tags no Kommo
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Fat. 1ª mensalidade
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-emerald-400">
              {fmt(totalFat1)}
            </p>
            <p className="text-xs text-muted-foreground">
              ROAS {(totalFat1 / totalSpend).toFixed(2)}× (subestimado)
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-xs uppercase tracking-wider text-emerald-400">
              Fat. 12m projetado
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-emerald-400">
              {fmt(totalFat12)}
            </p>
            <p className="text-xs text-muted-foreground">
              ROAS {(totalFat12 / totalSpend).toFixed(1)}× · LTV R$ 1.356/cliente
            </p>
          </div>
        </div>

        {/* Cenários de escala */}
        <div>
          <h5 className="mb-2 flex items-center gap-2 font-semibold">
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            Projeções de Escala (Q2 — base trimestral)
          </h5>
          <p className="mb-4 text-xs text-muted-foreground">
            Modelo com eficiência marginal decrescente: +25% mantém 85% de
            eficiência, +50% mantém 78%, +100% mantém 70%. Assume CPA atual
            (~R$ 83) e LTV conservador de R$ 1.356 (12m × R$ 113).
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Cenário
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                    Budget
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                    Leads
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                    Vendas
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-emerald-400">
                    Fat. 1ª mens
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-emerald-400">
                    Fat. 12m
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                    ROAS 12m
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                    Δ Vendas
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => {
                  const budget = totalSpend * s.mult;
                  const leads = Math.round(totalLeads * s.mult * s.efficiency);
                  const vendas = Math.round(
                    totalVendas * s.mult * s.efficiency,
                  );
                  const fat1 = vendas * ticketMedioPago;
                  const fat12 = vendas * TICKET_12M;
                  const roas12 = fat12 / budget;
                  const deltaVendas = vendas - totalVendas;
                  const isBase = s.mult === 1;
                  return (
                    <tr
                      key={s.label}
                      className={cn(
                        "border-b border-border last:border-0 hover:bg-muted/30",
                        isBase && "bg-muted/20",
                      )}
                    >
                      <td className="px-3 py-2.5 font-medium">{s.label}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {fmt(budget)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {leads}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400">
                        {vendas}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {fmt(fat1)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400">
                        {fmt(fat12)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {roas12.toFixed(1)}×
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {isBase ? (
                          "—"
                        ) : (
                          <span className="text-emerald-400">
                            +{deltaVendas}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <strong className="text-amber-400">Importante:</strong> O LTV 12m é
            conservador (R$ 113 × 12). Se após o período promocional
            (até o vencimento) o cliente migra para o preço de recorrência
            (R$ 129,90), o LTV real sobe para ~R$ 1.542 — ROAS 12m cresce
            ~14%. Também não considera renovação além do contrato mínimo de 12
            meses, onde os clientes retidos continuam gerando receita.
          </div>
        </div>
      </div>
    </div>
  );
}

function KotlerSection() {
  // Jornada Kotler 4.0 (5As): Aware → Appeal → Ask → Act → Advocate
  // Usuário disse para tirar a última (Advocate/Apologia)

  const stages = [
    {
      letter: "A",
      name: "Aware",
      pt: "Conhecimento",
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      diagnostic:
        "Meta Ads é o principal canal de descoberta (340 leads) mas tem vazamento geográfico crítico (141 leads em áreas sem rede).",
      correction:
        "Targeting geográfico restrito a Seropédica/Itaguaí. Lookalike audience a partir da base de clientes ativos, não de interesse genérico.",
      expectedImpact: "Leads Meta com viabilidade: 41% → 80%. Mesmo budget, +30 vendas/trim",
    },
    {
      letter: "A",
      name: "Appeal",
      pt: "Atração",
      icon: Compass,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      diagnostic:
        "Portfolio opera como funil único (77% em 2 planos). Mensagem é de preço — 21 leads Google perderam por 'achou caro'. Falta proposta de valor diferenciada.",
      correction:
        "LP dedicada com comparativo de velocidade real, uptime, suporte local. Criativos destacando diferenciação vs concorrentes (Claro, Vivo, operadoras locais).",
      expectedImpact: "Redução de 'achou caro' em 50% (~10 vendas/trim). Ticket médio R$ 113 → R$ 122",
    },
    {
      letter: "A",
      name: "Ask",
      pt: "Pergunta / Curiosidade",
      icon: Brain,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      diagnostic:
        "330 leads pararam de responder — ponto mais crítico do trimestre. Google Ads perde 81 leads nesse estágio, Meta 104, Outbound 126.",
      correction:
        "Automação de 3 toques (WhatsApp + Ligação + WhatsApp) nas primeiras 48h. Script de qualificação rápida (viabilidade + intenção) no 1º contato. Pré-qualificação Serasa automatizada.",
      expectedImpact: "Recuperação de 10-15% dos 'parou de responder' = 33-50 vendas/trim adicionais",
    },
    {
      letter: "A",
      name: "Act",
      pt: "Ação / Compra",
      icon: ShoppingCart,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      diagnostic:
        "98% das vendas dependem de 3 closers, 47% em William. Risco operacional alto. Carlos Eduardo em ramp-up (0 → 60 em 2 meses).",
      correction:
        "Ativar Jaqueline e Karlla com shadowing estruturado. Distribuição de leads por perfil: Outbound (alta conv) para ramp-up; ads para closers experientes. Meta individual progressiva.",
      expectedImpact: "Concentração top-2: 84% → 70%. Capacidade total de fechamento +40%",
    },
    // Advocate removido conforme pedido do usuário
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60">
      <div className="border-b border-border bg-indigo-500/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-indigo-400" />
          <h4 className="font-semibold">
            Cenário Corrigido — Jornada de Compra Kotler 4.0
          </h4>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Mapeamento dos 5As (Aware-Appeal-Ask-Act-Advocate) à nossa operação.
          Cada etapa da jornada ganha um diagnóstico atual (o que está quebrado)
          e a correção proposta para o Q2. A etapa final de Apologia
          (Advocate) está fora do escopo desta análise, por decisão estratégica.
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* Journey visualization */}
        <div className="space-y-3">
          {stages.map((s, i) => (
            <div
              key={s.name}
              className={cn(
                "relative rounded-xl border bg-background/40 p-5",
                s.border,
              )}
            >
              <div className="flex flex-col gap-4 laptop:flex-row">
                {/* Stage Badge */}
                <div className="flex items-center gap-3 laptop:w-56 laptop:flex-col laptop:items-start">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold",
                      s.bg,
                      s.color,
                    )}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Etapa {i + 1}/4
                    </p>
                    <p className={cn("text-lg font-bold", s.color)}>
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.pt}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      Diagnóstico Q1
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {s.diagnostic}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      <Lightbulb className="h-3 w-3" />
                      Correção Q2
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {s.correction}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border bg-background/60 px-3 py-2",
                      s.border,
                    )}
                  >
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <ArrowUpRight className="h-3 w-3" />
                      Impacto esperado
                    </p>
                    <p className={cn("text-sm font-medium", s.color)}>
                      {s.expectedImpact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consolidated projection */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-emerald-400" />
            <h5 className="font-semibold text-emerald-400">
              Cenário consolidado — se todos os 4 ajustes forem aplicados
            </h5>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Aplicando as 4 correções mapeadas nas etapas Aware → Appeal → Ask →
            Act, mantendo o mesmo investimento em ads do Q1 (R$ 10.336), a
            projeção para o Q2 é:
          </p>

          <div className="mt-4 grid gap-3 tablet:grid-cols-4">
            <div className="rounded-lg border border-emerald-500/20 bg-background/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Leads Q2 projetado
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                ~1.700
              </p>
              <p className="text-xs text-emerald-400">+20% vs Q1 (1.414)</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-background/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Vendas Q2 projetado
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">~640</p>
              <p className="text-xs text-emerald-400">+30% vs Q1 (492)</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-background/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Fat. 1ª mens Q2
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {fmt(78080)}
              </p>
              <p className="text-xs text-emerald-400">+36% vs Q1</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-background/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Fat. 12m projetado
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {fmt(867840)}
              </p>
              <p className="text-xs text-emerald-400">+36% LTV</p>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Premissas:</strong> close
              rate 34,8% → 38% (melhoria Ask+Act), targeting Meta corrigido
              libera ~30 vendas/trim desperdiçadas, ramp-up de closers adiciona
              capacidade, ticket médio mantém R$ 113 (realmente deve subir
              ligeiramente com Appeal melhor, mas mantemos conservador).
            </p>
          </div>
        </div>

        {/* Sales Journey Phase Badges */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {stages.map((s, i) => (
            <div key={s.name} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2",
                  s.bg,
                  s.border,
                )}
              >
                <span className={cn("text-[10px] font-bold", s.color)}>
                  {i + 1}
                </span>
                <span className={cn("text-xs font-bold", s.color)}>
                  {s.letter}
                </span>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═════════════════════════════════════════════════════════════ */
export function TrimestreDashboard() {
  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start gap-1 overflow-x-auto bg-muted/50 p-1">
          <TabsTrigger
            value="overview"
            className="gap-1.5 text-xs tablet:text-sm"
          >
            <BarChart3 className="hidden h-3.5 w-3.5 tablet:block" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="channels"
            className="gap-1.5 text-xs tablet:text-sm"
          >
            <Target className="hidden h-3.5 w-3.5 tablet:block" />
            Canais de Mídia
          </TabsTrigger>
          <TabsTrigger
            value="losses"
            className="gap-1.5 text-xs tablet:text-sm"
          >
            <ShieldAlert className="hidden h-3.5 w-3.5 tablet:block" />
            Gargalos e Perdas
          </TabsTrigger>
          <TabsTrigger
            value="portfolio"
            className="gap-1.5 text-xs tablet:text-sm"
          >
            <Users className="hidden h-3.5 w-3.5 tablet:block" />
            Portfólio e Equipe
          </TabsTrigger>
          <TabsTrigger
            value="action"
            className="gap-1.5 text-xs tablet:text-sm"
          >
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

      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Dados: Kommo CRM (pipeline Hunter 8480507) · Meta Ads (Airbyte) ·
          Google Ads (BigQuery DTS completo Q1) · Referência: 15/04/2026 ·
          Vendas atribuídas via tags de origem no CRM
        </p>
      </div>
    </div>
  );
}

// unused imports guard
void Phone;
