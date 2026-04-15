import { format, parseISO, subDays } from "date-fns";

import { CampanhasView } from "@/components/campanhas/campanhas-view";
import { CampanhasDatePicker } from "@/components/campanhas/date-range-picker";
import { PlatformTabs } from "@/components/campanhas/platform-tabs";
import {
  getGoogleAdsCampanhasMetrics,
  getGoogleAdsMinDate,
} from "@/lib/google-ads-queries";
import {
  getCampanhasMetrics,
  getMinInsightsDate,
} from "@/lib/meta-ads-queries";
import { type CampanhasMetrics, type Platform } from "@/types/campanhas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CampanhasPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; platform?: string }>;
}) {
  const params = await searchParams;
  const platform: Platform =
    params.platform === "google" ? "google" : "meta";

  const now = new Date();
  const defaultFrom = format(subDays(now, 29), "yyyy-MM-dd");
  const defaultTo = format(now, "yyyy-MM-dd");

  const startDate = params.from ?? defaultFrom;
  const endDate = params.to ?? defaultTo;

  const getMetrics =
    platform === "google" ? getGoogleAdsCampanhasMetrics : getCampanhasMetrics;
  const getMinDate =
    platform === "google" ? getGoogleAdsMinDate : getMinInsightsDate;

  let data: CampanhasMetrics | null = null;
  let error: string | null = null;
  let minDate = defaultFrom;

  try {
    [data, minDate] = await Promise.all([
      getMetrics(startDate, endDate),
      getMinDate(),
    ]);
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Erro desconhecido ao carregar dados";
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl px-6 tablet:px-10">
        <div className="border-b border-border py-4">
          <PlatformTabs current={platform} from={startDate} to={endDate} />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
              Erro ao carregar dados de campanhas
            </h2>
            <p className="text-sm text-red-600 dark:text-red-300">
              {platform === "google"
                ? "Não foi possível conectar ao BigQuery. Verifique se as variáveis GOOGLE_BIGQUERY_* estão configuradas."
                : "Não foi possível conectar ao banco de dados. Verifique se a variável DATABASE_URL está configurada corretamente."}
            </p>
            <p className="mt-3 text-xs text-red-500 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fromDisplay = format(parseISO(startDate), "yyyy-MM-dd");
  const toDisplay = format(parseISO(endDate), "yyyy-MM-dd");

  return (
    <div className="mx-auto max-w-5xl px-6 tablet:px-10">
      <div className="flex flex-col gap-3 border-b border-border py-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <PlatformTabs current={platform} from={startDate} to={endDate} />
        <CampanhasDatePicker
          from={fromDisplay}
          to={toDisplay}
          minDate={minDate}
          platform={platform}
        />
      </div>
      <CampanhasView data={data} platform={platform} />
    </div>
  );
}
