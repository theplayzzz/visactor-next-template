import { Suspense } from "react";
import SheetsExample from "@/components/chart-blocks/charts/sheets-example";
import NPSMetrics from "@/components/nps-metrics";
import Container from "@/components/container";

export default function TestSheetsPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Dashboard NPS - Dados NPS (Clientes)
      </h1>

      <div className="mb-6">
        <Suspense
          fallback={
            <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
              Carregando métricas...
            </div>
          }
        >
          <NPSMetrics />
        </Suspense>
      </div>

      <Container className="py-4">
        <Suspense
          fallback={
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Carregando dados do Google Sheets...
            </div>
          }
        >
          <SheetsExample />
        </Suspense>
      </Container>
    </div>
  );
}
