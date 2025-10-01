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

export interface NPSApiResponse {
  metrics: NPSMetrics;
  distribution: NPSDistribution[];
  comparison: NPSComparison[];
  recentComments: NPSProcessedData[];
}
