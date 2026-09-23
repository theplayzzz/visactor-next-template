import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ausente");
const sql = neon(process.env.DATABASE_URL);
const states = await sql`
  SELECT id, last_sync_at, last_page, is_running, metadata
  FROM sync_state WHERE id LIKE 'kommo_%' ORDER BY id
`;
const logs = await sql`
  SELECT id, sync_type, status, started_at, completed_at, records_processed
  FROM sync_logs WHERE data_source = 'kommo' ORDER BY id DESC LIMIT 8
`;
const [counts] = await sql`
  SELECT (SELECT COUNT(*)::int FROM kommo_leads) AS leads,
    (SELECT COUNT(*)::int FROM kommo_lead_events) AS events
`;
const [lastFailure] = await sql`
  SELECT id, LEFT(error_message, 500) AS message FROM sync_logs
  WHERE data_source = 'kommo' AND status = 'failed' ORDER BY id DESC LIMIT 1
`;
const safeFailure = lastFailure && {
  id: lastFailure.id,
  message: lastFailure.message?.replace(/(Bearer\s+|access_token[=:]\s*)[^\s"&]+/gi, "$1[redacted]"),
};
console.log(JSON.stringify({ states, logs, counts, lastFailure: safeFailure }));
