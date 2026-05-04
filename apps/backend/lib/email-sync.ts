import fs from "fs";
import path from "path";
import { google } from "googleapis";
import {
  dataDir,
  getEmailById,
  getEmailAttachmentById,
  getAppSetting,
  listEmailAttachments,
  listEmails,
  releaseLock,
  deleteAppSetting,
  setAppSetting,
  tryAcquireLock,
  updateEmailStatus,
  upsertEmailAttachment,
  upsertEmail,
  type EmailAttachmentRecord,
  type EmailRecord,
} from "@/lib/comunicados-db";

const MAILBOX = process.env.SUPERVISAO_EMAIL || "supervisao@shopper.com.br";
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];
const EMAIL_SYNC_INTERVAL_MINUTES = Number(process.env.EMAIL_SYNC_INTERVAL_MINUTES || "5");
const EMAIL_SYNC_LOCK_KEY = "emails_sync";
const EMAIL_SYNC_LOCK_TTL_SECONDS = 60 * 4;

type GmailHeader = {
  name?: string | null;
  value?: string | null;
};

type GmailPart = {
  filename?: string | null;
  mimeType?: string | null;
  body?: {
    data?: string | null;
    attachmentId?: string | null;
    size?: number | null;
  };
  parts?: GmailPart[];
};

const attachmentDir = path.join(dataDir, "email-attachments");

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

