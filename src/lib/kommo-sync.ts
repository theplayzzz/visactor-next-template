import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  kommoLeadEvents,
  kommoLeads,
  kommoPipelineStatuses,
  kommoTags,
  kommoUsers,
  syncState,
} from "@/db/schema";
import {
  type KommoLead,
  fetchEventsPage,
  fetchLeadsPage,
  fetchPipelineStatuses,
  fetchTags,
  fetchUsers,
} from "@/lib/kommo";
import { SyncLogger } from "@/lib/sync-logger";

const WALL_CLOCK_LIMIT_MS = 8000;
const STATE_KEY_LEADS_FULL = "kommo_leads_full";
const STATE_KEY_LEADS_INCREMENTAL = "kommo_leads_incremental";
const STATE_KEY_EVENTS = "kommo_events";

function timestampToDate(ts: number | null): Date | null {
  if (!ts) return null;
  return new Date(ts * 1000);
}

function upsertLeadValues(lead: KommoLead) {
  const tagIds = lead._embedded.tags.map((t) => t.id);
  const customFields: Record<string, unknown> = {};
  if (lead.custom_fields_values) {
    for (const field of lead.custom_fields_values) {
      customFields[field.field_name] = field.values;
    }
  }

  return {
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
}

async function getOrCreateSyncState(key: string) {
  const existing = await db
    .select()
    .from(syncState)
    .where(eq(syncState.id, key))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(syncState)
    .values({
      id: key,
      dataSource: "kommo",
      lastPage: 0,
      isRunning: false,
    })
    .returning();

  return created;
}

async function upsertTagsFromLeads(leads: KommoLead[]): Promise<void> {
  const tagMap = new Map<number, string>();
  for (const lead of leads) {
    for (const tag of lead._embedded.tags) {
      tagMap.set(tag.id, tag.name);
    }
  }

  for (const [id, name] of tagMap) {
    await db
      .insert(kommoTags)
      .values({ id, name })
      .onConflictDoUpdate({
        target: kommoTags.id,
        set: { name },
      });
  }
}

export async function syncLeads(
  mode: "full" | "incremental",
): Promise<{
  completed: boolean;
  pagesProcessed: number;
  recordsProcessed: number;
}> {
  const stateKey =
    mode === "full" ? STATE_KEY_LEADS_FULL : STATE_KEY_LEADS_INCREMENTAL;
  const logger = new SyncLogger("kommo", `leads_${mode}`);
  await logger.start();

  try {
    const state = await getOrCreateSyncState(stateKey);

    if (state.isRunning) {
      await logger.fail(new Error("Sync already running"));
      return { completed: false, pagesProcessed: 0, recordsProcessed: 0 };
    }

    await db
      .update(syncState)
      .set({ isRunning: true })
      .where(eq(syncState.id, stateKey));

    const startPage = mode === "full" ? (state.lastPage ?? 0) + 1 : 1;
    const updatedAfter =
      mode === "incremental" && state.lastSyncAt
        ? Math.floor(state.lastSyncAt.getTime() / 1000)
        : undefined;

    const startTime = Date.now();
    let page = startPage;
    let pagesProcessed = 0;
    let totalRecords = 0;
    let hasNext = true;

    while (hasNext) {
      if (Date.now() - startTime > WALL_CLOCK_LIMIT_MS) {
        logger.setLastPage(page - 1);
        await db
          .update(syncState)
          .set({
            lastPage: page - 1,
            isRunning: false,
          })
          .where(eq(syncState.id, stateKey));

        await logger.partial({
          mode,
          stoppedAt: "wall_clock_limit",
          nextPage: page,
        });
        return {
          completed: false,
          pagesProcessed,
          recordsProcessed: totalRecords,
        };
      }

      const { leads, hasNext: more } = await fetchLeadsPage(
        page,
        updatedAfter,
      );
      logger.incrementApiCalls();
      hasNext = more;

      if (leads.length === 0) break;

      await upsertTagsFromLeads(leads);

      for (const lead of leads) {
        const values = upsertLeadValues(lead);
        await db
          .insert(kommoLeads)
          .values(values)
          .onConflictDoUpdate({
            target: kommoLeads.id,
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

      logger.addProcessed(leads.length);
      totalRecords += leads.length;
      pagesProcessed++;
      page++;

      logger.setLastPage(page - 1);
    }

    await db
      .update(syncState)
      .set({
        lastPage: mode === "full" ? 0 : state.lastPage,
        lastSyncAt: new Date(),
        isRunning: false,
      })
      .where(eq(syncState.id, stateKey));

    await logger.complete({ mode, totalPages: pagesProcessed });
    return {
      completed: true,
      pagesProcessed,
      recordsProcessed: totalRecords,
    };
  } catch (error) {
    await db
      .update(syncState)
      .set({ isRunning: false })
      .where(eq(syncState.id, stateKey));

    await logger.fail(error);
    throw error;
  }
}

export async function syncUsersAndStatuses(): Promise<{
  users: number;
  statuses: number;
}> {
  const logger = new SyncLogger("kommo", "users_and_statuses");
  await logger.start();

  try {
    const [users, statuses] = await Promise.all([
      fetchUsers(),
      fetchPipelineStatuses(),
    ]);
    logger.incrementApiCalls(2);

    for (const user of users) {
      await db
        .insert(kommoUsers)
        .values({
          id: user.id,
          name: user.name,
          email: user.email,
        })
        .onConflictDoUpdate({
          target: kommoUsers.id,
          set: { name: user.name, email: user.email },
        });
    }
    logger.addProcessed(users.length);

    for (const status of statuses) {
      await db
        .insert(kommoPipelineStatuses)
        .values({
          id: status.id,
          pipelineId: status.pipeline_id,
          name: status.name,
          sortOrder: status.sort,
          color: status.color,
        })
        .onConflictDoUpdate({
          target: kommoPipelineStatuses.id,
          set: {
            name: status.name,
            sortOrder: status.sort,
            color: status.color,
          },
        });
    }
    logger.addProcessed(statuses.length);

    await logger.complete();
    return { users: users.length, statuses: statuses.length };
  } catch (error) {
    await logger.fail(error);
    throw error;
  }
}

export async function syncAllTags(): Promise<{ tags: number }> {
  const logger = new SyncLogger("kommo", "tags");
  await logger.start();

  try {
    const tags = await fetchTags();
    logger.incrementApiCalls();

    for (const tag of tags) {
      await db
        .insert(kommoTags)
        .values({ id: tag.id, name: tag.name })
        .onConflictDoUpdate({
          target: kommoTags.id,
          set: { name: tag.name },
        });
    }
    logger.addProcessed(tags.length);

    await logger.complete();
    return { tags: tags.length };
  } catch (error) {
    await logger.fail(error);
    throw error;
  }
}

export async function syncEvents(): Promise<{
  completed: boolean;
  pagesProcessed: number;
  eventsProcessed: number;
}> {
  const logger = new SyncLogger("kommo", "events");
  await logger.start();

  try {
    const state = await getOrCreateSyncState(STATE_KEY_EVENTS);

    if (state.isRunning) {
      await logger.fail(new Error("Events sync already running"));
      return { completed: false, pagesProcessed: 0, eventsProcessed: 0 };
    }

    await db
      .update(syncState)
      .set({ isRunning: true })
      .where(eq(syncState.id, STATE_KEY_EVENTS));

    const createdAfter = state.lastSyncAt
      ? Math.floor(state.lastSyncAt.getTime() / 1000)
      : undefined;

    const startTime = Date.now();
    let page = 1;
    let pagesProcessed = 0;
    let eventsProcessed = 0;
    let hasNext = true;

    while (hasNext) {
      if (Date.now() - startTime > WALL_CLOCK_LIMIT_MS) {
        await db
          .update(syncState)
          .set({ isRunning: false })
          .where(eq(syncState.id, STATE_KEY_EVENTS));

        await logger.partial({
          stoppedAt: "wall_clock_limit",
          nextPage: page,
        });
        return {
          completed: false,
          pagesProcessed,
          eventsProcessed,
        };
      }

      const { events, hasNext: more } = await fetchEventsPage(
        page,
        createdAfter,
      );
      logger.incrementApiCalls();
      hasNext = more;

      if (events.length === 0) break;

      for (const event of events) {
        const statusBefore =
          event.value_before?.[0]?.lead_status?.id ?? null;
        const statusAfter =
          event.value_after?.[0]?.lead_status?.id ?? null;
        const pipelineBefore =
          event.value_before?.[0]?.lead_status?.pipeline_id ?? null;
        const pipelineAfter =
          event.value_after?.[0]?.lead_status?.pipeline_id ?? null;

        await db
          .insert(kommoLeadEvents)
          .values({
            id: event.id,
            leadId: event.entity_id,
            type: event.type,
            statusBefore,
            statusAfter,
            pipelineBefore,
            pipelineAfter,
            responsibleUserId: event.created_by,
            eventAt: new Date(event.created_at * 1000),
          })
          .onConflictDoUpdate({
            target: kommoLeadEvents.id,
            set: {
              statusBefore,
              statusAfter,
              pipelineBefore,
              pipelineAfter,
            },
          });
      }

      logger.addProcessed(events.length);
      eventsProcessed += events.length;
      pagesProcessed++;
      page++;
    }

    await db
      .update(syncState)
      .set({
        lastSyncAt: new Date(),
        isRunning: false,
      })
      .where(eq(syncState.id, STATE_KEY_EVENTS));

    await logger.complete({ totalPages: pagesProcessed });
    return { completed: true, pagesProcessed, eventsProcessed };
  } catch (error) {
    await db
      .update(syncState)
      .set({ isRunning: false })
      .where(eq(syncState.id, STATE_KEY_EVENTS));

    await logger.fail(error);
    throw error;
  }
}
