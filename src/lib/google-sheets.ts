import { google } from "googleapis";
import path from "path";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

/**
 * Get authenticated Google Sheets API client
 */
export async function getGoogleSheetsClient() {
  // Try to use JSON file first (for local development)
  const keyFilePath = path.join(
    process.cwd(),
    "gen-lang-client-0312769039-f45a7c9ff94b.json",
  );

  let auth;

  if (fs.existsSync(keyFilePath)) {
    // Use JSON file if exists
    auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: SCOPES,
    });
  } else {
    // Fallback to environment variables (for production/deployment)
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: SCOPES,
    });
  }

  const authClient = await auth.getClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sheets = google.sheets({ version: "v4", auth: authClient as any });

  return sheets;
}

/**
 * Read data from a specific sheet range
 */
export async function getSheetData(sheetName: string, range = "A:Z") {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${range}`,
  });

  return response.data.values || [];
}

/**
 * Parse sheet data to array of objects
 * First row is expected to be headers
 */
export function parseSheetData<T>(rawData: string[][]): T[] {
  if (rawData.length === 0) return [];

  const [headers, ...rows] = rawData;

  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || null;
    });
    return obj as T;
  });
}
