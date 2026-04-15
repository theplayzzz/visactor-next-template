import "server-only";

import { getGoogleAdsTable, runBigQuery } from "@/lib/bigquery";
import {
  type CampaignBreakdown,
  type CampanhasMetrics,
} from "@/types/campanhas";

interface CampaignRow {
  campaign_id: string;
  spend: number | null;
  clicks: number | null;
  impressions: number | null;
  conversions: number | null;
}

interface LastExtractedRow {
  last_extracted: { value: string } | string | null;
}

interface MinDateRow {
  min_date: { value: string } | string | null;
}

function toNumber(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === "number" ? v : Number(v);
}

function unwrapDate(
  v: { value: string } | string | null,
): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.value;
}

export async function getGoogleAdsCampanhasMetrics(
  startDate: string,
  endDate: string,
): Promise<CampanhasMetrics> {
  const tableStats = getGoogleAdsTable("CampaignStats");

  const campaignRows = await runBigQuery<CampaignRow>(
    `
    SELECT
      CAST(campaign_id AS STRING) AS campaign_id,
      SUM(metrics_cost_micros) / 1000000 AS spend,
      SUM(metrics_clicks) AS clicks,
      SUM(metrics_impressions) AS impressions,
      SUM(metrics_conversions) AS conversions
    FROM ${tableStats}
    WHERE segments_date BETWEEN @start_date AND @end_date
    GROUP BY campaign_id
    `,
    { start_date: startDate, end_date: endDate },
  );

  const [lastExtractedRow] = await runBigQuery<LastExtractedRow>(
    `
    SELECT MAX(_PARTITIONTIME) AS last_extracted
    FROM ${tableStats}
    WHERE segments_date BETWEEN @start_date AND @end_date
    `,
    { start_date: startDate, end_date: endDate },
  );

  let totalSpend = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalLeads = 0;

  const campaigns: CampaignBreakdown[] = campaignRows.map((row) => {
    const spend = toNumber(row.spend);
    const clicks = toNumber(row.clicks);
    const impressions = toNumber(row.impressions);
    const leads = toNumber(row.conversions);

    totalSpend += spend;
    totalClicks += clicks;
    totalImpressions += impressions;
    totalLeads += leads;

    return {
      campaignId: String(row.campaign_id),
      campaignName: String(row.campaign_id),
      spend,
      clicks,
      impressions,
      reach: 0,
      leads,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpl: leads > 0 ? spend / leads : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  });

  campaigns.sort((a, b) => b.spend - a.spend);

  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0
    ? (totalSpend / totalImpressions) * 1000
    : 0;
  const avgCtr = totalImpressions > 0
    ? (totalClicks / totalImpressions) * 100
    : 0;

  const lastExtractedRaw = unwrapDate(lastExtractedRow?.last_extracted ?? null);
  const lastExtractedAt = lastExtractedRaw ? new Date(lastExtractedRaw) : null;

  return {
    totalSpend,
    totalLeads,
    cpl,
    totalClicks,
    avgCpc,
    totalImpressions,
    avgCpm,
    avgCtr,
    totalReach: 0,
    avgFrequency: 0,

    campaigns,

    conversationsStarted: 0,
    firstReplies: 0,
    costPerConversation: 0,
    responseRate: 0,

    linkClicks: totalClicks,
    landingPageViews: 0,
    pageEngagement: 0,
    postEngagement: 0,
    videoViews: 0,
    postReactions: 0,
    comments: 0,

    qualityRanking: [],
    conversionRateRanking: [],
    engagementRateRanking: [],

    lastExtractedAt,
  };
}

export async function getGoogleAdsSpend(
  startDate: string,
  endDate: string,
): Promise<number> {
  const table = getGoogleAdsTable("CampaignStats");
  const [row] = await runBigQuery<{ total: number | string | null }>(
    `
    SELECT COALESCE(SUM(metrics_cost_micros), 0) / 1000000 AS total
    FROM ${table}
    WHERE segments_date BETWEEN @start_date AND @end_date
    `,
    { start_date: startDate, end_date: endDate },
  );
  return toNumber(row?.total);
}

export async function getGoogleAdsMinDate(): Promise<string> {
  const table = getGoogleAdsTable("CampaignStats");
  const [row] = await runBigQuery<MinDateRow>(
    `SELECT MIN(segments_date) AS min_date FROM ${table}`,
  );
  const value = unwrapDate(row?.min_date ?? null);
  if (value) return value;
  const fallback = new Date();
  fallback.setDate(fallback.getDate() - 30);
  return fallback.toISOString().slice(0, 10);
}
