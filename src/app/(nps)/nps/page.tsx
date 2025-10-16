import Container from "@/components/container";
import NPSMetricsCards from "@/components/chart-blocks/components/nps-metrics";
import NPSGauge from "@/components/chart-blocks/charts/nps-gauge";
import NPSComparisonChart from "@/components/chart-blocks/charts/nps-comparison";
import NPSProgressBars from "@/components/chart-blocks/components/nps-progress";
import NPSGeographic from "@/components/chart-blocks/charts/nps-geographic";
import { getSheetData, parseSheetData } from "@/lib/google-sheets";
import type {
  NPSApiResponse,
  NPSComparison,
  NPSDistribution,
  NPSMetrics,
  RegionMetric,
  NeighborhoodRanking,
} from "@/types/nps";

// Force dynamic rendering - disable all caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RawNPSRow {
  "Lead ID": string;
  "Lead Name": string;
  "R1 NPS Atendimento": string;
  "R2 NPS Estabilidade": string;
  "": string;
  "OBS final": string;
  Telefone: string;
  ETAPA: string;
  "Região": string;
  Bairro: string;
}

function countStars(starString: string): number {
  if (!starString) return 0;
  const stars = (starString.match(/⭐/g) || []).length;
  return Math.min(stars, 5);
}

function categorize(
  totalScore: number,
): "promoter" | "neutral" | "detractor" {
  if (totalScore >= 9) return "promoter";
  if (totalScore >= 7) return "neutral";
  return "detractor";
}

