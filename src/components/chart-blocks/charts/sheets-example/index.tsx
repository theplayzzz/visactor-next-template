import ChartTitle from "@/components/chart-blocks/components/chart-title";
import Chart from "./chart";
import { getNPSByCategory } from "@/app/actions/sheets-actions";

export default async function SheetsExample() {
  const data = await getNPSByCategory();

  return (
    <div>
      <ChartTitle title="Dados NPS - Categorias (Google Sheets)" />
      <Chart data={data} />
    </div>
  );
}