function decodeBase64Url(value?: string | null) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function decodeBase64UrlToBuffer(value?: string | null) {
  if (!value) {
    return Buffer.alloc(0);
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function extractHeader(headers: GmailHeader[] | undefined, headerName: string) {
  return (
    headers?.find((header) => header.name?.toLowerCase() === headerName.toLowerCase())
      ?.value ?? ""
  );
}

function parseAddress(rawValue: string) {
  const match = rawValue.match(/^(.*?)(?:\s*<(.+?)>)?$/);

  if (!match) {
    return {
      fromName: null,
      fromEmail: rawValue.trim(),
    };
  }

  const name = match[1]?.trim().replace(/^"|"$/g, "") || null;
  const email = match[2]?.trim() || rawValue.trim();

  return {
    fromName: name && name !== email ? name : null,
    fromEmail: email,
  };
}

function extractBodies(
  payload?: {
    mimeType?: string | null;
    body?: { data?: string | null };
    parts?: any[];
  } | null
) {
  if (!payload) {
    return { bodyText: "", bodyHtml: null as string | null };
  }

  const queue = [payload];
  let bodyText = "";
  let bodyHtml: string | null = null;

  while (queue.length > 0) {
    const part = queue.shift();

    if (!part) {
      continue;
    }

    if (part.mimeType === "text/plain" && part.body?.data && !bodyText) {
      bodyText = decodeBase64Url(part.body.data);
    }

    if (part.mimeType === "text/html" && part.body?.data && !bodyHtml) {
      bodyHtml = decodeBase64Url(part.body.data);
    }

    if (part.parts?.length) {
      queue.push(...part.parts);
    }
  }

  if (!bodyText && payload.body?.data) {
    bodyText = decodeBase64Url(payload.body.data);
  }

  return { bodyText, bodyHtml };
}

function hasAttachments(payload?: { parts?: any[] } | null) {
  if (!payload?.parts?.length) {
    return false;
  }

  const queue = [...payload.parts];

  while (queue.length > 0) {
    const part = queue.shift();

    if (!part) {
      continue;
    }

    if (part.filename) {
      return true;
    }

    if (part.parts?.length) {
      queue.push(...part.parts);
    }
  }

  return false;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

function inferExtension(mimeType?: string | null) {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/jpg":
      return ".jpg";
    case "text/plain":
      return ".txt";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case "application/msword":
      return ".doc";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return ".xlsx";
    case "application/vnd.ms-excel":
      return ".xls";
    default:
      return "";
  }
}

function ensureAttachmentDir() {
  if (!fs.existsSync(attachmentDir)) {
    fs.mkdirSync(attachmentDir, { recursive: true });
  }
}

function collectAttachmentParts(payload?: GmailPart | null) {
  if (!payload) {
    return [] as GmailPart[];
  }

  const queue = [payload];
  const attachments: GmailPart[] = [];

  while (queue.length > 0) {
    const part = queue.shift();

    if (!part) {
      continue;
    }

    if (part.filename && part.body?.attachmentId) {
      attachments.push(part);
    }

    if (part.parts?.length) {
      queue.push(...part.parts);
    }
  }

  return attachments;
}

function getOAuthClient() {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken =
    process.env.GOOGLE_REFRESH_TOKEN || getAppSetting("google_refresh_token");

  if (!refreshToken) {
    throw new Error("Refresh token do Gmail ainda nao configurado.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}

export function getEmailSyncStatus() {
  const hasClientCredentials =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const configured =
    hasClientCredentials &&
    Boolean(process.env.GOOGLE_REFRESH_TOKEN || getAppSetting("google_refresh_token"));
  const lastSyncAt = getAppSetting("emails_last_sync_at");
  const oauthIssue = getAppSetting("gmail_oauth_issue");
  const connectedAt = getAppSetting("gmail_connected_at");

  return {
    mailbox: MAILBOX,
    provider: "gmail",
    configured,
    hasClientCredentials,
    redirectUri: getRedirectUri(),
    hasRefreshToken: Boolean(
      process.env.GOOGLE_REFRESH_TOKEN || getAppSetting("google_refresh_token")
    ),
    lastSyncAt,
    oauthIssue,
    connectedAt,
    syncIntervalMinutes: EMAIL_SYNC_INTERVAL_MINUTES,
  };
}

export function getOAuthAuthorizationUrl() {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    login_hint: MAILBOX,
  });
}

export async function exchangeCodeForRefreshToken(code: string) {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    setAppSetting(
      "gmail_oauth_issue",
      "O Google concluiu o login, mas nao retornou refresh token. Remova o acesso anterior do app na conta Google e tente reconectar em janela anonima."
    );
    throw new Error(
      "O Google nao retornou refresh token. Remova o acesso anterior do app na conta Google e tente reconectar em janela anonima."
    );
  }

  setAppSetting("google_refresh_token", tokens.refresh_token);
  setAppSetting("gmail_connected_at", new Date().toISOString());
  deleteAppSetting("gmail_oauth_issue");

  return {
    refreshTokenStored: true,
  };
}

export function resetGmailConnection() {
  deleteAppSetting("google_refresh_token");
  deleteAppSetting("gmail_oauth_issue");
}

export async function syncMailboxEmails(limit = 100) {
  const lockAcquired = tryAcquireLock(
    EMAIL_SYNC_LOCK_KEY,
    EMAIL_SYNC_LOCK_TTL_SECONDS
  );

  if (!lockAcquired) {
    return {
      mailbox: MAILBOX,
      synced: 0,
      total: listEmails(MAILBOX).length,
      syncedAt: getAppSetting("emails_last_sync_at"),
      skipped: true,
      reason: "lock_active",
    };
  }

  const auth = getOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });
  ensureAttachmentDir();
  try {
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      q: "in:inbox",
    });

    const messages = listResponse.data.messages ?? [];
    let synced = 0;

    for (const message of messages) {
      if (!message.id) {
        continue;
      }

      const detailResponse = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const detail = detailResponse.data;
      const headers = detail.payload?.headers as GmailHeader[] | undefined;
      const { fromName, fromEmail } = parseAddress(extractHeader(headers, "from"));
      const subject = extractHeader(headers, "subject") || "(Sem assunto)";
      const internalDate = detail.internalDate
        ? new Date(Number(detail.internalDate)).toISOString()
        : new Date().toISOString();
      const bodies = extractBodies(detail.payload);

      const storedEmail = upsertEmail({
        messageId: detail.id ?? message.id,
        threadId: detail.threadId ?? null,
        mailbox: MAILBOX,
        fromEmail: fromEmail || "desconhecido",
        fromName,
        subject,
        snippet: detail.snippet ?? "",
        bodyText: bodies.bodyText,
        bodyHtml: bodies.bodyHtml,
        receivedAt: internalDate,
        status: "nao_lido",
        hasAttachments: hasAttachments(detail.payload),
      });

      const attachmentParts = collectAttachmentParts(detail.payload as GmailPart | null);

      for (const part of attachmentParts) {
        const attachmentId = part.body?.attachmentId;
        const rawFilename = part.filename?.trim() || "";
        const safeFilename = rawFilename
          ? sanitizeFilename(rawFilename)
          : `anexo-${attachmentId}${inferExtension(part.mimeType)}`;

        if (!attachmentId) {
          continue;
        }

        const attachmentResponse = await gmail.users.messages.attachments.get({
          userId: "me",
          messageId: detail.id ?? message.id,
          id: attachmentId,
        });

        const buffer = decodeBase64UrlToBuffer(attachmentResponse.data.data);
        const emailFolder = path.join(
          attachmentDir,
          sanitizeFilename(detail.id ?? message.id)
        );

        if (!fs.existsSync(emailFolder)) {
          fs.mkdirSync(emailFolder, { recursive: true });
        }

        const storagePath = path.join(emailFolder, safeFilename);
        fs.writeFileSync(storagePath, buffer);

        upsertEmailAttachment({
          emailId: storedEmail.id,
          gmailAttachmentId: attachmentId,
          filename: safeFilename,
          mimeType: part.mimeType || "application/octet-stream",
          storagePath,
          size: buffer.length || Number(part.body?.size ?? 0),
        });
      }

      synced += 1;
    }

    const syncedAt = new Date().toISOString();
    setAppSetting("emails_last_sync_at", syncedAt);

    return {
      mailbox: MAILBOX,
      synced,
      total: listEmails(MAILBOX).length,
      syncedAt,
      skipped: false,
      reason: "completed",
    };
  } finally {
    releaseLock(EMAIL_SYNC_LOCK_KEY);
  }
}