async function getNPSData(): Promise<NPSApiResponse> {
  const rawData = await getSheetData("Dados NPS (Clientes)");
  const parsedData = parseSheetData<RawNPSRow>(rawData);

  const validRows = parsedData.filter(
    (row) => row["Lead ID"] && row["Lead ID"].trim() !== "",
  );

  const totalSurveys = validRows.length;

  let totalR1 = 0;
  let totalR2 = 0;
  let promoters = 0;
  let neutrals = 0;
  let detractors = 0;
  let commentsCount = 0;
  let responsesCount = 0;

  // Maps para dados geográficos
  const regionMap = new Map<
    string,
    {
      totalResponses: number;
      promoters: number;
      neutrals: number;
      detractors: number;
      totalR2: number;
    }
  >();
  const neighborhoodMap = new Map<
    string,
    {
      region: string;
      totalResponses: number;
      detractors: number;
    }
  >();

  validRows.forEach((row) => {
    const r1Score = countStars(row["R1 NPS Atendimento"]);
    const r2Score = countStars(row["R2 NPS Estabilidade"]);
    const totalScore = r1Score + r2Score;

    const hasResponse = r1Score > 0 || r2Score > 0;

    if (hasResponse) {
      responsesCount++;
      totalR1 += r1Score;
      totalR2 += r2Score;

      const category = categorize(totalScore);
      const hasComment = !!row["OBS final"] && row["OBS final"].trim() !== "";

      if (category === "promoter") promoters++;
      else if (category === "neutral") neutrals++;
      else detractors++;

      if (hasComment) commentsCount++;

      // Processar dados geográficos
      const region = row["Região"]?.trim() || "Não especificado";
      const neighborhood = row.Bairro?.trim() || "Não especificado";

      // Atualizar mapa de regiões
      if (!regionMap.has(region)) {
        regionMap.set(region, {
          totalResponses: 0,
          promoters: 0,
          neutrals: 0,
          detractors: 0,
          totalR2: 0,
        });
      }
      const regionData = regionMap.get(region)!;
      regionData.totalResponses++;
      regionData.totalR2 += r2Score;
      if (category === "promoter") regionData.promoters++;
      else if (category === "neutral") regionData.neutrals++;
      else regionData.detractors++;

      // Atualizar mapa de bairros
      const neighborhoodKey = `${region}|${neighborhood}`;
      if (!neighborhoodMap.has(neighborhoodKey)) {
        neighborhoodMap.set(neighborhoodKey, {
          region,
          totalResponses: 0,
          detractors: 0,
        });
      }
      const neighborhoodData = neighborhoodMap.get(neighborhoodKey)!;
      neighborhoodData.totalResponses++;
      if (category === "detractor") neighborhoodData.detractors++;
    }
  });

  const responseRate =
    totalSurveys > 0 ? (responsesCount / totalSurveys) * 100 : 0;
  const promotersPercentage =
    responsesCount > 0 ? (promoters / responsesCount) * 100 : 0;
  const neutralsPercentage =
    responsesCount > 0 ? (neutrals / responsesCount) * 100 : 0;
  const detractorsPercentage =
    responsesCount > 0 ? (detractors / responsesCount) * 100 : 0;
  const scoreNPS = Math.round(promotersPercentage - detractorsPercentage);
  const r1Average = responsesCount > 0 ? totalR1 / responsesCount : 0;
  const r2Average = responsesCount > 0 ? totalR2 / responsesCount : 0;

  const metrics: NPSMetrics = {
    scoreNPS,
    totalSurveys,
    totalResponses: responsesCount,
    responseRate: Math.round(responseRate * 10) / 10,
    promoters,
    neutrals,
    detractors,
    promotersPercentage: Math.round(promotersPercentage * 10) / 10,
    neutralsPercentage: Math.round(neutralsPercentage * 10) / 10,
    detractorsPercentage: Math.round(detractorsPercentage * 10) / 10,
    r1Average: Math.round(r1Average * 100) / 100,
    r2Average: Math.round(r2Average * 100) / 100,
    commentsCount,
  };

  const distribution: NPSDistribution[] = [
    {
      type: "Promotores (9-10)",
      value: promoters,
      percentage: Math.round(promotersPercentage * 10) / 10,
    },
    {
      type: "Neutros (7-8)",
      value: neutrals,
      percentage: Math.round(neutralsPercentage * 10) / 10,
    },
    {
      type: "Detratores (0-6)",
      value: detractors,
      percentage: Math.round(detractorsPercentage * 10) / 10,
    },
  ];

  const comparison: NPSComparison[] = [
    {
      dimension: "Atendimento (R1)",
      average: Math.round(r1Average * 100) / 100,
      total: totalR1,
    },
    {
      dimension: "Estabilidade (R2)",
      average: Math.round(r2Average * 100) / 100,
      total: totalR2,
    },
  ];

  // Construir métricas por região
  const byRegion: RegionMetric[] = Array.from(regionMap.entries())
    .map(([region, data]) => ({
      region,
      totalResponses: data.totalResponses,
      detractors: data.detractors,
      detractorsPercentage:
        data.totalResponses > 0
          ? Math.round((data.detractors / data.totalResponses) * 1000) / 10
          : 0,
      promoters: data.promoters,
      promotersPercentage:
        data.totalResponses > 0
          ? Math.round((data.promoters / data.totalResponses) * 1000) / 10
          : 0,
      avgStability:
        data.totalResponses > 0
          ? Math.round((data.totalR2 / data.totalResponses) * 100) / 100
          : 0,
    }))
    .sort((a, b) => {
      // Ordenação consistente: primeiro por % detratores, depois por nome da região
      if (b.detractorsPercentage !== a.detractorsPercentage) {
        return b.detractorsPercentage - a.detractorsPercentage;
      }
      return a.region.localeCompare(b.region);
    });

  // Construir ranking de bairros (top 10 com maior % de detratores)
  const byNeighborhood: NeighborhoodRanking[] = Array.from(
    neighborhoodMap.entries(),
  )
    .map(([key, data]) => {
      const [, neighborhood] = key.split("|");
      return {
        neighborhood,
        region: data.region,
        detractors: data.detractors,
        totalResponses: data.totalResponses,
        detractorsPercentage:
          data.totalResponses > 0
            ? Math.round((data.detractors / data.totalResponses) * 1000) / 10
            : 0,
      };
    })
    .filter((n) => n.totalResponses >= 3) // Mínimo de 3 respostas
    .sort((a, b) => {
      // Ordenação consistente: primeiro por %, depois por bairro, depois por região
      if (b.detractorsPercentage !== a.detractorsPercentage) {
        return b.detractorsPercentage - a.detractorsPercentage;
      }
      if (a.neighborhood !== b.neighborhood) {
        return a.neighborhood.localeCompare(b.neighborhood);
      }
      return a.region.localeCompare(b.region);
    })
    .slice(0, 10);

  return {
    metrics,
    distribution,
    comparison,
    geographicData: {
      byRegion,
      byNeighborhood,
    },
  };
}

export default async function NPSPage() {
  const data = await getNPSData();

  return (
    <>
      <NPSMetricsCards metrics={data.metrics} />

      <Container>
        <div className="flex flex-col gap-6 py-6">
          {/* Gráficos principais */}
          <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
            <NPSGauge
              distribution={data.distribution}
              scoreNPS={data.metrics.scoreNPS}
            />
            <NPSComparisonChart comparison={data.comparison} />
          </div>

          {/* Progress bars */}
          <NPSProgressBars distribution={data.distribution} />

          {/* Métricas Geográficas */}
          <NPSGeographic
            byRegion={data.geographicData.byRegion}
            byNeighborhood={data.geographicData.byNeighborhood}
          />
        </div>
      </Container>
    </>
  );
}
