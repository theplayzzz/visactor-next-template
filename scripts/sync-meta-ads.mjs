import { neon } from "@neondatabase/serverless";

const accountId = process.env.META_AD_ACCOUNT_ID?.replace(/^act_/, "");
const accessToken = process.env.META_ADS_GRAPH_ACCESS_TOKEN;
const graphVersion = process.env.META_ADS_GRAPH_API_VERSION ?? "v25.0";
const databaseUrl = process.env.DATABASE_URL;
const dryRun = process.argv.includes("--dry-run");

if (!accountId || !accessToken || !databaseUrl) {
  throw new Error("DATABASE_URL, META_AD_ACCOUNT_ID e META_ADS_GRAPH_ACCESS_TOKEN são obrigatórios");
}
if (!/^\d+$/.test(accountId) || !/^v\d+\.\d+$/.test(graphVersion)) {
  throw new Error("META_AD_ACCOUNT_ID ou META_ADS_GRAPH_API_VERSION inválido");
}

const sql = neon(databaseUrl);
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const today = dateFormatter.format(new Date());
const shiftDate = (date, days) => {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};
const option = (name) => process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const since = option("--since") ?? shiftDate(today, -28);
const until = option("--until") ?? shiftDate(today, -1);
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
if (!validDate(since) || !validDate(until) || since > until) {
  throw new Error("Intervalo inválido. Use --since=AAAA-MM-DD --until=AAAA-MM-DD");
}

const fields = [
  "account_id", "account_name", "campaign_id", "campaign_name",
  "adset_id", "adset_name", "ad_id", "ad_name", "date_start",
  "date_stop", "spend", "clicks", "impressions", "reach", "frequency",
  "cpc", "cpm", "ctr", "actions", "inline_link_clicks",
  "inline_post_engagement", "quality_ranking", "conversion_rate_ranking",
  "engagement_rate_ranking",
].join(",");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function graphGet(url) {
  const parsed = new URL(url);
  if (parsed.origin !== "https://graph.facebook.com" || parsed.searchParams.has("access_token")) {
    throw new Error("URL de paginação inválida recebida da Meta");
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(parsed, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(90_000),
    });
    if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 3) {
      await sleep(2_000 * 2 ** attempt);
      continue;
    }
    const body = await response.json();
    if (!response.ok) {
      throw new Error(`Meta Graph HTTP ${response.status}: ${body.error?.message ?? "falha desconhecida"}`);
    }
    return body;
  }
  throw new Error("Meta Graph indisponível após novas tentativas");
}

async function fetchChunk(from, to) {
  const url = new URL(`https://graph.facebook.com/${graphVersion}/act_${accountId}/insights`);
  url.searchParams.set("level", "ad");
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("time_range", JSON.stringify({ since: from, until: to }));
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", "500");
  const rows = [];
  let next = url.toString();
  while (next) {
    const page = await graphGet(next);
    rows.push(...(page.data ?? []));
    next = page.paging?.next ?? null;
  }
  return rows;
}

