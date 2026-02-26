import { eq } from "drizzle-orm";

import { db } from "@/db";
import { syncLogs } from "@/db/schema";

type DataSource = "kommo" | "google_ads" | "meta_ads" | "google_sheets";

export class SyncLogger {
  private logId: number | null = null;
  private startTime: number;
  private _apiCalls = 0;
  private _recordsProcessed = 0;
  private _recordsCreated = 0;
  private _recordsUpdated = 0;
  private _lastPage: number | null = null;

  constructor(
    private dataSource: DataSource,
    private syncType: string,
  ) {
    this.startTime = Date.now();
  }

  async start(): Promise<void> {
    const [row] = await db
      .insert(syncLogs)
      .values({
        dataSource: this.dataSource,
        syncType: this.syncType,
        status: "running",
      })
      .returning({ id: syncLogs.id });

    this.logId = row.id;
  }

  incrementApiCalls(count = 1): void {
    this._apiCalls += count;
  }

  addProcessed(count: number): void {
    this._recordsProcessed += count;
  }

  addCreated(count: number): void {
    this._recordsCreated += count;
  }

  addUpdated(count: number): void {
    this._recordsUpdated += count;
  }

  setLastPage(page: number): void {
    this._lastPage = page;
  }

  get apiCalls(): number {
    return this._apiCalls;
  }

  get recordsProcessed(): number {
    return this._recordsProcessed;
  }

  async complete(
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.logId) return;

    const durationMs = Date.now() - this.startTime;

    await db
      .update(syncLogs)
      .set({
        status: "completed",
        completedAt: new Date(),
        durationMs,
        recordsProcessed: this._recordsProcessed,
        recordsCreated: this._recordsCreated,
        recordsUpdated: this._recordsUpdated,
        apiCallsCount: this._apiCalls,
        lastPage: this._lastPage,
        metadata,
      })
      .where(eq(syncLogs.id, this.logId));
  }

  async partial(
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.logId) return;

    const durationMs = Date.now() - this.startTime;

    await db
      .update(syncLogs)
      .set({
        status: "partial",
        completedAt: new Date(),
        durationMs,
        recordsProcessed: this._recordsProcessed,
        recordsCreated: this._recordsCreated,
        recordsUpdated: this._recordsUpdated,
        apiCallsCount: this._apiCalls,
        lastPage: this._lastPage,
        metadata,
      })
      .where(eq(syncLogs.id, this.logId));
  }

  async fail(error: unknown): Promise<void> {
    if (!this.logId) return;

    const durationMs = Date.now() - this.startTime;
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const errorStack =
      error instanceof Error ? error.stack ?? null : null;

    await db
      .update(syncLogs)
      .set({
        status: "failed",
        completedAt: new Date(),
        durationMs,
        recordsProcessed: this._recordsProcessed,
        recordsCreated: this._recordsCreated,
        recordsUpdated: this._recordsUpdated,
        apiCallsCount: this._apiCalls,
        lastPage: this._lastPage,
        errorMessage,
        errorStack,
      })
      .where(eq(syncLogs.id, this.logId));
  }
}
