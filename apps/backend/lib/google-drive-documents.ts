import { google } from "googleapis";
import type { SectorDefinition } from "@/lib/sector-config";
import { getAppSetting } from "@/lib/comunicados-db";

const GOOGLE_DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

export type SectorDriveDocument = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string | null;
  size: number | null;
};

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

function getSectorFolderEnvName(sector: SectorDefinition) {
  return `GOOGLE_DRIVE_FOLDER_${sector.setorId
    .replace(/-/g, "_")
    .toUpperCase()}`;
}

export function getSectorDriveFolderId(sector: SectorDefinition) {
  return process.env[getSectorFolderEnvName(sector)] ?? null;
}

function getAuthorizedDriveClient() {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken =
    process.env.GOOGLE_REFRESH_TOKEN || getAppSetting("google_refresh_token");

  if (!refreshToken) {
    throw new Error("Refresh token do Google ainda nao configurado.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth: oauth2Client });
}

function normalizeSize(size?: string | null) {
  if (!size) {
    return null;
  }

  const parsed = Number(size);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function listSectorDriveDocuments(sector: SectorDefinition) {
  const folderId = getSectorDriveFolderId(sector);

  if (!folderId) {
    return {
      documents: [] as SectorDriveDocument[],
      configured: false,
      reason: `A pasta do Google Drive para ${sector.areaNome} - ${sector.sectorNome} ainda nao foi configurada.`,
    };
  }

  const drive = getAuthorizedDriveClient();
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and mimeType = 'application/pdf'`,
    orderBy: "modifiedTime desc, name",
    pageSize: 100,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    fields: "files(id,name,mimeType,modifiedTime,size)",
  });

  return {
    configured: true,
    reason: null,
    documents: (response.data.files ?? [])
      .filter((file): file is NonNullable<typeof file> => Boolean(file?.id && file?.name))
      .map((file) => ({
        id: file.id as string,
        name: file.name as string,
        mimeType: file.mimeType || "application/pdf",
        modifiedTime: file.modifiedTime ?? null,
        size: normalizeSize(file.size),
      })),
  };
}

export async function downloadSectorDriveDocument(
  sector: SectorDefinition,
  fileId: string
) {
  const folderId = getSectorDriveFolderId(sector);

  if (!folderId) {
    throw new Error("A pasta do Google Drive deste setor ainda nao foi configurada.");
  }

  const drive = getAuthorizedDriveClient();
  const metadataResponse = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: "id,name,mimeType,parents",
  });

  const file = metadataResponse.data;

  if (!file.id || !file.parents?.includes(folderId)) {
    throw new Error("Arquivo nao pertence a pasta configurada para este setor.");
  }

  const contentResponse = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "arraybuffer",
    }
  );

  return {
    fileName: file.name || "documento.pdf",
    mimeType: file.mimeType || "application/pdf",
    buffer: Buffer.from(contentResponse.data as ArrayBuffer),
  };
}