const numberOrNull = (value) => value == null ? null : Number(value);
async function upsertInsight(row) {
  if (!row.ad_id || !row.date_start || row.account_id !== accountId) {
    throw new Error("Insight sem anúncio, data ou conta esperada");
  }
  const rawId = `meta-graph:${accountId}:${row.ad_id}:${row.date_start}`;
  const meta = JSON.stringify({ source: "meta_graph", version: graphVersion });
  const actions = JSON.stringify(row.actions ?? []);
  await sql`
    INSERT INTO ads_insights (
      _airbyte_raw_id, _airbyte_extracted_at, _airbyte_meta, _airbyte_generation_id,
      account_id, account_name, campaign_id, campaign_name, adset_id, adset_name,
      ad_id, ad_name, date_start, date_stop, spend, clicks, impressions, reach,
      frequency, cpc, cpm, ctr, actions, inline_link_clicks, inline_post_engagement,
      quality_ranking, conversion_rate_ranking, engagement_rate_ranking
    ) VALUES (
      ${rawId}, now(), ${meta}::jsonb, 0,
      ${row.account_id}, ${row.account_name ?? null}, ${row.campaign_id ?? null},
      ${row.campaign_name ?? null}, ${row.adset_id ?? null}, ${row.adset_name ?? null},
      ${row.ad_id}, ${row.ad_name ?? null}, ${row.date_start}, ${row.date_stop},
      ${numberOrNull(row.spend)}, ${numberOrNull(row.clicks)},
      ${numberOrNull(row.impressions)}, ${numberOrNull(row.reach)},
      ${numberOrNull(row.frequency)}, ${numberOrNull(row.cpc)},
      ${numberOrNull(row.cpm)}, ${numberOrNull(row.ctr)}, ${actions}::jsonb,
      ${numberOrNull(row.inline_link_clicks)}, ${numberOrNull(row.inline_post_engagement)},
      ${row.quality_ranking ?? null}, ${row.conversion_rate_ranking ?? null},
      ${row.engagement_rate_ranking ?? null}
    ) ON CONFLICT (_airbyte_raw_id) DO UPDATE SET
      _airbyte_extracted_at = excluded._airbyte_extracted_at,
      _airbyte_meta = excluded._airbyte_meta,
      account_name = excluded.account_name,
      campaign_name = excluded.campaign_name,
      adset_name = excluded.adset_name,
      ad_name = excluded.ad_name,
      spend = excluded.spend,
      clicks = excluded.clicks,
      impressions = excluded.impressions,
      reach = excluded.reach,
      frequency = excluded.frequency,
      cpc = excluded.cpc,
      cpm = excluded.cpm,
      ctr = excluded.ctr,
      actions = excluded.actions,
      inline_link_clicks = excluded.inline_link_clicks,
      inline_post_engagement = excluded.inline_post_engagement,
      quality_ranking = excluded.quality_ranking,
      conversion_rate_ranking = excluded.conversion_rate_ranking,
      engagement_rate_ranking = excluded.engagement_rate_ranking
  `;
}

let logId;
let processed = 0;
try {
  if (!dryRun) {
    const [log] = await sql`
      INSERT INTO sync_logs (data_source, sync_type, status)
      VALUES ('meta_ads', 'graph_insights_daily', 'running') RETURNING id
    `;
    logId = log.id;
  }
  for (let from = since; from <= until;) {
    const to = shiftDate(from, 13) < until ? shiftDate(from, 13) : until;
    const rows = await fetchChunk(from, to);
    if (!dryRun) {
      for (const row of rows) await upsertInsight(row);
    }
    processed += rows.length;
    console.log(JSON.stringify({ from, to, rows: rows.length, spend: rows.reduce((sum, row) => sum + Number(row.spend ?? 0), 0).toFixed(2), dryRun }));
    from = shiftDate(to, 1);
  }
  if (!dryRun) {
    await sql`
      INSERT INTO sync_state (id, data_source, last_sync_at, is_running, metadata)
      VALUES ('meta_graph_insights', 'meta_ads', now(), false, ${JSON.stringify({ until, processed })}::jsonb)
      ON CONFLICT (id) DO UPDATE SET last_sync_at = now(), is_running = false,
        metadata = excluded.metadata
    `;
    await sql`
      UPDATE sync_logs SET status = 'completed', completed_at = now(),
        duration_ms = extract(epoch FROM (now() - started_at))::int * 1000,
        records_processed = ${processed}, records_updated = ${processed}
      WHERE id = ${logId}
    `;
  }
  console.log(JSON.stringify({ status: "completed", since, until, processed, dryRun }));
} catch (error) {
  if (logId) {
    await sql`
      UPDATE sync_logs SET status = 'failed', completed_at = now(),
        error_message = ${error instanceof Error ? error.message : String(error)},
        records_processed = ${processed}
      WHERE id = ${logId}
    `;
  }
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
