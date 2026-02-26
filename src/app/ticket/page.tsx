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

      // Incluir TODOS os comentários não vazios, independente da categoria
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

  // Retornar TODOS os comentários, sem limite
  return processedData;
}

export default async function TicketPage() {
  let comments: NPSProcessedData[] = [];
  let error: string | null = null;

  try {
    comments = await getCommentsData();
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Erro desconhecido ao carregar dados";
  }

  return (
    <div className="py-3 md:py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Observações Finais</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comentários e feedbacks dos clientes
        </p>
      </div>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
            Erro ao carregar dados
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300">
            Não foi possível conectar ao Google Sheets. Verifique as
            credenciais no arquivo{" "}
            <code className="rounded bg-red-100 px-1 dark:bg-red-900">
              .env
            </code>
            .
          </p>
          <p className="mt-3 text-xs text-red-500 dark:text-red-400">
            {error}
          </p>
        </div>
      ) : (
        <NPSCommentsTable comments={comments} />
      )}
    </div>
  );
}
