import { request } from "node:http";

const job = process.argv[2];
const routes = {
  leads: "/api/sync/kommo?mode=incremental",
  events: "/api/sync/kommo/events",
};
if (!routes[job] || !process.env.CRON_SECRET) {
  throw new Error("Informe leads ou events e configure CRON_SECRET");
}
const { status, result } = await new Promise((resolve, reject) => {
  const req = request({
    hostname: "127.0.0.1",
    port: 3000,
    path: routes[job],
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  }, (response) => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", (chunk) => { body += chunk; });
    response.on("end", () => {
      try {
        resolve({ status: response.statusCode, result: JSON.parse(body) });
      } catch (error) {
        reject(error);
      }
    });
    response.on("error", reject);
  });
  req.setTimeout(15 * 60_000, () => req.destroy(new Error("Sync Kommo excedeu 15 minutos")));
  req.on("error", reject);
  req.end();
});
if (status !== 200 || result.success !== true) {
  throw new Error(`Sync Kommo ${job} falhou: ${status} ${result.error ?? ""}`);
}
const completed = job === "leads" ? result.leads?.completed : result.completed;
if (!completed) throw new Error(`Sync Kommo ${job} terminou parcialmente`);
console.log(JSON.stringify({ job, completed, result: job === "leads" ? result.leads : result }));
