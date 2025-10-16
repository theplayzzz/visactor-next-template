import { MapPin, TrendingDown, TrendingUp, Signal } from "lucide-react";
import type { RegionMetric, NeighborhoodRanking } from "@/types/nps";

interface NPSGeographicProps {
  byRegion: RegionMetric[];
  byNeighborhood: NeighborhoodRanking[];
}

export default function NPSGeographic({
  byRegion,
  byNeighborhood,
}: NPSGeographicProps) {
  // Criar cópias ordenadas para evitar problemas de hidratação
  const sortedByDetractors = [...byRegion].slice(0, 5);
  const sortedByPromoters = [...byRegion]
    .sort((a, b) => {
      if (b.promotersPercentage !== a.promotersPercentage) {
        return b.promotersPercentage - a.promotersPercentage;
      }
      return a.region.localeCompare(b.region);
    })
    .slice(0, 5);
  const sortedByStability = [...byRegion]
    .sort((a, b) => {
      if (a.avgStability !== b.avgStability) {
        return a.avgStability - b.avgStability;
      }
      return a.region.localeCompare(b.region);
    })
    .slice(0, 5);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Métricas Geográficas e Segmentação</h2>

      {/* Detratores por Região */}
      <section className="rounded-lg border border-border p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">
            % de Detratores por Região
          </h3>
        </div>
        <div className="space-y-3">
          {sortedByDetractors.map((region) => (
            <div key={region.region} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{region.region}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {region.detractors}/{region.totalResponses} respostas
                  </span>
                  <span
                    className={`font-bold ${
                      region.detractorsPercentage > 20
                        ? "text-red-600"
                        : region.detractorsPercentage > 10
                          ? "text-orange-600"
                          : "text-green-600"
                    }`}
                  >
                    {region.detractorsPercentage}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    region.detractorsPercentage > 20
                      ? "bg-red-500"
                      : region.detractorsPercentage > 10
                        ? "bg-orange-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${region.detractorsPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ranking de Bairros */}
      <section className="rounded-lg border border-border p-6">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">
            Ranking de Bairros com Maior Insatisfação
          </h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Concentre esforços de manutenção técnica nestas áreas
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Bairro</th>
                <th className="pb-3 font-medium">Região</th>
                <th className="pb-3 font-medium text-right">Detratores</th>
                <th className="pb-3 font-medium text-right">% Insatisfação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {byNeighborhood.map((neighborhood, index) => (
                <tr key={`${neighborhood.region}-${neighborhood.neighborhood}`}>
                  <td className="py-3 text-sm font-medium">{index + 1}</td>
                  <td className="py-3 text-sm">{neighborhood.neighborhood}</td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {neighborhood.region}
                  </td>
                  <td className="py-3 text-right text-sm">
                    {neighborhood.detractors}/{neighborhood.totalResponses}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        neighborhood.detractorsPercentage > 30
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : neighborhood.detractorsPercentage > 15
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                      }`}
                    >
                      {neighborhood.detractorsPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Promotores e Estabilidade por Região */}
      <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
        {/* Promotores por Região */}
        <section className="rounded-lg border border-border p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Promotores por Região</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Áreas com boa cobertura e satisfação
          </p>
          <div className="space-y-3">
            {sortedByPromoters.map((region) => (
                <div key={region.region} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{region.region}</span>
                    <span className="font-bold text-green-600">
                      {region.promotersPercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${region.promotersPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Estabilidade por Região */}
        <section className="rounded-lg border border-border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Signal className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">
              Estabilidade x Localidade
            </h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Detecta falhas de rede geográficas (R2)
          </p>
          <div className="space-y-3">
            {sortedByStability.map((region) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <div className="font-medium">{region.region}</div>
                    <div className="text-xs text-muted-foreground">
                      {region.totalResponses} respostas
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        region.avgStability < 3
                          ? "text-red-600"
                          : region.avgStability < 4
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {region.avgStability}/5
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Estabilidade
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
