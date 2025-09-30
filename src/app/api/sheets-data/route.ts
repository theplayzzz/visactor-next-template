import { getSheetData, parseSheetData } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get("sheet") || "Data";
    const limit = parseInt(searchParams.get("limit") || "10");

    const rawData = await getSheetData(sheetName);
    const parsedData = parseSheetData(rawData);

    return NextResponse.json({
      success: true,
      sheetName,
      totalRows: parsedData.length,
      columns: rawData[0] || [],
      data: parsedData.slice(0, limit),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
