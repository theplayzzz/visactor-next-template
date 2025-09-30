import { getSheetData, parseSheetData } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== DEBUG: Starting NPS data fetch ===");

    const rawData = await getSheetData("Dados NPS (Clientes)");
    console.log("=== DEBUG: Raw data rows:", rawData.length);
    console.log("=== DEBUG: First 3 rows:", rawData.slice(0, 3));

    const parsedData = parseSheetData(rawData);
    console.log("=== DEBUG: Parsed data count:", parsedData.length);
    console.log("=== DEBUG: First parsed row:", parsedData[0]);

    return NextResponse.json({
      success: true,
      totalRows: rawData.length,
      parsedCount: parsedData.length,
      headers: rawData[0],
      sample: parsedData.slice(0, 3),
    });
  } catch (error) {
    console.error("=== DEBUG: Error ===", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
