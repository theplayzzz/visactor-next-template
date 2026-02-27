import {
  BarChart3,
  DollarSign,
  Eye,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Percent,
  Repeat,
  Target,
  Users,
} from "lucide-react";
import { format, parseISO, subDays } from "date-fns";

import { CampanhasDatePicker } from "@/components/campanhas/date-range-picker";
import { chartTitle } from "@/components/primitives";
import {
  type CampanhasMetrics,
  getCampanhasMetrics,
  getMinInsightsDate,
} from "@/lib/meta-ads-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

const RANKING_LABELS: Record<string, string> = {
  ABOVE_AVERAGE_35: "Acima da média (top 35%)",
  ABOVE_AVERAGE_20: "Acima da média (top 20%)",
  ABOVE_AVERAGE_10: "Acima da média (top 10%)",
  ABOVE_AVERAGE: "Acima da média",
  AVERAGE: "Média",
  BELOW_AVERAGE_35: "Abaixo da média (bottom 35%)",
  BELOW_AVERAGE_20: "Abaixo da média (bottom 20%)",
  BELOW_AVERAGE_10: "Abaixo da média (bottom 10%)",
  BELOW_AVERAGE: "Abaixo da média",
  UNKNOWN: "Sem dados",
};

function getRankingColor(label: string): string {
  if (label.startsWith("ABOVE")) return "bg-green-500 dark:bg-green-400";
  if (label === "AVERAGE") return "bg-yellow-500 dark:bg-yellow-400";
  if (label.startsWith("BELOW")) return "bg-red-500 dark:bg-red-400";
  return "bg-muted-foreground";
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-1")}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        <div className={cn("rounded-lg p-2", bgColor)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <span className="text-xl font-semibold tabular-nums">{value}</span>
      </div>
    </div>
  );
}

