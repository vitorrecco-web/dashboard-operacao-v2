import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export type ComunicadoRecord = {
  id: number;
  titulo: string;
  tag: string;
  resumo: string;
  conteudo: string;
  data: string;
  novo: boolean;
  fixado: boolean;
  tipo: string;
  setor: string | null;
  linkPdf: string | null;
};

export type EmailRecord = {
  id: number;
  messageId: string;
  threadId: string | null;
  mailbox: string;
  fromEmail: string;
  fromName: string | null;
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string | null;
  receivedAt: string;
  processedAt: string;
  status: string;
  hasAttachments: boolean;
};

export type EmailAttachmentRecord = {
  id: number;
  emailId: number;
  gmailAttachmentId: string;
  filename: string;
  mimeType: string;
  storagePath: string;
  size: number;
};

type ComunicadoRow = {
  id: number;
  titulo: string;
  tag: string;
  resumo: string;
  conteudo: string;
  data: string;
  novo: number;
  fixado: number;
  tipo: string;
  setor: string | null;
  link_pdf: string | null;
};

type EmailRow = {
  id: number;
  message_id: string;
  thread_id: string | null;
  mailbox: string;
  from_email: string;
  from_name: string | null;
  subject: string;
  snippet: string;
  body_text: string;
  body_html: string | null;
  received_at: string;
  processed_at: string;
  status: string;
  has_attachments: number;
};

type SettingRow = {
  setting_key: string;
  setting_value: string;
};

type LockRow = {
  lock_key: string;
  expires_at: string;
};

type EmailAttachmentRow = {
  id: number;
  email_id: number;
  gmail_attachment_id: string;
  filename: string;
  mime_type: string;
  storage_path: string;
  size: number;
};

export const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "painel.db");
const geraisJsonPath = path.join(process.cwd(), "app", "dados", "comunicados.json");
const pickingJsonPath = path.join(
  process.cwd(),
  "app",
  "dados",
  "comunicados-picking.json"
);

type SqliteDatabase = InstanceType<typeof Database>;

let dbInstance: SqliteDatabase | null = null;

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function mapComunicadoRow(row: ComunicadoRow): ComunicadoRecord {
  return {
    id: row.id,
    titulo: row.titulo,
    tag: row.tag,
    resumo: row.resumo,
    conteudo: row.conteudo,
    data: row.data,
    novo: Boolean(row.novo),
    fixado: Boolean(row.fixado),
    tipo: row.tipo,
    setor: row.setor,
    linkPdf: row.link_pdf,
  };
}

function mapEmailRow(row: EmailRow): EmailRecord {
  return {
    id: row.id,
    messageId: row.message_id,
    threadId: row.thread_id,
    mailbox: row.mailbox,
    fromEmail: row.from_email,
    fromName: row.from_name,
    subject: row.subject,
    snippet: row.snippet,
    bodyText: row.body_text,
    bodyHtml: row.body_html,
    receivedAt: row.received_at,
    processedAt: row.processed_at,
    status: row.status,
    hasAttachments: Boolean(row.has_attachments),
  };
}

function mapEmailAttachmentRow(row: EmailAttachmentRow): EmailAttachmentRecord {
  return {
    id: row.id,
    emailId: row.email_id,
    gmailAttachmentId: row.gmail_attachment_id,
    filename: row.filename,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    size: row.size,
  };
}

function loadJsonFile<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T[];
  } catch {
    return [];
  }
}

