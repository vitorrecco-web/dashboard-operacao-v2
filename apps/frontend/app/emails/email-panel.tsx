"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type EmailItem = {
  id: number;
  messageId: string;
  fromEmail: string;
  fromName: string | null;
  subject: string;
  receivedAt: string;
  status: string;
  hasAttachments: boolean;
};

type EmailPayload = {
  mailbox: string;
  provider: string;
  configured: boolean;
  hasRefreshToken: boolean;
  redirectUri: string;
  lastSyncAt: string | null;
  syncIntervalMinutes: number;
  autoSync?: {
    executed: boolean;
    reason: string;
    lastSyncAt: string | null;
  };
  emails: EmailItem[];
};

type StatusFilter = "todos" | "lido" | "nao_lido";
type AttachmentFilter = "todos" | "sim" | "nao";

function getStatusLabel(status: string) {
  if (status === "lido") return "LIDO";
  return "NAO LIDO";
}

export default function EmailPanel({ isAdmin }: { isAdmin: boolean }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<EmailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [attachmentFilter, setAttachmentFilter] =
    useState<AttachmentFilter>("todos");

  const loadEmails = useCallback(
    async (filters?: {
      search?: string;
      status?: StatusFilter;
      attachments?: AttachmentFilter;
    }) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        const effectiveSearch = filters?.search ?? search;
        const effectiveStatus = filters?.status ?? statusFilter;
        const effectiveAttachments = filters?.attachments ?? attachmentFilter;

        if (effectiveSearch.trim()) {
          params.set("q", effectiveSearch.trim());
        }

        params.set("status", effectiveStatus);

        if (effectiveAttachments !== "todos") {
          params.set("attachments", effectiveAttachments);
        }

        const queryString = params.toString();
        const response = await fetch(
          `/api/emails${queryString ? `?${queryString}` : ""}`,
          {
            cache: "no-store",
          }
        );
        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.erro || "Nao foi possivel carregar os e-mails.");
          return;
        }

        setData(payload);
      } catch {
        setError("Nao foi possivel carregar os e-mails.");
      } finally {
        setLoading(false);
      }
    },
    [attachmentFilter, search, statusFilter]
  );

  async function handleSync() {
    try {
      setSyncing(true);
      setError("");

      const response = await fetch("/api/emails/sync", {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.detalhe || payload?.erro || "Falha ao sincronizar.");
        return;
      }

      await loadEmails();
    } catch {
      setError("Falha ao sincronizar.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadEmails({
      search,
      status: statusFilter,
      attachments: attachmentFilter,
    });
  }, [attachmentFilter, loadEmails, search, statusFilter]);

  const gmailStatus = searchParams.get("gmail");
  const gmailReason = searchParams.get("motivo");

  return (
    <section
      style={{
        display: "grid",
        gap: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "8px",
          }}
        >
          <span className="tag" style={{ width: "fit-content" }}>
            SUPERVISAO
          </span>
          <h1 style={{ margin: 0 }}>E-mails da supervisao</h1>
        </div>

        {isAdmin ? (
          <button
            onClick={handleSync}
            className="botao"
            disabled={syncing}
            style={{
              border: "none",
              cursor: syncing ? "not-allowed" : "pointer",
              opacity: syncing ? 0.7 : 1,
            }}
          >
            {syncing ? "Sincronizando..." : "Sincronizar caixa"}
          </button>
        ) : null}
      </div>

      {data && isAdmin && !data.hasRefreshToken ? (
        <a
          href="/api/emails/oauth/start"
          className="botao"
          style={{ textDecoration: "none", display: "inline-flex", width: "fit-content" }}
        >
          Conectar Gmail
        </a>
      ) : null}

      {gmailStatus === "connected" ? (
        <p style={{ margin: 0, color: "#86efac", fontWeight: 700 }}>
          Conta conectada com sucesso. O refresh token foi salvo localmente.
        </p>
      ) : null}

      {gmailStatus === "error" ? (
        <p style={{ margin: 0, color: "#fca5a5", fontWeight: 700 }}>
          Falha ao conectar o Gmail: {gmailReason || "erro desconhecido"}.
        </p>
      ) : null}

      {error ? (
        <p style={{ margin: 0, color: "#fca5a5", fontWeight: 700 }}>
          {error}
        </p>
      ) : null}

      {data?.lastSyncAt ? (
        <p style={{ margin: 0, color: "#7dd3fc", fontSize: "14px", fontWeight: 700 }}>
          Ultima sincronizacao: {new Date(data.lastSyncAt).toLocaleString("pt-BR")}
        </p>
      ) : null}

      {!isAdmin && data?.configured ? (
        <p style={{ margin: 0, color: "#d7e0ea", fontSize: "14px" }}>
          A caixa e sincronizada automaticamente a cada {data.syncIntervalMinutes} minutos.
        </p>
      ) : null}

      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por assunto ou remetente"
            style={{
              flex: "1 1 260px",
              minWidth: "220px",
              maxWidth: "360px",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #1d3449",
              background: "#0b1a28",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            style={{
              flex: "0 1 180px",
              minWidth: "160px",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #1d3449",
              background: "#0b1a28",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="todos">Todos os status</option>
            <option value="nao_lido">Nao lidos</option>
            <option value="lido">Lidos</option>
          </select>

          <select
            value={attachmentFilter}
            onChange={(event) =>
              setAttachmentFilter(event.target.value as AttachmentFilter)
            }
            style={{
              flex: "0 1 200px",
              minWidth: "180px",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #1d3449",
              background: "#0b1a28",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="todos">Com e sem anexos</option>
            <option value="sim">Somente com anexos</option>
            <option value="nao">Somente sem anexos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <article className="card-setor">
          <h2>Carregando e-mails</h2>
          <p>Aguarde enquanto buscamos a caixa de supervisao.</p>
        </article>
      ) : data && data.emails.length > 0 ? (
        data.emails.map((email) => (
          <Link
            key={email.messageId}
            href={`/emails/${email.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              className="card-setor"
              style={{
                transition: "transform 0.2s ease, border-color 0.2s ease",
                cursor: "pointer",
                borderColor: email.status === "nao_lido" ? "#19c2a0" : undefined,
              }}
            >
              <div
                className="card-topo"
                style={{ justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}
              >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span className="badge">{getStatusLabel(email.status)}</span>
                  {email.hasAttachments ? <span className="badge">ANEXOS</span> : null}
                </div>

                <span style={{ color: "#7dd3fc", fontWeight: 700 }}>
                  {new Date(email.receivedAt).toLocaleString("pt-BR")}
                </span>
              </div>

              <h2>{email.subject}</h2>
              <p style={{ marginBottom: "16px" }}>
                <strong>De:</strong>{" "}
                {email.fromName ? `${email.fromName} <${email.fromEmail}>` : email.fromEmail}
              </p>
              <span
                style={{
                  color: "#7dd3fc",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Abrir e-mail completo
              </span>
            </article>
          </Link>
        ))
      ) : (
        <article className="card-setor">
          <h2>Nenhum e-mail encontrado</h2>
          <p>
            {data?.configured
              ? "Nenhum e-mail corresponde aos filtros atuais."
              : "Configure as credenciais do Gmail para iniciar a sincronizacao."}
          </p>
        </article>
      )}
    </section>
  );
}
