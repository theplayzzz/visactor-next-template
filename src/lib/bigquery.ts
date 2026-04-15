import "server-only";

import fs from "fs";
import path from "path";

import { BigQuery } from "@google-cloud/bigquery";

const BQ_LOCATION = "southamerica-east1";

const LOCAL_KEY_CANDIDATES = [
  "gen-lang-client-0312769039-b4d415759df4.json",
  "gen-lang-client-0312769039-56ab241402e5.json",
];

let _client: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
  if (_client) return _client;

  const projectId = process.env.GOOGLE_BIGQUERY_PROJECT_ID;

  const localKey = LOCAL_KEY_CANDIDATES
    .map((f) => path.join(process.cwd(), f))
    .find((p) => fs.existsSync(p));

  if (localKey) {
    _client = new BigQuery({ projectId, keyFilename: localKey });
  } else {
    _client = new BigQuery({
      projectId,
      credentials: {
        client_email: process.env.GOOGLE_BIGQUERY_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_BIGQUERY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n",
        ),
      },
    });
  }

  return _client;
}

export async function runBigQuery<T = Record<string, unknown>>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T[]> {
  const [rows] = await getBigQueryClient().query({
    query,
    params,
    location: BQ_LOCATION,
  });
  return rows as T[];
}

export function getGoogleAdsTable(base: string): string {
  const project = process.env.GOOGLE_BIGQUERY_PROJECT_ID;
  const dataset = process.env.GOOGLE_ADS_BIGQUERY_DATASET ?? "google_ads_data";
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  return `\`${project}.${dataset}.p_ads_${base}_${customerId}\``;
}