function RankingSection({
  title,
  data,
}: {
  title: string;
  data: { label: string; count: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return null;

  return (
    <div>
      <h4
        className={cn(
          chartTitle({ color: "mute", size: "sm" }),
          "mb-3 font-medium",
        )}
      >
        {title}
      </h4>
      <div className="flex flex-col gap-2">
        {data.map((item) => {
          const pct = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm">
                  {RANKING_LABELS[item.label] ?? item.label}
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {item.count} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    getRankingColor(item.label),
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function CampanhasPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;

  const now = new Date();
  const defaultFrom = format(subDays(now, 29), "yyyy-MM-dd");
  const defaultTo = format(now, "yyyy-MM-dd");

  const startDate = params.from ?? defaultFrom;
  const endDate = params.to ?? defaultTo;

  let data: CampanhasMetrics | null = null;
  let error: string | null = null;
  let minDate = defaultFrom;

  try {
    [data, minDate] = await Promise.all([
      getCampanhasMetrics(startDate, endDate),
      getMinInsightsDate(),
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
              Erro ao carregar dados de campanhas
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

  const fromDisplay = format(parseISO(startDate), "yyyy-MM-dd");
  const toDisplay = format(parseISO(endDate), "yyyy-MM-dd");

  return (
    <div className="mx-auto max-w-5xl px-6 tablet:px-10">
      {/* Date Picker */}
      <div className="border-b border-border py-4">
        <CampanhasDatePicker
          from={fromDisplay}
          to={toDisplay}
          minDate={minDate}
        />
      </div>

      {/* Seção 1 — KPIs Gerais */}
      <div className="border-b border-border py-6">
        <h2
          className={cn(
            chartTitle({ color: "default", size: "lg" }),
            "mb-4 flex items-center gap-2",
          )}
        >
          <Megaphone className="h-5 w-5 text-primary" />
          Visão Geral
        </h2>
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-5">
          <KpiCard
            label="Investimento"
            value={formatCurrency(data.totalSpend)}
            icon={DollarSign}
            iconColor="text-emerald-500"
            bgColor="bg-emerald-50 dark:bg-emerald-950"
          />
          <KpiCard
            label="Leads"
            value={formatNumber(data.totalLeads)}
            icon={Users}
            iconColor="text-purple-500"
            bgColor="bg-purple-50 dark:bg-purple-950"
          />
          <KpiCard
            label="CPL"
            value={formatCurrency(data.cpl)}
            icon={Target}
            iconColor="text-orange-500"
            bgColor="bg-orange-50 dark:bg-orange-950"
          />
          <KpiCard
            label="Cliques"
            value={formatNumber(data.totalClicks)}
            icon={MousePointerClick}
            iconColor="text-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-950"
          />
          <KpiCard
            label="CPC"
            value={formatCurrency(data.avgCpc)}
            icon={DollarSign}
            iconColor="text-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-950"
          />
          <KpiCard
            label="Impressões"
            value={formatNumber(data.totalImpressions)}
            icon={Eye}
            iconColor="text-indigo-500"
            bgColor="bg-indigo-50 dark:bg-indigo-950"
          />
          <KpiCard
            label="CPM"
            value={formatCurrency(data.avgCpm)}
            icon={BarChart3}
            iconColor="text-indigo-500"
            bgColor="bg-indigo-50 dark:bg-indigo-950"
          />
          <KpiCard
            label="CTR"
            value={formatPercent(data.avgCtr)}
            icon={Percent}
            iconColor="text-teal-500"
            bgColor="bg-teal-50 dark:bg-teal-950"
          />
          <KpiCard
            label="Alcance"
            value={formatNumber(data.totalReach)}
            icon={Megaphone}
            iconColor="text-pink-500"
            bgColor="bg-pink-50 dark:bg-pink-950"
          />
          <KpiCard
            label="Frequência"
            value={data.avgFrequency.toFixed(2)}
            icon={Repeat}
            iconColor="text-slate-500"
            bgColor="bg-slate-50 dark:bg-slate-950"
          />
        </div>
      </div>

      {/* Seção 2 — Breakdown por Campanha */}
      {data.campaigns.length > 0 && (
        <div className="border-b border-border py-6">
          <h2
            className={cn(
              chartTitle({ color: "default", size: "lg" }),
              "mb-4 flex items-center gap-2",
            )}
          >
            <BarChart3 className="h-5 w-5 text-primary" />
            Campanhas
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Campanha",
                    "Investimento",
                    "Leads",
                    "CPL",
                    "Cliques",
                    "CPC",
                    "CTR",
                    "Impressões",
                    "Alcance",
                  ].map((col) => (
                    <th
                      key={col}
                      className={cn(
                        chartTitle({ color: "mute", size: "sm" }),
                        "whitespace-nowrap px-3 py-2 text-left font-normal",
                        col !== "Campanha" && "text-right",
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((c) => (
                  <tr
                    key={c.campaignId}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="max-w-[200px] truncate px-3 py-2 text-sm font-medium">
                      {c.campaignName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {formatCurrency(c.spend)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {c.leads}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {formatCurrency(c.cpl)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {formatNumber(c.clicks)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {formatCurrency(c.cpc)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {formatPercent(c.ctr)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {formatNumber(c.impressions)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums">
                      {formatNumber(c.reach)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seção 3 — Mensageria */}
      <div className="border-b border-border py-6">
        <h2
          className={cn(
            chartTitle({ color: "default", size: "lg" }),
            "mb-4 flex items-center gap-2",
          )}
        >
          <MessageCircle className="h-5 w-5 text-primary" />
          Mensageria
        </h2>
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
          <KpiCard
            label="Conversas Iniciadas"
            value={formatNumber(data.conversationsStarted)}
            icon={MessageCircle}
            iconColor="text-green-500"
            bgColor="bg-green-50 dark:bg-green-950"
          />
          <KpiCard
            label="Primeiras Respostas"
            value={formatNumber(data.firstReplies)}
            icon={MessageCircle}
            iconColor="text-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-950"
          />
          <KpiCard
            label="Custo por Conversa"
            value={formatCurrency(data.costPerConversation)}
            icon={DollarSign}
            iconColor="text-orange-500"
            bgColor="bg-orange-50 dark:bg-orange-950"
          />
          <KpiCard
            label="Taxa de Resposta"
            value={formatPercent(data.responseRate)}
            icon={Percent}
            iconColor="text-teal-500"
            bgColor="bg-teal-50 dark:bg-teal-950"
          />
        </div>
      </div>

      {/* Seção 4 — Engajamento */}
      <div className="border-b border-border py-6">
        <h2
          className={cn(
            chartTitle({ color: "default", size: "lg" }),
            "mb-4 flex items-center gap-2",
          )}
        >
          <MousePointerClick className="h-5 w-5 text-primary" />
          Engajamento
        </h2>
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
          <KpiCard
            label="Link Clicks"
            value={formatNumber(data.linkClicks)}
            icon={MousePointerClick}
            iconColor="text-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-950"
          />
          <KpiCard
            label="Landing Page Views"
            value={formatNumber(data.landingPageViews)}
            icon={Eye}
            iconColor="text-indigo-500"
            bgColor="bg-indigo-50 dark:bg-indigo-950"
          />
          <KpiCard
            label="Page Engagement"
            value={formatNumber(data.pageEngagement)}
            icon={Users}
            iconColor="text-purple-500"
            bgColor="bg-purple-50 dark:bg-purple-950"
          />
          <KpiCard
            label="Post Engagement"
            value={formatNumber(data.postEngagement)}
            icon={MessageCircle}
            iconColor="text-pink-500"
            bgColor="bg-pink-50 dark:bg-pink-950"
          />
          <KpiCard
            label="Video Views"
            value={formatNumber(data.videoViews)}
            icon={Eye}
            iconColor="text-red-500"
            bgColor="bg-red-50 dark:bg-red-950"
          />
          <KpiCard
            label="Reactions"
            value={formatNumber(data.postReactions)}
            icon={Target}
            iconColor="text-yellow-500"
            bgColor="bg-yellow-50 dark:bg-yellow-950"
          />
          <KpiCard
            label="Comments"
            value={formatNumber(data.comments)}
            icon={MessageCircle}
            iconColor="text-green-500"
            bgColor="bg-green-50 dark:bg-green-950"
          />
        </div>
      </div>

      {/* Seção 5 — Rankings de Qualidade */}
      {(data.qualityRanking.length > 0 ||
        data.conversionRateRanking.length > 0 ||
        data.engagementRateRanking.length > 0) && (
        <div className="border-b border-border py-6">
          <h2
            className={cn(
              chartTitle({ color: "default", size: "lg" }),
              "mb-4 flex items-center gap-2",
            )}
          >
            <BarChart3 className="h-5 w-5 text-primary" />
            Rankings de Qualidade
          </h2>
          <div className="grid gap-6 tablet:grid-cols-3">
            <RankingSection
              title="Quality Ranking"
              data={data.qualityRanking}
            />
            <RankingSection
              title="Conversion Rate Ranking"
              data={data.conversionRateRanking}
            />
            <RankingSection
              title="Engagement Rate Ranking"
              data={data.engagementRateRanking}
            />
          </div>
        </div>
      )}

      {/* Footer — Último sync */}
      <div className="py-4">
        <p className="text-xs text-muted-foreground">
          Último sync Airbyte:{" "}
          {data.lastExtractedAt
            ? data.lastExtractedAt.toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })
            : "Nunca"}
        </p>
      </div>
    </div>
  );
}
