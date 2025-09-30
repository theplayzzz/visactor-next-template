import { getGoogleSheetsClient, parseSheetData } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get spreadsheet metadata to list all sheets
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetsList = metadata.data.sheets?.map((sheet) => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
      rowCount: sheet.properties?.gridProperties?.rowCount,
      columnCount: sheet.properties?.gridProperties?.columnCount,
    }));

    // Try to fetch data from the first sheet
    const firstSheetName = metadata.data.sheets?.[0]?.properties?.title;
    let data = null;

    if (firstSheetName) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${firstSheetName}!A:Z`,
      });
      const rawData = response.data.values || [];
      data = {
        sheetName: firstSheetName,
        rawData,
        parsedData: parseSheetData(rawData),
      };
    }

    return NextResponse.json({
      success: true,
      spreadsheetTitle: metadata.data.properties?.title,
      sheets: sheetsList,
      sampleData: data,
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
