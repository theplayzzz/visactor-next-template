export interface NPSRawData {
  leadId: string;
  leadName: string;
  r1Stars: string; // "⭐⭐⭐⭐⭐"
  r2Stars: string; // "⭐⭐⭐⭐⭐"
  comment: string | null;
  phone: string;
}

export interface NPSProcessedData {
  leadId: string;
  leadName: string;
  r1Score: number; // 0-5
  r2Score: number; // 0-5
  totalScore: number; // 0-10
  category: "promoter" | "neutral" | "detractor";
  comment: string | null;
  hasComment: boolean;
}

export interface NPSMetrics {
  scoreNPS: number; // -100 a +100
  totalSurveys: number; // Total de linhas na planilha
  totalResponses: number; // Linhas com estrelas
  responseRate: number; // % respondentes
  promoters: number;
  neutrals: number;
  detractors: number;
  promotersPercentage: number;
  neutralsPercentage: number;
  detractorsPercentage: number;
  r1Average: number; // Média R1
  r2Average: number; // Média R2
  commentsCount: number;
}

export interface NPSDistribution {
  type: string;
  value: number;
  percentage: number;
}

export interface NPSComparison {
  dimension: string;
  average: number;
  total: number;
}

export interface NPSGeographicData {
  region: string;
  neighborhood: string;
  totalResponses: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  detractorsPercentage: number;
  promotersPercentage: number;
  avgStability: number; // Average R2 score
}

export interface RegionMetric {
  region: string;
  totalResponses: number;
  detractors: number;
  detractorsPercentage: number;
  promoters: number;
  promotersPercentage: number;
  avgStability: number;
}

export interface NeighborhoodRanking {
  neighborhood: string;
  region: string;
  detractors: number;
  totalResponses: number;
  detractorsPercentage: number;
}

export interface NPSApiResponse {
  metrics: NPSMetrics;
  distribution: NPSDistribution[];
  comparison: NPSComparison[];
  geographicData: {
    byRegion: RegionMetric[];
    byNeighborhood: NeighborhoodRanking[];
  };
}