function seedComunicados(db: SqliteDatabase) {
  const count = db
    .prepare("SELECT COUNT(*) as total FROM comunicados")
    .get() as { total: number };

  if (count.total > 0) {
    return;
  }

  const gerais = loadJsonFile<
    Omit<ComunicadoRecord, "tipo" | "setor" | "linkPdf"> & {
      tipo?: string;
      setor?: string | null;
      linkPdf?: string | null;
    }
  >(geraisJsonPath);
  const picking = loadJsonFile<
    Omit<ComunicadoRecord, "tipo" | "setor"> & { linkPdf?: string | null }
  >(pickingJsonPath);

  const insert = db.prepare(`
    INSERT INTO comunicados (
      id,
      titulo,
      tag,
      resumo,
      conteudo,
      data,
      novo,
      fixado,
      tipo,
      setor,
      link_pdf
    ) VALUES (
      @id,
      @titulo,
      @tag,
      @resumo,
      @conteudo,
      @data,
      @novo,
      @fixado,
      @tipo,
      @setor,
      @link_pdf
    )
  `);

  const transaction = db.transaction(() => {
    for (const item of gerais) {
      insert.run({
        id: item.id,
        titulo: item.titulo,
        tag: item.tag,
        resumo: item.resumo,
        conteudo: item.conteudo,
        data: item.data,
        novo: item.novo ? 1 : 0,
        fixado: item.fixado ? 1 : 0,
        tipo: item.tipo ?? "geral",
        setor: item.setor ?? null,
        link_pdf: item.linkPdf ?? null,
      });
    }

    for (const item of picking) {
      insert.run({
        id: item.id,
        titulo: item.titulo,
        tag: item.tag,
        resumo: item.resumo,
        conteudo: item.conteudo,
        data: item.data,
        novo: item.novo ? 1 : 0,
        fixado: item.fixado ? 1 : 0,
        tipo: "setor",
        setor: "picking",
        link_pdf: item.linkPdf ?? null,
      });
    }
  });

  transaction();
}

