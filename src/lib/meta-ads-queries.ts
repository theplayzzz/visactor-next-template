import { min, sql } from "drizzle-orm";

import { db } from "@/db";
import { adsInsights } from "@/db/schema";
import {
  type CampaignBreakdown,
  type CampanhasMetrics,
  type RankingDistribution,
} from "@/types/campanhas";

export { type CampanhasMetrics } from "@/types/campanhas";

interface ActionItem {
  action_type: string;
  value: number | string;
}

function sumActionType(
  actions: ActionItem[] | null | undefined,
  actionType: string,
): number {
  if (!actions) return 0;
  return actions
    .filter((a) => a.action_type === actionType)
    .reduce((sum, a) => sum + Number(a.value || 0), 0);
}

export async function getCampanhasMetrics(
  startDate: string,
  endDate: string,
): Promise<CampanhasMetrics> {
  const rows = await db
    .select()
    .from(adsInsights)
    .where(
      sql`${adsInsights.dateStart} >= ${startDate} AND ${adsInsights.dateStart} <= ${endDate}`,
    );

  // Overview KPIs
  let totalSpend = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalReach = 0;
  let totalLeads = 0;

  // Mensageria
  let conversationsStarted = 0;
  let firstReplies = 0;

  // Engajamento
  let linkClicks = 0;
  let landingPageViews = 0;
  let pageEngagement = 0;
  let postEngagement = 0;
  let videoViews = 0;
  let postReactions = 0;
  let comments = 0;

  // Rankings
  const qualityCounts: Record<string, number> = {};
  const conversionRateCounts: Record<string, number> = {};
  const engagementRateCounts: Record<string, number> = {};

  // Campaign breakdown
  const campaignMap = new Map<
    string,
    {
      name: string;
      spend: number;
      clicks: number;
      impressions: number;
      reach: number;
      leads: number;
    }
  >();

  let lastExtractedAt: Date | null = null;

  for (const row of rows) {
    const spend = Number(row.spend || 0);
    const clicks = row.clicks ?? 0;
    const impressions = row.impressions ?? 0;
    const reach = row.reach ?? 0;
    const actions = row.actions as ActionItem[] | null;

    totalSpend += spend;
    totalClicks += clicks;
    totalImpressions += impressions;
    totalReach += reach;

    // Actions
    const rowLeads = sumActionType(actions, "lead");
    totalLeads += rowLeads;

    conversationsStarted += sumActionType(
      actions,
      "onsite_conversion.messaging_conversation_started_7d",
    );
    firstReplies += sumActionType(
      actions,
      "onsite_conversion.messaging_first_reply",
    );
    linkClicks += sumActionType(actions, "link_click");
    landingPageViews += sumActionType(actions, "landing_page_view");
    pageEngagement += sumActionType(actions, "page_engagement");
    postEngagement += sumActionType(actions, "post_engagement");
    videoViews += sumActionType(actions, "video_view");
    postReactions += sumActionType(actions, "post_reaction");
    comments += sumActionType(actions, "comment");

    // Rankings
    if (row.qualityRanking) {
      qualityCounts[row.qualityRanking] =
        (qualityCounts[row.qualityRanking] ?? 0) + 1;
    }
    if (row.conversionRateRanking) {
      conversionRateCounts[row.conversionRateRanking] =
        (conversionRateCounts[row.conversionRateRanking] ?? 0) + 1;
    }
    if (row.engagementRateRanking) {
      engagementRateCounts[row.engagementRateRanking] =
        (engagementRateCounts[row.engagementRateRanking] ?? 0) + 1;
    }

    // Campaign breakdown
    const cId = row.campaignId ?? "unknown";
    const cName = row.campaignName ?? "Sem nome";
    if (!campaignMap.has(cId)) {
      campaignMap.set(cId, {
        name: cName,
        spend: 0,
        clicks: 0,
        impressions: 0,
        reach: 0,
        leads: 0,
      });
    }
    const c = campaignMap.get(cId)!;
    c.spend += spend;
    c.clicks += clicks;
    c.impressions += impressions;
    c.reach += reach;
    c.leads += rowLeads;

    // Last extracted
    if (
      row._airbyteExtractedAt &&
      (!lastExtractedAt || row._airbyteExtractedAt > lastExtractedAt)
    ) {
      lastExtractedAt = row._airbyteExtractedAt;
    }
  }

  // Derived overview KPIs
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm =
    totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgCtr =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgFrequency =
    totalReach > 0 ? totalImpressions / totalReach : 0;

  // Campaign breakdown sorted by spend desc
  const campaignsArr: CampaignBreakdown[] = Array.from(
    campaignMap.entries(),
  )
    .map(([id, c]) => ({
      campaignId: id,
      campaignName: c.name,
      spend: c.spend,
      clicks: c.clicks,
      impressions: c.impressions,
      reach: c.reach,
      leads: c.leads,
      cpc: c.clicks > 0 ? c.spend / c.clicks : 0,
      cpl: c.leads > 0 ? c.spend / c.leads : 0,
      ctr:
        c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
    }))
    .sort((a, b) => b.spend - a.spend);

  // Mensageria derived
  const costPerConversation =
    conversationsStarted > 0 ? totalSpend / conversationsStarted : 0;
  const responseRate =
    conversationsStarted > 0
      ? (firstReplies / conversationsStarted) * 100
      : 0;

  // Rankings to arrays
  const toRankingArray = (
    counts: Record<string, number>,
  ): RankingDistribution[] =>
    Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

  return {
    totalSpend,
    totalLeads,
    cpl,
    totalClicks,
    avgCpc,
    totalImpressions,
    avgCpm,
    avgCtr,
    totalReach,
    avgFrequency,
    campaigns: campaignsArr,
    conversationsStarted,
    firstReplies,
    costPerConversation,
    responseRate,
    linkClicks,
    landingPageViews,
    pageEngagement,
    postEngagement,
    videoViews,
    postReactions,
    comments,
    qualityRanking: toRankingArray(qualityCounts),
    conversionRateRanking: toRankingArray(conversionRateCounts),
    engagementRateRanking: toRankingArray(engagementRateCounts),
    lastExtractedAt,
  };
}

/** Retorna o spend total Meta Ads para o intervalo de datas informado */
export async function getMetaSpend(
  startDate: string,
  endDate: string,
): Promise<number> {
  const result = await db
    .select({
      total: sql<string>`coalesce(sum(${adsInsights.spend}::numeric), 0)`,
    })
    .from(adsInsights)
    .where(
      sql`${adsInsights.dateStart} >= ${startDate} AND ${adsInsights.dateStart} <= ${endDate}`,
    );
  return Number(result[0]?.total ?? 0);
}

/** Retorna a data mais antiga de ads_insights para o preset "Período máximo" */
export async function getMinInsightsDate(): Promise<string> {
  const result = await db
    .select({ minDate: min(adsInsights.dateStart) })
    .from(adsInsights);

  return result[0]?.minDate ?? new Date().toISOString().split("T")[0];
}
