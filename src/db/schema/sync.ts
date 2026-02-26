import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const dataSourceEnum = pgEnum("data_source", [
  "kommo",
  "google_ads",
  "meta_ads",
  "google_sheets",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "running",
  "completed",
  "failed",
  "partial",
]);

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  dataSource: dataSourceEnum("data_source").notNull(),
  syncType: varchar("sync_type", { length: 100 }).notNull(),
  status: syncStatusEnum("status").notNull().default("running"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationMs: integer("duration_ms"),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  apiCallsCount: integer("api_calls_count").default(0),
  lastPage: integer("last_page"),
  errorMessage: text("error_message"),
  errorStack: text("error_stack"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const syncState = pgTable("sync_state", {
  id: varchar("id", { length: 100 }).primaryKey(),
  dataSource: dataSourceEnum("data_source").notNull(),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastPage: integer("last_page").default(0),
  totalPages: integer("total_pages"),
  isRunning: boolean("is_running").default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});
