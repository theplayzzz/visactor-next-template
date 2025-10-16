"use server";

import { getSheetData, parseSheetData } from "@/lib/google-sheets";

export interface NPSData {
  "Lead ID": string;
  "Lead Name": string;
  "R1 NPS Atendimento": string;
  "R2 NPS Estabilidade": string;
  "": string; // NPS Score column (empty header)
  "OBS final": string;
  "Telefone": string;
  "ETAPA": string;
  [key: string]: string; // For other dynamic columns
}

export interface TicketByChannelData {
  type: string;
  value: number;
}

/**
 * Get NPS data from Google Sheets
 */
export async function getNPSData(): Promise<NPSData[]> {
  try {
    const rawData = await getSheetData("Dados NPS (Clientes)");
    const parsed = parseSheetData<NPSData>(rawData);
    // Filter out empty rows - check for Lead ID instead
    return parsed.filter((row) => row["Lead ID"] && row["Lead ID"].trim() !== "");
  } catch {
    return [];
  }
}

/**
 * Transform NPS data to categorized format (Promoters, Passives, Detractors)
 */
export async function getNPSByCategory(): Promise<TicketByChannelData[]> {
  try {
    const data = await getNPSData();

    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    data.forEach((row) => {
      // The NPS score is in the empty column ""
      const scoreStr = row[""] || "0";
      const score = parseInt(scoreStr);

      if (!isNaN(score)) {
        if (score >= 9) {
          promoters++;
        } else if (score >= 7) {
          passives++;
        } else {
          detractors++;
        }
      }
    });

    return [
      { type: "Promotores (9-10)", value: promoters },
      { type: "Neutros (7-8)", value: passives },
      { type: "Detratores (0-6)", value: detractors },
    ];
  } catch {
    return [];
  }
}

/**
 * Get NPS metrics from Google Sheets data
 */
export async function getNPSMetrics() {
  try {
    const data = await getNPSData();
    const categories = await getNPSByCategory();

    const totalRespostas = data.length;
    const promoters =
      categories.find((c) => c.type.includes("Promotores"))?.value || 0;
    const detractors =
      categories.find((c) => c.type.includes("Detratores"))?.value || 0;

    // Calculate NPS Score: (% Promoters - % Detractors)
    const npsScore =
      totalRespostas > 0
        ? Math.round(
            ((promoters - detractors) / totalRespostas) * 100,
          )
        : 0;

    return [
      {
        title: "NPS Score",
        value: npsScore.toString(),
        change: 0,
      },
      {
        title: "Total Respostas",
        value: totalRespostas.toLocaleString("pt-BR"),
        change: 0,
      },
      {
        title: "Promotores",
        value: promoters.toLocaleString("pt-BR"),
        change: 0,
      },
      {
        title: "Detratores",
        value: detractors.toLocaleString("pt-BR"),
        change: 0,
      },
    ];
  } catch {
    return [];
  }
}
