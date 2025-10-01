import { getSheetData, parseSheetData } from "@/lib/google-sheets";
import type {
  NPSApiResponse,
  NPSComparison,
  NPSDistribution,
  NPSMetrics,
  NPSProcessedData,
} from "@/types/nps";
import { NextResponse } from "next/server";

interface RawNPSRow {
  "Lead ID": string;
  "Lead Name": string;
  "R1 NPS Atendimento": string;
  "R2 NPS Estabilidade": string;
  "": string; // Score column
  "OBS final": string;
  Telefone: string;
  ETAPA: string;
}

/**
 * Converte string de estrelas para número
 * @param starString - String contendo estrelas "⭐⭐⭐⭐⭐"
 * @returns Número de estrelas (0-5)
 */
function countStars(starString: string): number {
  if (!starString) return 0;
  const stars = (starString.match(/⭐/g) || []).length;
  return Math.min(stars, 5); // Máximo 5 estrelas
}

/**
 * Categoriza respondente baseado no score total
 */
function categorize(
  totalScore: number,
): "promoter" | "neutral" | "detractor" {
  if (totalScore >= 9) return "promoter";
  if (totalScore >= 7) return "neutral";
  return "detractor";
}

export async function GET() {
  try {
    // Buscar dados do Google Sheets
    const rawData = await getSheetData("Dados NPS (Clientes)");
    const parsedData = parseSheetData<RawNPSRow>(rawData);

    // Filtrar linhas válidas (com Lead ID)
    const validRows = parsedData.filter(
      (row) => row["Lead ID"] && row["Lead ID"].trim() !== "",
    );

    const totalSurveys = validRows.length;

    // Processar dados
    const processedData: NPSProcessedData[] = [];
    let totalR1 = 0;
    let totalR2 = 0;
    let promoters = 0;
    let neutrals = 0;
    let detractors = 0;
    let commentsCount = 0;
    let responsesCount = 0;

    validRows.forEach((row) => {
      const r1Score = countStars(row["R1 NPS Atendimento"]);
      const r2Score = countStars(row["R2 NPS Estabilidade"]);
      const totalScore = r1Score + r2Score;

      // Só conta como resposta se tiver pelo menos uma estrela
      const hasResponse = r1Score > 0 || r2Score > 0;

      if (hasResponse) {
        responsesCount++;
        totalR1 += r1Score;
        totalR2 += r2Score;

        const category = categorize(totalScore);
        const hasComment =
          !!row["OBS final"] && row["OBS final"].trim() !== "";

        if (category === "promoter") promoters++;
        else if (category === "neutral") neutrals++;
        else detractors++;

        if (hasComment) commentsCount++;

        processedData.push({
          leadId: row["Lead ID"],
          leadName: row["Lead Name"],
          r1Score,
          r2Score,
          totalScore,
          category,
          comment: hasComment ? row["OBS final"] : null,
          hasComment,
        });
      }
    });

    // Calcular métricas
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

    // Distribuição
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

    // Comparação R1 vs R2
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

    // Comentários recentes (últimos 50 com comentário)
    const recentComments = processedData
      .filter((d) => d.hasComment)
      .slice(0, 50);

    const response: NPSApiResponse = {
      metrics,
      distribution,
      comparison,
      recentComments,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching NPS data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch NPS data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
