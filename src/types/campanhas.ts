export type Platform = "meta" | "google";

export interface CampaignBreakdown {
  campaignId: string;
  campaignName: string;
  spend: number;
  clicks: number;
  impressions: number;
  reach: number;
  leads: number;
  cpc: number;
  cpl: number;
  ctr: number;
}

export interface RankingDistribution {
  label: string;
  count: number;
}

export interface CampanhasMetrics {
  totalSpend: number;
  totalLeads: number;
  cpl: number;
  totalClicks: number;
  avgCpc: number;
  totalImpressions: number;
  avgCpm: number;
  avgCtr: number;
  totalReach: number;
  avgFrequency: number;

  campaigns: CampaignBreakdown[];

  conversationsStarted: number;
  firstReplies: number;
  costPerConversation: number;
  responseRate: number;

  linkClicks: number;
  landingPageViews: number;
  pageEngagement: number;
  postEngagement: number;
  videoViews: number;
  postReactions: number;
  comments: number;

  qualityRanking: RankingDistribution[];
  conversionRateRanking: RankingDistribution[];
  engagementRateRanking: RankingDistribution[];

  lastExtractedAt: Date | null;
}