export async function syncMailboxEmailsIfStale() {
  const status = getEmailSyncStatus();

  if (!status.configured) {
    return {
      executed: false,
      reason: "not_configured",
      lastSyncAt: status.lastSyncAt,
    };
  }

  if (!status.lastSyncAt) {
    const result = await syncMailboxEmails();
    return {
      executed: true,
      reason: "first_sync",
      lastSyncAt: result.syncedAt,
    };
  }

  const lastSyncTime = new Date(status.lastSyncAt).getTime();
  const staleAfterMs = EMAIL_SYNC_INTERVAL_MINUTES * 60 * 1000;
  const isStale = Number.isNaN(lastSyncTime) || Date.now() - lastSyncTime >= staleAfterMs;

  if (!isStale) {
    return {
      executed: false,
      reason: "fresh",
      lastSyncAt: status.lastSyncAt,
    };
  }

  const result = await syncMailboxEmails();

  return {
    executed: true,
    reason: "stale",
    lastSyncAt: result.syncedAt,
  };
}

export function listMailboxEmails(options?: {
  limit?: number;
  status?: "todos" | "lido" | "nao_lido";
  query?: string;
  hasAttachments?: boolean;
}): EmailRecord[] {
  return listEmails(MAILBOX, options);
}

export function getMailboxEmailById(id: number) {
  return getEmailById(id, MAILBOX);
}

export function listMailboxEmailAttachments(emailId: number): EmailAttachmentRecord[] {
  return listEmailAttachments(emailId);
}

export function getMailboxEmailAttachmentById(id: number) {
  return getEmailAttachmentById(id);
}

export function markMailboxEmailAsRead(id: number) {
  return updateEmailStatus(id, MAILBOX, "lido");
}

export function markMailboxEmailAsUnread(id: number) {
  return updateEmailStatus(id, MAILBOX, "nao_lido");
}
