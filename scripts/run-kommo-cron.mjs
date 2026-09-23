const job = process.argv[2];
const routes = {
  leads: "/api/sync/kommo?mode=incremental",
  events: "/api/sync/kommo/events",
};
if (!routes[job] || !process.env.CRON_SECRET) {
  throw new Error("Informe leads ou events e configure CRON_SECRET");
}
const response = await fetch(`http://127.0.0.1:3000${routes[job]}`, {
  headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  signal: AbortSignal.timeout(15 * 60_000),
});
const result = await response.json();
if (!response.ok || result.success !== true) {
  throw new Error(`Sync Kommo ${job} falhou: ${response.status} ${result.error ?? ""}`);
}
const completed = job === "leads" ? result.leads?.completed : result.completed;
if (!completed) throw new Error(`Sync Kommo ${job} terminou parcialmente`);
console.log(JSON.stringify({ job, completed, result: job === "leads" ? result.leads : result }));
