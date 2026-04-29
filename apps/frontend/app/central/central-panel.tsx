"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type CentralItem = {
  id: string;
  source: "comunicado" | "email";
  sourceLabel: string;
  title: string;
  summary: string;
  secondaryText: string;
  date: string;
  isUnread: boolean;
  isPinned: boolean;
  hasAttachments: boolean;
  href: string;
};

type CentralPayload = {
  mailbox: string;
  provider: string;
  configured: boolean;
  hasClientCredentials: boolean;
  hasRefreshToken: boolean;
  redirectUri: string;
  lastSyncAt: string | null;
  oauthIssue: string | null;
  connectedAt: string | null;
  syncIntervalMinutes: number;
  autoSync?: {
    executed: boolean;
    reason: string;
    lastSyncAt: string | null;
  };
  items: CentralItem[];
};

type SourceFilter = "todos" | "comunicados" | "emails";
type AttachmentFilter = "todos" | "sim";

function getBadgeLabel(item: CentralItem) {
  if (item.source === "email") {
    return item.isUnread ? "E-MAIL NOVO" : "E-MAIL";
  }

  return item.isPinned ? "COMUNICADO FIXADO" : "COMUNICADO";
}

export default function CentralPanel({ isAdmin }: { isAdmin: boolean }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<CentralPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("todos");
  const [attachmentFilter, setAttachmentFilter] =
    useState<AttachmentFilter>("todos");

  const autoRefreshMs = useMemo(() => {
    if (!data?.configured) {
      return null;
    }

    const intervalMinutes = Math.max(data.syncIntervalMinutes || 5, 1);
    return intervalMinutes * 60 * 1000;
  }, [data?.configured, data?.syncIntervalMinutes]);

  const loadItems = useCallback(
    async (filters?: {
      search?: string;
      source?: SourceFilter;
      attachments?: AttachmentFilter;
    }) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        const effectiveSearch = filters?.search ?? search;
        const effectiveSource = filters?.source ?? sourceFilter;
        const effectiveAttachments = filters?.attachments ?? attachmentFilter;

        if (effectiveSearch.trim()) {
          params.set("q", effectiveSearch.trim());
        }

        if (effectiveSource !== "todos") {
          params.set("source", effectiveSource);
        }

        if (effectiveAttachments === "sim") {
          params.set("attachments", "sim");
        }

        const queryString = params.toString();
        const response = await fetch(
          `/api/central${queryString ? `?${queryString}` : ""}`,
          {
            cache: "no-store",
          }
        );
        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.erro || "Nao foi possivel carregar a central.");
          return;
        }

        setData(payload);
      } catch {
        setError("Nao foi possivel carregar a central.");
      } finally {
        setLoading(false);
      }
    },
    [attachmentFilter, search, sourceFilter]
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
        setError(
          payload?.detalhe ||
            payload?.erro ||
            "Falha ao sincronizar os e-mails da caixa."
        );
        return;
      }

      await loadItems();
    } catch {
      setError("Falha ao sincronizar os e-mails da caixa.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleReconnectGmail() {
    try {
      setError("");

      await fetch("/api/emails/oauth", {
        method: "POST",
      });

      window.location.href = "/api/emails/oauth/start";
    } catch {
      setError("Nao foi possivel reiniciar a conexao com o Gmail.");
    }
  }

  useEffect(() => {
    loadItems({
      search,
      source: sourceFilter,
      attachments: attachmentFilter,
    });
  }, [attachmentFilter, loadItems, search, sourceFilter]);

  useEffect(() => {
    if (!autoRefreshMs) {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadItems();
    }, autoRefreshMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoRefreshMs, loadItems]);

  const gmailStatus = searchParams.get("gmail");
  const gmailReason = searchParams.get("motivo");
  const hasSavedEmails =
    Boolean(data?.items.some((item) => item.source === "email"));

  return (
    <section style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: "8px" }}>
          <span className="tag" style={{ width: "fit-content" }}>
            SUPERVISAO
          </span>
          <h1 style={{ margin: 0 }}>Central da Supervisao</h1>
          <p style={{ margin: 0, color: "#b8c4d1", maxWidth: "720px" }}>
            Um unico fluxo com comunicados do admin e e-mails da caixa da
            supervisao, no mesmo formato de leitura.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={handleSync}
            className="botao"
            disabled={syncing || !data?.configured}
            style={{
              border: "none",
              cursor: syncing || !data?.configured ? "not-allowed" : "pointer",
              opacity: syncing || !data?.configured ? 0.7 : 1,
            }}
          >
            {syncing ? "Sincronizando..." : "Sincronizar agora"}
          </button>
        ) : null}
      </div>

      {data && isAdmin && data.hasClientCredentials ? (
        data.hasRefreshToken ? (
          <button
            onClick={handleReconnectGmail}
            className="botao"
            style={{
              border: "none",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Reconectar Gmail
          </button>
        ) : (
          <a
            href="/api/emails/oauth/start"
            className="botao"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              width: "fit-content",
            }}
          >
            Conectar Gmail
          </a>
        )
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
        <p style={{ margin: 0, color: "#fca5a5", fontWeight: 700 }}>{error}</p>
      ) : null}

      {data?.oauthIssue ? (
        <article
          style={{
            background: "#2a1620",
            border: "1px solid #6b2232",
            borderRadius: "18px",
            padding: "18px 20px",
            display: "grid",
            gap: "8px",
          }}
        >
          <strong style={{ color: "#fca5a5" }}>
            A conexao com o Gmail ainda nao foi concluida.
          </strong>
          <span style={{ color: "#f8d7da", lineHeight: 1.6 }}>
            {data.oauthIssue}
          </span>
        </article>
      ) : null}

      {data && !data.configured ? (
        <article
          style={{
            background: "#102132",
            border: "1px solid #29445b",
            borderRadius: "18px",
            padding: "18px 20px",
            display: "grid",
            gap: "8px",
          }}
        >
          <strong style={{ color: "#f8c68a" }}>
            Integracao do Gmail ainda nao configurada.
          </strong>
          <span style={{ color: "#d7e0ea", lineHeight: 1.6 }}>
            {data.hasClientCredentials
              ? "As credenciais do app ja existem. Agora falta conectar a conta do Gmail para liberar a sincronizacao."
              : "Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no ambiente para iniciar a integracao com o Gmail."}{" "}
            {hasSavedEmails
              ? "Os e-mails ja salvos continuam aparecendo normalmente."
              : "Enquanto isso, a central continua exibindo os comunicados do painel."}
          </span>
        </article>
      ) : null}

      {data?.lastSyncAt ? (
        <p style={{ margin: 0, color: "#7dd3fc", fontSize: "14px", fontWeight: 700 }}>
          Ultima sincronizacao: {new Date(data.lastSyncAt).toLocaleString("pt-BR")}
        </p>
      ) : null}

      {data?.connectedAt ? (
        <p style={{ margin: 0, color: "#b8c4d1", fontSize: "14px" }}>
          Conta Gmail conectada em {new Date(data.connectedAt).toLocaleString("pt-BR")}.
        </p>
      ) : null}

      {data?.configured ? (
        <p style={{ margin: 0, color: "#b8c4d1", fontSize: "14px" }}>
          A sincronizacao acontece automaticamente a cada {data.syncIntervalMinutes} minutos
          enquanto a central estiver em uso. O botao manual fica disponivel apenas como apoio.
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
            placeholder="Buscar por assunto, remetente ou comunicado"
            style={{
              flex: "1 1 280px",
              minWidth: "220px",
              maxWidth: "380px",
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
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as SourceFilter)}
            style={{
              flex: "0 1 190px",
              minWidth: "170px",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #1d3449",
              background: "#0b1a28",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="todos">Tudo</option>
            <option value="comunicados">Somente comunicados</option>
            <option value="emails">Somente e-mails</option>
          </select>

          <select
            value={attachmentFilter}
            onChange={(event) =>
              setAttachmentFilter(event.target.value as AttachmentFilter)
            }
            style={{
              flex: "0 1 190px",
              minWidth: "170px",
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
          </select>
        </div>
      </div>

      {loading ? (
        <article className="card-setor">
          <h2>Carregando atualizacoes</h2>
          <p>Aguarde enquanto buscamos a central da supervisao.</p>
        </article>
      ) : data && data.items.length > 0 ? (
        data.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              className="card-setor"
              style={{
                transition: "transform 0.2s ease, border-color 0.2s ease",
                cursor: "pointer",
                borderColor: item.isUnread ? "#19c2a0" : "#1d3449",
                minHeight: "unset",
              }}
            >
              <div
                className="card-topo"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span className="badge">{getBadgeLabel(item)}</span>
                  {item.isUnread ? <span className="badge">NAO LIDO</span> : null}
                  {item.isPinned ? <span className="badge">FIXADO</span> : null}
                  {item.hasAttachments ? <span className="badge">ANEXOS</span> : null}
                </div>

                <span style={{ color: "#7dd3fc", fontWeight: 700 }}>
                  {new Date(item.date).toLocaleString("pt-BR")}
                </span>
              </div>

              <h2>{item.title}</h2>
              <p style={{ marginBottom: "10px" }}>{item.summary}</p>
              <span
                style={{
                  color: "#7dd3fc",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {item.sourceLabel}: {item.secondaryText}
              </span>
            </article>
          </Link>
        ))
      ) : (
        <article className="card-setor">
          <h2>Nenhuma atualizacao encontrada</h2>
          <p>
            Ajuste os filtros ou sincronize a caixa para trazer novos e-mails
            para a central.
          </p>
        </article>
      )}
    </section>
  );
}
