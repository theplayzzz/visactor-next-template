import NPSCommentsTable from "@/components/chart-blocks/components/nps-comments-table";
import { getSheetData, parseSheetData } from "@/lib/google-sheets";
import type { NPSProcessedData } from "@/types/nps";

interface RawNPSRow {
  "Lead ID": string;
  "Lead Name": string;
  "R1 NPS Atendimento": string;
  "R2 NPS Estabilidade": string;
  "": string;
  "OBS final": string;
  Telefone: string;
  ETAPA: string;
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

async function getCommentsData(): Promise<NPSProcessedData[]> {
  const rawData = await getSheetData("Dados NPS (Clientes)");
  const parsedData = parseSheetData<RawNPSRow>(rawData);

  const validRows = parsedData.filter(
    (row) => row["Lead ID"] && row["Lead ID"].trim() !== "",
  );

  const processedData: NPSProcessedData[] = [];

  validRows.forEach((row) => {
    const r1Score = countStars(row["R1 NPS Atendimento"]);
    const r2Score = countStars(row["R2 NPS Estabilidade"]);
    const totalScore = r1Score + r2Score;

    const hasResponse = r1Score > 0 || r2Score > 0;

    if (hasResponse) {
      const category = categorize(totalScore);
      const hasComment = !!row["OBS final"] && row["OBS final"].trim() !== "";

      if (hasComment) {
        processedData.push({
          leadId: row["Lead ID"],
          leadName: row["Lead Name"],
          r1Score,
          r2Score,
          totalScore,
          category,
          comment: row["OBS final"],
          hasComment,
        });
      }
    }
  });

  return processedData.slice(0, 50);
}

export default async function TicketPage() {
  const comments = await getCommentsData();

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Observações Finais</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comentários e feedbacks dos clientes
        </p>
      </div>
      <NPSCommentsTable comments={comments} />
    </div>
  );
}
