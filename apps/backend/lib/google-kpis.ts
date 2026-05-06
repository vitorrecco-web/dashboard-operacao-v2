import { google } from "googleapis";
import { getAppSetting, setAppSetting } from "@/lib/comunicados-db";

export type KpiRecord = {
  label: string;
  value: string;
};

type KpiCache = {
  items: KpiRecord[];
  total: number;
  updatedAt: string;
};

const KPI_CACHE_KEY = "google_kpis_cache";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente ausente: ${name}.`);
  }

  return value;
}

function getRedirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/emails/oauth/callback"
  );
}

function getAuthorizedSheetsClient() {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken =
    getAppSetting("google_refresh_token") || process.env.GOOGLE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error("Refresh token do Google ainda nao configurado.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.sheets({ version: "v4", auth: oauth2Client });
}

function parseHorizontalKpis(rows: string[][]) {
  const [labelsRow = [], valuesRow = []] = rows;

  const items = labelsRow
    .map((label, index) => ({
      label: String(label ?? "").trim(),
      value: String(valuesRow[index] ?? "").trim(),
    }))
    .filter((item) => item.label && item.value);

  return items;
}

function parseVerticalKpis(rows: string[][]) {
  return rows
    .map((row) => ({
      label: String(row?.[0] ?? "").trim(),
      value: String(row?.[1] ?? "").trim(),
    }))
    .filter((item) => item.label && item.value);
}

function saveKpiCache(items: KpiRecord[], total: number) {
  try {
    setAppSetting(
      KPI_CACHE_KEY,
      JSON.stringify({
        items,
        total,
        updatedAt: new Date().toISOString(),
      } satisfies KpiCache)
    );
  } catch (error) {
    console.error("Nao foi possivel salvar o cache de KPIs:", error);
  }
}

export function getCachedSectorKpis(limit = 8) {
  const cachedValue = getAppSetting(KPI_CACHE_KEY);

  if (!cachedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(cachedValue) as Partial<KpiCache>;
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter(
          (item): item is KpiRecord =>
            typeof item?.label === "string" && typeof item?.value === "string"
        )
      : [];

    return {
      configured: true,
      reason: null,
      items: items.slice(0, Math.max(limit, 1)),
      total: typeof parsed.total === "number" ? parsed.total : items.length,
      cached: true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return null;
  }
}

export async function listSectorKpis(limit = 8) {
  const spreadsheetId = process.env.GOOGLE_KPI_SPREADSHEET_ID;

  if (!spreadsheetId) {
    return {
      configured: false,
      reason: "A planilha de KPIs ainda nao foi configurada no ambiente.",
      items: [] as KpiRecord[],
      total: 0,
    };
  }

  const range = process.env.GOOGLE_KPI_SHEET_RANGE || "KPIS!A4:Z5";
  const sheets = getAuthorizedSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    majorDimension: "ROWS",
  });

  const rows = (response.data.values ?? []).map((row) =>
    row.map((cell) => String(cell ?? "").trim())
  );
  const parsedRows =
    rows.length >= 2 && rows[0].length > 2 ? parseHorizontalKpis(rows) : parseVerticalKpis(rows);
  const slicedRows = parsedRows.slice(0, Math.max(limit, 1));

  saveKpiCache(parsedRows, parsedRows.length);

  return {
    configured: true,
    reason: null,
    items: slicedRows,
    total: parsedRows.length,
  };
}
