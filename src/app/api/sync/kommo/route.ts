import { type NextRequest, NextResponse } from "next/server";

import { syncLeads, syncUsersAndStatuses } from "@/lib/kommo-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode =
    (request.nextUrl.searchParams.get("mode") as
      | "full"
      | "incremental"
      | null) ?? "incremental";

  try {
    const refData = await syncUsersAndStatuses();
    const leadsResult = await syncLeads(mode);

    return NextResponse.json({
      success: true,
      mode,
      users: refData.users,
      statuses: refData.statuses,
      leads: leadsResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