function initializeDatabase() {
  ensureDataDir();

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS comunicados (
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL,
      tag TEXT NOT NULL,
      resumo TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      data TEXT NOT NULL,
      novo INTEGER NOT NULL DEFAULT 1,
      fixado INTEGER NOT NULL DEFAULT 0,
      tipo TEXT NOT NULL DEFAULT 'geral',
      setor TEXT,
      link_pdf TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emails_recebidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      thread_id TEXT,
      mailbox TEXT NOT NULL,
      from_email TEXT NOT NULL,
      from_name TEXT,
      subject TEXT NOT NULL,
      snippet TEXT NOT NULL DEFAULT '',
      body_text TEXT NOT NULL DEFAULT '',
      body_html TEXT,
      received_at TEXT NOT NULL,
      processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'novo',
      has_attachments INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_emails_mailbox_received_at
    ON emails_recebidos (mailbox, received_at DESC);

    CREATE TABLE IF NOT EXISTS email_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id INTEGER NOT NULL,
      gmail_attachment_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(email_id, gmail_attachment_id),
      FOREIGN KEY (email_id) REFERENCES emails_recebidos(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id
    ON email_attachments (email_id);

    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_locks (
      lock_key TEXT PRIMARY KEY,
      expires_at TEXT NOT NULL
    );
  `);

  db.prepare(
    "UPDATE emails_recebidos SET status = 'nao_lido' WHERE status = 'novo'"
  ).run();
  db.prepare(
    "UPDATE comunicados SET setor = 'mercearia-picking' WHERE tipo = 'setor' AND setor = 'picking'"
  ).run();

  seedComunicados(db);

  return db;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }

  return dbInstance;
}

export function listComunicados(filters?: {
  tipo?: string;
  setor?: string;
}) {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (filters?.tipo) {
    conditions.push("tipo = @tipo");
    params.tipo = filters.tipo;
  }

  if (filters?.setor) {
    conditions.push("setor = @setor");
    params.setor = filters.setor;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const rows = db
    .prepare(
      `
      SELECT id, titulo, tag, resumo, conteudo, data, novo, fixado, tipo, setor, link_pdf
      FROM comunicados
      ${whereClause}
      ORDER BY fixado DESC, data DESC, id DESC
    `
    )
    .all(params) as ComunicadoRow[];

  return rows.map(mapComunicadoRow);
}

export function createComunicado(input: Omit<ComunicadoRecord, "id">) {
  const db = getDb();
  const result = db
    .prepare(
      `
      INSERT INTO comunicados (
        titulo,
        tag,
        resumo,
        conteudo,
        data,
        novo,
        fixado,
        tipo,
        setor,
        link_pdf
      ) VALUES (
        @titulo,
        @tag,
        @resumo,
        @conteudo,
        @data,
        @novo,
        @fixado,
        @tipo,
        @setor,
        @link_pdf
      )
    `
    )
    .run({
      titulo: input.titulo,
      tag: input.tag,
      resumo: input.resumo,
      conteudo: input.conteudo,
      data: input.data,
      novo: input.novo ? 1 : 0,
      fixado: input.fixado ? 1 : 0,
      tipo: input.tipo,
      setor: input.setor,
      link_pdf: input.linkPdf,
    });

  const row = db
    .prepare(
      `
      SELECT id, titulo, tag, resumo, conteudo, data, novo, fixado, tipo, setor, link_pdf
      FROM comunicados
      WHERE id = ?
    `
    )
    .get(result.lastInsertRowid) as ComunicadoRow;

  return mapComunicadoRow(row);
}

export function updateFixado(id: number, fixado: boolean) {
  const db = getDb();
  const result = db
    .prepare("UPDATE comunicados SET fixado = ? WHERE id = ?")
    .run(fixado ? 1 : 0, id);

  return result.changes > 0;
}

export function deleteComunicado(id: number) {
  const db = getDb();
  const result = db.prepare("DELETE FROM comunicados WHERE id = ?").run(id);
  return result.changes > 0;
}

export function listEmails(
  mailbox: string,
  options?: {
    limit?: number;
    status?: "todos" | "lido" | "nao_lido";
    query?: string;
    hasAttachments?: boolean;
  }
) {
  const db = getDb();
  const conditions = ["mailbox = @mailbox"];
  const params: Record<string, string | number> = {
    mailbox,
    limit: options?.limit ?? 100,
  };

  if (options?.status === "lido") {
    conditions.push("status = @status");
    params.status = "lido";
  }

  if (options?.status === "nao_lido") {
    conditions.push("status = @status");
    params.status = "nao_lido";
  }

  if (options?.query) {
    conditions.push(
      "(subject LIKE @query OR from_email LIKE @query OR from_name LIKE @query)"
    );
    params.query = `%${options.query}%`;
  }

  if (typeof options?.hasAttachments === "boolean") {
    conditions.push("has_attachments = @has_attachments");
    params.has_attachments = options.hasAttachments ? 1 : 0;
  }

  const rows = db
    .prepare(
      `
      SELECT
        id,
        message_id,
        thread_id,
        mailbox,
        from_email,
        from_name,
        subject,
        snippet,
        body_text,
        body_html,
        received_at,
        processed_at,
        status,
        has_attachments
      FROM emails_recebidos
      WHERE ${conditions.join(" AND ")}
      ORDER BY received_at DESC, id DESC
      LIMIT @limit
    `
    )
    .all(params) as EmailRow[];

  return rows.map(mapEmailRow);
}

export function getEmailById(id: number, mailbox: string) {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT
        id,
        message_id,
        thread_id,
        mailbox,
        from_email,
        from_name,
        subject,
        snippet,
        body_text,
        body_html,
        received_at,
        processed_at,
        status,
        has_attachments
      FROM emails_recebidos
      WHERE id = ? AND mailbox = ?
      LIMIT 1
    `
    )
    .get(id, mailbox) as EmailRow | undefined;

  return row ? mapEmailRow(row) : null;
}

export function upsertEmail(input: Omit<EmailRecord, "id" | "processedAt">) {
  const db = getDb();

  db.prepare(
    `
    INSERT INTO emails_recebidos (
      message_id,
      thread_id,
      mailbox,
      from_email,
      from_name,
      subject,
      snippet,
      body_text,
      body_html,
      received_at,
      processed_at,
      status,
      has_attachments
    ) VALUES (
      @message_id,
      @thread_id,
      @mailbox,
      @from_email,
      @from_name,
      @subject,
      @snippet,
      @body_text,
      @body_html,
      @received_at,
      CURRENT_TIMESTAMP,
      @status,
      @has_attachments
    )
    ON CONFLICT(message_id) DO UPDATE SET
      thread_id = excluded.thread_id,
      mailbox = excluded.mailbox,
      from_email = excluded.from_email,
      from_name = excluded.from_name,
      subject = excluded.subject,
      snippet = excluded.snippet,
      body_text = excluded.body_text,
      body_html = excluded.body_html,
      received_at = excluded.received_at,
      processed_at = CURRENT_TIMESTAMP,
      has_attachments = excluded.has_attachments
  `
  ).run({
    message_id: input.messageId,
    thread_id: input.threadId,
    mailbox: input.mailbox,
    from_email: input.fromEmail,
    from_name: input.fromName,
    subject: input.subject,
    snippet: input.snippet,
    body_text: input.bodyText,
    body_html: input.bodyHtml,
    received_at: input.receivedAt,
    status: input.status,
    has_attachments: input.hasAttachments ? 1 : 0,
  });

  const row = db
    .prepare(
      `
      SELECT
        id,
        message_id,
        thread_id,
        mailbox,
        from_email,
        from_name,
        subject,
        snippet,
        body_text,
        body_html,
        received_at,
        processed_at,
        status,
        has_attachments
      FROM emails_recebidos
      WHERE message_id = @message_id
      LIMIT 1
    `
    )
    .get({
      message_id: input.messageId,
    }) as EmailRow;

  return mapEmailRow(row);
}

export function updateEmailStatus(id: number, mailbox: string, status: "lido" | "nao_lido") {
  const db = getDb();
  const result = db
    .prepare(
      `
      UPDATE emails_recebidos
      SET status = ?, processed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND mailbox = ?
    `
    )
    .run(status, id, mailbox);

  return result.changes > 0;
}

export function getAppSetting(key: string) {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT setting_key, setting_value
      FROM app_settings
      WHERE setting_key = ?
    `
    )
    .get(key) as SettingRow | undefined;

  return row?.setting_value ?? null;
}

export function setAppSetting(key: string, value: string) {
  const db = getDb();
  db.prepare(
    `
    INSERT INTO app_settings (setting_key, setting_value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(setting_key) DO UPDATE SET
      setting_value = excluded.setting_value,
      updated_at = CURRENT_TIMESTAMP
  `
  ).run(key, value);
}

export function deleteAppSetting(key: string) {
  const db = getDb();
  db.prepare("DELETE FROM app_settings WHERE setting_key = ?").run(key);
}

export function tryAcquireLock(lockKey: string, ttlSeconds: number) {
  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

  const transaction = db.transaction(() => {
    const existing = db
      .prepare(
        `
        SELECT lock_key, expires_at
        FROM app_locks
        WHERE lock_key = ?
      `
      )
      .get(lockKey) as LockRow | undefined;

    if (!existing) {
      db.prepare(
        `
        INSERT INTO app_locks (lock_key, expires_at)
        VALUES (?, ?)
      `
      ).run(lockKey, expiresAt);
      return true;
    }

    if (new Date(existing.expires_at).getTime() <= now.getTime()) {
      db.prepare(
        `
        UPDATE app_locks
        SET expires_at = ?
        WHERE lock_key = ?
      `
      ).run(expiresAt, lockKey);
      return true;
    }

    return false;
  });

  return transaction();
}

export function releaseLock(lockKey: string) {
  const db = getDb();
  db.prepare("DELETE FROM app_locks WHERE lock_key = ?").run(lockKey);
}

export function upsertEmailAttachment(
  input: Omit<EmailAttachmentRecord, "id">
) {
  const db = getDb();
  db.prepare(
    `
    INSERT INTO email_attachments (
      email_id,
      gmail_attachment_id,
      filename,
      mime_type,
      storage_path,
      size
    ) VALUES (
      @email_id,
      @gmail_attachment_id,
      @filename,
      @mime_type,
      @storage_path,
      @size
    )
    ON CONFLICT(email_id, gmail_attachment_id) DO UPDATE SET
      filename = excluded.filename,
      mime_type = excluded.mime_type,
      storage_path = excluded.storage_path,
      size = excluded.size
  `
  ).run({
    email_id: input.emailId,
    gmail_attachment_id: input.gmailAttachmentId,
    filename: input.filename,
    mime_type: input.mimeType,
    storage_path: input.storagePath,
    size: input.size,
  });
}

export function listEmailAttachments(emailId: number) {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT
        id,
        email_id,
        gmail_attachment_id,
        filename,
        mime_type,
        storage_path,
        size
      FROM email_attachments
      WHERE email_id = ?
      ORDER BY filename ASC, id ASC
    `
    )
    .all(emailId) as EmailAttachmentRow[];

  return rows.map(mapEmailAttachmentRow);
}

export function getEmailAttachmentById(id: number) {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT
        id,
        email_id,
        gmail_attachment_id,
        filename,
        mime_type,
        storage_path,
        size
      FROM email_attachments
      WHERE id = ?
      LIMIT 1
    `
    )
    .get(id) as EmailAttachmentRow | undefined;

  return row ? mapEmailAttachmentRow(row) : null;
}
