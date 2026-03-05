/**
 * Recovery script: syncs all leads updated since the last successful sync.
 * Runs without the wall-clock limit used in the Vercel route.
 * Usage: npx tsx scripts/recover-sync.ts
 */
import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../src/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
const KOMMO_DOMAIN = process.env.URL_KOMMO;
const KOMMO_TOKEN = process.env.SECRET_KEY_KOMMO;
const PIPELINE_ID = 8480507;
const LEADS_PER_PAGE = 250;

if (!DATABASE_URL || !KOMMO_DOMAIN || !KOMMO_TOKEN) {
  // eslint-disable-next-line no-console
  console.error("Missing env vars: DATABASE_URL, URL_KOMMO, SECRET_KEY_KOMMO");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function kommoFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T | null> {
  const url = new URL(`https://${KOMMO_DOMAIN}/api/v4${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${KOMMO_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kommo ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

function timestampToDate(ts: number | null): Date | null {
  if (!ts) return null;
  return new Date(ts * 1000);
}

type KommoLead = {
  id: number;
  name: string;
  price: number;
  status_id: number;
  pipeline_id: number;
  responsible_user_id: number;
  loss_reason_id: number | null;
  created_at: number;
  updated_at: number;
  closed_at: number | null;
  custom_fields_values: Array<{
    field_name: string;
    values: Array<{ value: unknown }>;
  }> | null;
  _embedded: { tags: Array<{ id: number; name: string }> };
};

async function getLastSyncAt(): Promise<Date> {
  const raw = await sql`
    SELECT last_sync_at FROM sync_state WHERE id = 'kommo_leads_incremental' LIMIT 1
  `;
  if (raw.length > 0 && raw[0].last_sync_at) {
    return new Date(raw[0].last_sync_at as string);
  }
  // Fallback: 30 days ago
  const fallback = new Date();
  fallback.setDate(fallback.getDate() - 30);
  return fallback;
}

async function syncIncremental() {
  const lastSync = await getLastSyncAt();
  const updatedAfterTs = Math.floor(lastSync.getTime() / 1000);

  // eslint-disable-next-line no-console
  console.log(`\nRecovery incremental sync`);
  // eslint-disable-next-line no-console
  console.log(`Last sync: ${lastSync.toISOString()}`);
  // eslint-disable-next-line no-console
  console.log(`Fetching leads updated after: ${new Date(updatedAfterTs * 1000).toISOString()}\n`);

  let page = 1;
  let totalLeads = 0;
  let hasNext = true;
  let apiCalls = 0;

  while (hasNext) {
    const data = await kommoFetch<{
      _embedded: { leads: KommoLead[] };
      _links: { next?: { href: string } };
    }>("/leads", {
      page: page.toString(),
      limit: LEADS_PER_PAGE.toString(),
      "filter[pipeline_id]": PIPELINE_ID.toString(),
      "filter[updated_at][from]": updatedAfterTs.toString(),
      with: "contacts",
    });
    apiCalls++;

    if (!data || data._embedded.leads.length === 0) break;

    const leads = data._embedded.leads;
    hasNext = !!data._links.next;

    // Upsert tags
    const tagMap = new Map<number, string>();
    for (const lead of leads) {
      for (const tag of lead._embedded.tags) {
        tagMap.set(tag.id, tag.name);
      }
    }
    for (const [id, name] of tagMap) {
      await db
        .insert(schema.kommoTags)
        .values({ id, name })
        .onConflictDoUpdate({ target: schema.kommoTags.id, set: { name } });
    }

    // Upsert leads
    for (const lead of leads) {
      const tagIds = lead._embedded.tags.map((t) => t.id);
      const customFields: Record<string, unknown> = {};
      if (lead.custom_fields_values) {
        for (const field of lead.custom_fields_values) {
          customFields[field.field_name] = field.values;
        }
      }

      const values = {
        id: lead.id,
        name: lead.name,
        price: lead.price,
        statusId: lead.status_id,
        pipelineId: lead.pipeline_id,
        responsibleUserId: lead.responsible_user_id,
        lossReasonId: lead.loss_reason_id,
        kommoCreatedAt: timestampToDate(lead.created_at),
        kommoUpdatedAt: timestampToDate(lead.updated_at),
        kommoClosedAt: timestampToDate(lead.closed_at),
        tagIds,
        customFields,
        rawData: lead as unknown as Record<string, unknown>,
      };

      await db
        .insert(schema.kommoLeads)
        .values(values)
        .onConflictDoUpdate({
          target: schema.kommoLeads.id,
          set: {
            name: values.name,
            price: values.price,
            statusId: values.statusId,
            pipelineId: values.pipelineId,
            responsibleUserId: values.responsibleUserId,
            lossReasonId: values.lossReasonId,
            kommoCreatedAt: values.kommoCreatedAt,
            kommoUpdatedAt: values.kommoUpdatedAt,
            kommoClosedAt: values.kommoClosedAt,
            tagIds: values.tagIds,
            customFields: values.customFields,
            rawData: values.rawData,
          },
        });
    }

    totalLeads += leads.length;
    // eslint-disable-next-line no-console
    console.log(`  Page ${page}: ${leads.length} leads (total: ${totalLeads})`);
    page++;
  }

  // Update sync_state
  const now = new Date();
  await sql`
    UPDATE sync_state
    SET last_sync_at = ${now.toISOString()},
        last_page    = 0,
        is_running   = false,
        metadata     = NULL
    WHERE id IN ('kommo_leads_incremental', 'kommo_leads_full')
  `;

  // eslint-disable-next-line no-console
  console.log(`\n✓ Done. ${totalLeads} leads synced in ${apiCalls} API calls.`);
  // eslint-disable-next-line no-console
  console.log(`  sync_state updated to ${now.toISOString()}`);
}

syncIncremental().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal:", err);
  process.exit(1);
});
