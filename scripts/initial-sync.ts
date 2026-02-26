import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../src/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
const KOMMO_DOMAIN = process.env.URL_KOMMO;
const KOMMO_TOKEN = process.env.SECRET_KEY_KOMMO;
const PIPELINE_ID = 8480507;
const LEADS_PER_PAGE = 250;

if (!DATABASE_URL || !KOMMO_DOMAIN || !KOMMO_TOKEN) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing env vars: DATABASE_URL, URL_KOMMO, SECRET_KEY_KOMMO",
  );
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
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
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

async function syncUsersAndStatuses() {
  // eslint-disable-next-line no-console
  console.log("Syncing users...");
  const usersData = await kommoFetch<{
    _embedded: {
      users: Array<{ id: number; name: string; email: string }>;
    };
  }>("/users");

  if (usersData) {
    for (const user of usersData._embedded.users) {
      await db
        .insert(schema.kommoUsers)
        .values({ id: user.id, name: user.name, email: user.email })
        .onConflictDoUpdate({
          target: schema.kommoUsers.id,
          set: { name: user.name, email: user.email },
        });
    }
    // eslint-disable-next-line no-console
    console.log(`  ${usersData._embedded.users.length} users synced`);
  }

  // eslint-disable-next-line no-console
  console.log("Syncing pipeline statuses...");
  const pipelineData = await kommoFetch<{
    _embedded: {
      statuses: Array<{
        id: number;
        name: string;
        sort: number;
        color: string;
        pipeline_id: number;
      }>;
    };
  }>(`/leads/pipelines/${PIPELINE_ID}`);

  if (pipelineData) {
    for (const status of pipelineData._embedded.statuses) {
      await db
        .insert(schema.kommoPipelineStatuses)
        .values({
          id: status.id,
          pipelineId: status.pipeline_id,
          name: status.name,
          sortOrder: status.sort,
          color: status.color,
        })
        .onConflictDoUpdate({
          target: schema.kommoPipelineStatuses.id,
          set: {
            name: status.name,
            sortOrder: status.sort,
            color: status.color,
          },
        });
    }
    // eslint-disable-next-line no-console
    console.log(
      `  ${pipelineData._embedded.statuses.length} statuses synced`,
    );
  }
}

async function syncAllLeads() {
  let page = 1;
  let totalLeads = 0;
  let hasNext = true;

  // eslint-disable-next-line no-console
  console.log("Starting full leads sync...");

  while (hasNext) {
    const data = await kommoFetch<{
      _embedded: {
        leads: Array<{
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
          _embedded: {
            tags: Array<{ id: number; name: string }>;
          };
        }>;
      };
      _links: { next?: { href: string } };
    }>("/leads", {
      page: page.toString(),
      limit: LEADS_PER_PAGE.toString(),
      "filter[pipeline_id]": PIPELINE_ID.toString(),
      with: "contacts",
    });

    if (!data) break;

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

  // Update sync state
  await db
    .insert(schema.syncState)
    .values({
      id: "kommo_leads_full",
      dataSource: "kommo",
      lastSyncAt: new Date(),
      lastPage: 0,
      isRunning: false,
    })
    .onConflictDoUpdate({
      target: schema.syncState.id,
      set: { lastSyncAt: new Date(), lastPage: 0, isRunning: false },
    });

  await db
    .insert(schema.syncState)
    .values({
      id: "kommo_leads_incremental",
      dataSource: "kommo",
      lastSyncAt: new Date(),
      lastPage: 0,
      isRunning: false,
    })
    .onConflictDoUpdate({
      target: schema.syncState.id,
      set: { lastSyncAt: new Date(), lastPage: 0, isRunning: false },
    });

  // eslint-disable-next-line no-console
  console.log(`\nDone! Total leads synced: ${totalLeads}`);
}

async function main() {
  await syncUsersAndStatuses();
  await syncAllLeads();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal error:", err);
  process.exit(1);
});
