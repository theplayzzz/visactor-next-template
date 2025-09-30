import { getNPSMetrics } from "@/app/actions/sheets-actions";

export default async function NPSMetrics() {
  const metrics = await getNPSMetrics();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </h3>
          <p className="mt-2 text-3xl font-bold">{metric.value}</p>
          {metric.change !== 0 && (
            <p
              className={`mt-2 text-sm ${
                metric.change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {metric.change > 0 ? "+" : ""}
              {(metric.change * 100).toFixed(1)}%
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
