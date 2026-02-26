import { and, count, eq, gte, inArray, lte, min, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  kommoLeads,
  kommoPipelineStatuses,
  kommoTags,
  kommoUsers,
  syncState,
} from "@/db/schema";

interface StatusCount {
  statusId: number;
  statusName: string;
  count: number;
  sortOrder: number;
  color: string | null;
}

interface VendedorMetrics {
  userId: number;
  userName: string;
  count: number;
  faturamento: number;
}

interface OrigemCount {
  origem: string;
  count: number;
}

interface MetricasPorOrigem {
  leads: number;
  vendas: number;
  faturamento: number;
  perdidos: number;
  agendamentos: number;
}

export interface ComercialMetrics {
  // Totais
  vendasMes: { count: number; faturamento: number };
  perdidosMes: number;
  leadsTotal: number;
  agendamentosAbertos: number;
  // Por origem
  metricasGoogleAds: MetricasPorOrigem;
  metricasMetaAds: MetricasPorOrigem;
  metricasOutbound: MetricasPorOrigem;
  // Detalhamento
  leadsPorStatus: StatusCount[];
  vendasPorVendedor: VendedorMetrics[];
  leadsPorOrigem: OrigemCount[];
  lastSyncAt: Date | null;
}

// Função helper para determinar a origem de um lead baseado em suas tags
function determinarOrigem(
  tagIds: number[],
  tagMap: Map<number, string>,
): "google" | "meta" | "outbound" {
  for (const tagId of tagIds) {
    const tagName = tagMap.get(tagId)?.toLowerCase() ?? "";
    if (
      tagName.includes("meta") ||
      tagName.includes("facebook") ||
      tagName.includes("instagram")
    ) {
      return "meta";
    }
    if (tagName.includes("google")) {
      return "google";
    }
  }
  return "outbound";
}

