import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const kommoPipelineStatuses = pgTable(
  "kommo_pipeline_statuses",
  {
    id: bigint("id", { mode: "number" }).primaryKey(),
    pipelineId: bigint("pipeline_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    color: varchar("color", { length: 32 }),
  },
  (table) => [index("idx_pipeline_statuses_pipeline_id").on(table.pipelineId)],
);

export const kommoUsers = pgTable("kommo_users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
});

export const kommoTags = pgTable("kommo_tags", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const kommoLeads = pgTable(
  "kommo_leads",
  {
    id: bigint("id", { mode: "number" }).primaryKey(),
    name: text("name"),
    price: integer("price").default(0),
    statusId: bigint("status_id", { mode: "number" }),
    pipelineId: bigint("pipeline_id", { mode: "number" }),
    responsibleUserId: bigint("responsible_user_id", { mode: "number" }),
    lossReasonId: bigint("loss_reason_id", { mode: "number" }),
    kommoCreatedAt: timestamp("kommo_created_at", { withTimezone: true }),
    kommoUpdatedAt: timestamp("kommo_updated_at", { withTimezone: true }),
    kommoClosedAt: timestamp("kommo_closed_at", { withTimezone: true }),
    tagIds: jsonb("tag_ids").$type<number[]>().default([]),
    customFields: jsonb("custom_fields").$type<
      Record<string, unknown>
    >(),
    rawData: jsonb("raw_data").$type<Record<string, unknown>>(),
  },
  (table) => [
    index("idx_leads_status_id").on(table.statusId),
    index("idx_leads_pipeline_id").on(table.pipelineId),
    index("idx_leads_responsible_user_id").on(table.responsibleUserId),
    index("idx_leads_kommo_created_at").on(table.kommoCreatedAt),
    index("idx_leads_kommo_closed_at").on(table.kommoClosedAt),
    index("idx_leads_pipeline_status").on(table.pipelineId, table.statusId),
  ],
);

export const kommoLeadEvents = pgTable(
  "kommo_lead_events",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    leadId: bigint("lead_id", { mode: "number" }).notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    statusBefore: bigint("status_before", { mode: "number" }),
    statusAfter: bigint("status_after", { mode: "number" }),
    pipelineBefore: bigint("pipeline_before", { mode: "number" }),
    pipelineAfter: bigint("pipeline_after", { mode: "number" }),
    responsibleUserId: bigint("responsible_user_id", { mode: "number" }),
    eventAt: timestamp("event_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("idx_lead_events_lead_id").on(table.leadId),
    index("idx_lead_events_event_at").on(table.eventAt),
    index("idx_lead_events_type").on(table.type),
  ],
);
