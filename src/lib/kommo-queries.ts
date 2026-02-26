import { and, count, eq, gte, inArray, lte, sql, sum } from "drizzle-orm";

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

export interface ComercialMetrics {
  vendasMes: { count: number; faturamento: number };
  perdidosMes: number;
  leadsPorStatus: StatusCount[];
  vendasPorVendedor: VendedorMetrics[];
  leadsPorOrigem: OrigemCount[];
  agendamentosAbertos: number;
  lastSyncAt: Date | null;
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

  // Vendas do mês (leads com status "ganho" fechados no período)
  const vendasQuery = await db
    .select({
      count: count(),
      faturamento: sum(kommoLeads.price),
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

  const vendasMes = {
    count: vendasQuery[0]?.count ?? 0,
    faturamento: Number(vendasQuery[0]?.faturamento ?? 0),
  };

  // Perdidos no mês
  const perdidosQuery = await db
    .select({ count: count() })
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

  const perdidosMes = perdidosQuery[0]?.count ?? 0;

  // Leads por status (todos os ativos na pipeline)
  const leadsByStatusQuery = await db
    .select({
      statusId: kommoLeads.statusId,
      count: count(),
    })
    .from(kommoLeads)
    .where(
      and(
        sql`${kommoLeads.statusId} NOT IN (0, 142, 143)`,
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

  // Vendas por vendedor (no período)
  const vendasPorVendedorQuery = await db
    .select({
      userId: kommoLeads.responsibleUserId,
      count: count(),
      faturamento: sum(kommoLeads.price),
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

  const users = await db.select().from(kommoUsers);
  const userMap = new Map(users.map((u) => [u.id, u]));

  const vendasPorVendedor: VendedorMetrics[] = vendasPorVendedorQuery
    .map((row) => ({
      userId: row.userId!,
      userName: userMap.get(row.userId!)?.name ?? `User ${row.userId}`,
      count: row.count,
      faturamento: Number(row.faturamento ?? 0),
    }))
    .sort((a, b) => b.count - a.count);

  // Leads por origem (baseado em tags)
  const allLeadsWithTags = await db
    .select({ tagIds: kommoLeads.tagIds })
    .from(kommoLeads)
    .where(
      sql`${kommoLeads.statusId} NOT IN (0, 142, 143)`,
    );

  const tags = await db.select().from(kommoTags);
  const tagMap = new Map(tags.map((t) => [t.id, t.name]));

  const origemCounts: Record<string, number> = {};
  for (const row of allLeadsWithTags) {
    const ids = (row.tagIds ?? []) as number[];
    let origem = "Outros";

    for (const tagId of ids) {
      const tagName = tagMap.get(tagId)?.toLowerCase() ?? "";
      if (tagName.includes("meta") || tagName.includes("facebook") || tagName.includes("instagram")) {
        origem = "Meta Ads";
        break;
      }
      if (tagName.includes("google")) {
        origem = "Google Ads";
        break;
      }
      if (tagName.includes("indicação") || tagName.includes("indicacao")) {
        origem = "Indicação";
        break;
      }
    }

    origemCounts[origem] = (origemCounts[origem] ?? 0) + 1;
  }

  const leadsPorOrigem: OrigemCount[] = Object.entries(origemCounts)
    .map(([origem, count]) => ({ origem, count }))
    .sort((a, b) => b.count - a.count);

  // Agendamentos abertos
  const agendamentosQuery = await db
    .select({ count: count() })
    .from(kommoLeads)
    .where(
      agendadoStatusIds.length > 0
        ? inArray(kommoLeads.statusId, agendadoStatusIds)
        : undefined,
    );

  const agendamentosAbertos = agendamentosQuery[0]?.count ?? 0;

  // Last sync
  const syncRow = await db
    .select({ lastSyncAt: syncState.lastSyncAt })
    .from(syncState)
    .where(eq(syncState.id, "kommo_leads_incremental"))
    .limit(1);

  const lastSyncAt = syncRow[0]?.lastSyncAt ?? null;

  return {
    vendasMes,
    perdidosMes,
    leadsPorStatus,
    vendasPorVendedor,
    leadsPorOrigem,
    agendamentosAbertos,
    lastSyncAt,
  };
}
