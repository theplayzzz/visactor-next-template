import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ausente");
const sql = neon(process.env.DATABASE_URL);
const bySource = await sql`
  SELECT CASE WHEN _airbyte_raw_id LIKE 'meta-graph:%' THEN 'meta_graph' ELSE 'airbyte' END AS source,
    COUNT(*)::int AS rows, MIN(date_start) AS first_day, MAX(date_start) AS last_day,
    ROUND(SUM(COALESCE(spend, 0))::numeric, 2) AS total_spend
  FROM ads_insights GROUP BY 1 ORDER BY 1
`;
const overlaps = await sql`
  SELECT COUNT(*)::int AS ad_days, COALESCE(SUM(total_spend), 0)::numeric AS duplicated_spend
  FROM (
    SELECT ad_id, date_start, SUM(COALESCE(spend, 0))::numeric AS total_spend
    FROM ads_insights WHERE date_start >= '2026-05-30' AND date_start <= '2026-09-22'
    GROUP BY ad_id, date_start HAVING COUNT(*) > 1
  ) x
`;
const recent = await sql`
  SELECT date_start, COUNT(*)::int AS rows,
    ROUND(SUM(COALESCE(spend, 0))::numeric, 2) AS spend
  FROM ads_insights WHERE date_start >= '2026-09-19'
  GROUP BY date_start ORDER BY date_start DESC LIMIT 8
`;
console.log(JSON.stringify({ bySource, overlaps: overlaps[0], recent }));
