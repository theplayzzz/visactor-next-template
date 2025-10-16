import { getSheetData, parseSheetData } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rawData = await getSheetData("Dados NPS (Clientes)");
    const parsedData = parseSheetData(rawData);

    return NextResponse.json({
      success: true,
      totalRows: rawData.length,
      parsedCount: parsedData.length,
      headers: rawData[0],
      sample: parsedData.slice(0, 3),
    });
  } catch (error) {
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