export async function getComercialMetrics(
  startDate: Date,
  endDate: Date,
): Promise<ComercialMetrics> {
  const statuses = await db.select().from(kommoPipelineStatuses);
  const statusMap = new Map(statuses.map((s) => [s.id, s]));

  const wonStatusIds = statuses
    .filter((s) => s.name.toLowerCase().includes("ganho") || s.id === 142)
    .map((s) => s.id);

  const lostStatusIds = statuses
    .filter((s) => s.name.toLowerCase().includes("perdido") || s.id === 143)
    .map((s) => s.id);

  const agendadoStatusIds = statuses
    .filter(
      (s) =>
        s.name.toLowerCase().includes("agendado") ||
        s.name.toLowerCase().includes("confirmado"),
    )
    .map((s) => s.id);

  // Buscar tags para classificação de origem
  const tags = await db.select().from(kommoTags);
  const tagMap = new Map(tags.map((t) => [t.id, t.name]));

  // Buscar usuários para vendas por vendedor
  const users = await db.select().from(kommoUsers);
  const userMap = new Map(users.map((u) => [u.id, u]));

  // ===== MÉTRICAS POR ORIGEM =====
  // Buscar vendas (ganho) com tags para classificar por origem
  const vendasComTags = await db
    .select({
      tagIds: kommoLeads.tagIds,
      price: kommoLeads.price,
    })
    .from(kommoLeads)
    .where(
      and(
        wonStatusIds.length > 0
          ? inArray(kommoLeads.statusId, wonStatusIds)
          : undefined,
        gte(kommoLeads.kommoClosedAt, startDate),
        lte(kommoLeads.kommoClosedAt, endDate),
      ),
    );

  // Buscar perdidos com tags
  const perdidosComTags = await db
    .select({ tagIds: kommoLeads.tagIds })
    .from(kommoLeads)
    .where(
      and(
        lostStatusIds.length > 0
          ? inArray(kommoLeads.statusId, lostStatusIds)
          : undefined,
        gte(kommoLeads.kommoClosedAt, startDate),
        lte(kommoLeads.kommoClosedAt, endDate),
      ),
    );

  // Buscar agendamentos com tags
  const agendamentosComTags = await db
    .select({ tagIds: kommoLeads.tagIds })
    .from(kommoLeads)
    .where(
      and(
        agendadoStatusIds.length > 0
          ? inArray(kommoLeads.statusId, agendadoStatusIds)
          : undefined,
        gte(kommoLeads.kommoCreatedAt, startDate),
        lte(kommoLeads.kommoCreatedAt, endDate),
      ),
    );

  // Buscar TODOS os leads criados no período (independente do status atual)
  // Isso inclui leads na pipeline, ganhos e perdidos
  const leadsComTags = await db
    .select({ tagIds: kommoLeads.tagIds })
    .from(kommoLeads)
    .where(
      and(
        sql`${kommoLeads.statusId} != 0`, // Apenas exclui status 0 (inválido)
        gte(kommoLeads.kommoCreatedAt, startDate),
        lte(kommoLeads.kommoCreatedAt, endDate),
      ),
    );

  // Inicializar contadores por origem
  const metricasGoogleAds: MetricasPorOrigem = {
    leads: 0,
    vendas: 0,
    faturamento: 0,
    perdidos: 0,
    agendamentos: 0,
  };
  const metricasMetaAds: MetricasPorOrigem = {
    leads: 0,
    vendas: 0,
    faturamento: 0,
    perdidos: 0,
    agendamentos: 0,
  };
  const metricasOutbound: MetricasPorOrigem = {
    leads: 0,
    vendas: 0,
    faturamento: 0,
    perdidos: 0,
    agendamentos: 0,
  };

  // Contabilizar vendas por origem
  let vendasTotal = 0;
  let faturamentoTotal = 0;
  for (const row of vendasComTags) {
    const ids = (row.tagIds ?? []) as number[];
    const origem = determinarOrigem(ids, tagMap);
    const price =
      row.price && Number(row.price) <= 1000000 ? Number(row.price) : 0;

    vendasTotal++;
    faturamentoTotal += price;

    if (origem === "google") {
      metricasGoogleAds.vendas++;
      metricasGoogleAds.faturamento += price;
    } else if (origem === "meta") {
      metricasMetaAds.vendas++;
      metricasMetaAds.faturamento += price;
    } else {
      metricasOutbound.vendas++;
      metricasOutbound.faturamento += price;
    }
  }

  // Contabilizar perdidos por origem
  let perdidosTotal = 0;
  for (const row of perdidosComTags) {
    const ids = (row.tagIds ?? []) as number[];
    const origem = determinarOrigem(ids, tagMap);

    perdidosTotal++;

    if (origem === "google") {
      metricasGoogleAds.perdidos++;
    } else if (origem === "meta") {
      metricasMetaAds.perdidos++;
    } else {
      metricasOutbound.perdidos++;
    }
  }

  // Contabilizar agendamentos por origem
  let agendamentosTotal = 0;
  for (const row of agendamentosComTags) {
    const ids = (row.tagIds ?? []) as number[];
    const origem = determinarOrigem(ids, tagMap);

    agendamentosTotal++;

    if (origem === "google") {
      metricasGoogleAds.agendamentos++;
    } else if (origem === "meta") {
      metricasMetaAds.agendamentos++;
    } else {
      metricasOutbound.agendamentos++;
    }
  }

  // Contabilizar leads por origem e manter o detalhamento de "Leads por Origem"
  const origemCounts: Record<string, number> = {};
  for (const row of leadsComTags) {
    const ids = (row.tagIds ?? []) as number[];
    const origem = determinarOrigem(ids, tagMap);

    if (origem === "google") {
      metricasGoogleAds.leads++;
      origemCounts["Google Ads"] = (origemCounts["Google Ads"] ?? 0) + 1;
    } else if (origem === "meta") {
      metricasMetaAds.leads++;
      origemCounts["Meta Ads"] = (origemCounts["Meta Ads"] ?? 0) + 1;
    } else {
      metricasOutbound.leads++;
      // Classificação mais detalhada para "Outros"
      let origemDetalhada = "Outros";
      for (const tagId of ids) {
        const tagName = tagMap.get(tagId)?.toLowerCase() ?? "";
        if (tagName.includes("indicação") || tagName.includes("indicacao")) {
          origemDetalhada = "Indicação";
          break;
        }
      }
      origemCounts[origemDetalhada] = (origemCounts[origemDetalhada] ?? 0) + 1;
    }
  }

  const leadsTotal =
    metricasGoogleAds.leads + metricasMetaAds.leads + metricasOutbound.leads;

  const leadsPorOrigem: OrigemCount[] = Object.entries(origemCounts)
    .map(([origem, count]) => ({ origem, count }))
    .sort((a, b) => b.count - a.count);

  // ===== LEADS POR STATUS (para tabela Pipeline) =====
  const leadsByStatusQuery = await db
    .select({
      statusId: kommoLeads.statusId,
      count: count(),
    })
    .from(kommoLeads)
    .where(
      and(
        sql`${kommoLeads.statusId} NOT IN (0, 142, 143)`,
        gte(kommoLeads.kommoCreatedAt, startDate),
        lte(kommoLeads.kommoCreatedAt, endDate),
      ),
    )
    .groupBy(kommoLeads.statusId);

  const leadsPorStatus: StatusCount[] = leadsByStatusQuery
    .map((row) => {
      const status = statusMap.get(row.statusId!);
      return {
        statusId: row.statusId!,
        statusName: status?.name ?? `Status ${row.statusId}`,
        count: row.count,
        sortOrder: status?.sortOrder ?? 999,
        color: status?.color ?? null,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // ===== VENDAS POR VENDEDOR =====
  const vendasPorVendedorQuery = await db
    .select({
      userId: kommoLeads.responsibleUserId,
      count: count(),
      faturamento:
        sql<string>`coalesce(sum(case when ${kommoLeads.price} <= 1000000 then ${kommoLeads.price} else 0 end), '0')`,
    })
    .from(kommoLeads)
    .where(
      and(
        wonStatusIds.length > 0
          ? inArray(kommoLeads.statusId, wonStatusIds)
          : undefined,
        gte(kommoLeads.kommoClosedAt, startDate),
        lte(kommoLeads.kommoClosedAt, endDate),
      ),
    )
    .groupBy(kommoLeads.responsibleUserId);

  const vendasPorVendedor: VendedorMetrics[] = vendasPorVendedorQuery
    .map((row) => ({
      userId: row.userId!,
      userName: userMap.get(row.userId!)?.name ?? `User ${row.userId}`,
      count: row.count,
      faturamento: Number(row.faturamento ?? 0),
    }))
    .sort((a, b) => b.count - a.count);

  // ===== LAST SYNC =====
  const syncRow = await db
    .select({ lastSyncAt: syncState.lastSyncAt })
    .from(syncState)
    .where(eq(syncState.id, "kommo_leads_incremental"))
    .limit(1);

  const lastSyncAt = syncRow[0]?.lastSyncAt ?? null;

  return {
    vendasMes: { count: vendasTotal, faturamento: faturamentoTotal },
    perdidosMes: perdidosTotal,
    leadsTotal,
    agendamentosAbertos: agendamentosTotal,
    metricasGoogleAds,
    metricasMetaAds,
    metricasOutbound,
    leadsPorStatus,
    vendasPorVendedor,
    leadsPorOrigem,
    lastSyncAt,
  };
}

/** Data do lead mais antigo (kommo_created_at) para o preset "Período máximo" */
export async function getMinLeadDate(): Promise<Date> {
  const result = await db
    .select({ minDate: min(kommoLeads.kommoCreatedAt) })
    .from(kommoLeads);

  return result[0]?.minDate ?? new Date();
}
