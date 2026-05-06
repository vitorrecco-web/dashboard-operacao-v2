"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SectorDefinition } from "@/lib/sector-config";
import { useAutoRefresh } from "@/components/use-auto-refresh";

type Comunicado = {
  id: number;
  titulo: string;
  tag: string;
  resumo: string;
  conteudo: string;
  data: string;
  novo: boolean;
  fixado: boolean;
  linkPdf: string | null;
};

type SectorDriveDocument = {
  id: string;
  name: string;
  modifiedTime: string | null;
  size: number | null;
  openUrl: string;
};

const SECTOR_REFRESH_INTERVAL_MS = 30000;

function getDocumentsCacheKey(areaKey: string, sectorKey: string) {
  return `sector-documents:${areaKey}:${sectorKey}`;
}

function PdfFolderIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="6" y="12" width="40" height="28" rx="8" fill="#15314A" />
      <path
        d="M14 16.5H23.5L27 20H38C39.6569 20 41 21.3431 41 23V34C41 35.6569 39.6569 37 38 37H14C12.3431 37 11 35.6569 11 34V19.5C11 17.8431 12.3431 16.5 14 16.5Z"
        fill="#1FC9B2"
      />
      <rect x="16" y="24" width="20" height="10" rx="3" fill="#0B1A28" />
      <path
        d="M20.4 31V26.8H22.57C23.61 26.8 24.26 27.38 24.26 28.34C24.26 29.31 23.61 29.89 22.57 29.89H21.56V31H20.4ZM21.56 28.98H22.33C22.8 28.98 23.08 28.76 23.08 28.34C23.08 27.93 22.8 27.71 22.33 27.71H21.56V28.98Z"
        fill="#F5F7FA"
      />
      <path
        d="M25.06 31V26.8H26.9C28.18 26.8 29.03 27.61 29.03 28.9C29.03 30.19 28.18 31 26.9 31H25.06ZM26.22 30.03H26.76C27.42 30.03 27.84 29.61 27.84 28.9C27.84 28.19 27.42 27.77 26.76 27.77H26.22V30.03Z"
        fill="#F5F7FA"
      />
      <path
        d="M29.96 31V26.8H33.08V27.75H31.12V28.51H32.85V29.42H31.12V31H29.96Z"
        fill="#F5F7FA"
      />
    </svg>
  );
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function abreviarNomeDocumento(nome: string) {
  const semExtensao = nome.replace(/\.pdf$/i, "").replace(/\.docx$/i, "");

  if (semExtensao.length <= 28) {
    return semExtensao;
  }

  return `${semExtensao.slice(0, 25)}...`;
}

export default function SectorOperationalPage({
  sector,
  backHref = `/area/${sector.areaKey}`,
}: {
  sector: SectorDefinition;
  backHref?: string;
}) {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [documents, setDocuments] = useState<SectorDriveDocument[]>([]);
  const [documentsMessage, setDocumentsMessage] = useState<string | null>(null);
  const [comunicadosLoading, setComunicadosLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const comunicadosLoadedRef = useRef(false);
  const documentsLoadedRef = useRef(false);
  const documentsRef = useRef<SectorDriveDocument[]>([]);
  const documentsCacheKey = getDocumentsCacheKey(sector.areaKey, sector.sectorKey);

  useEffect(() => {
    comunicadosLoadedRef.current = false;
    documentsLoadedRef.current = false;
    documentsRef.current = [];
    setComunicados([]);
    setDocuments([]);
    setDocumentsMessage(null);
    setComunicadosLoading(true);
    setDocumentsLoading(true);

    try {
      const cachedValue = window.localStorage.getItem(documentsCacheKey);

      if (!cachedValue) {
        return;
      }

      const cachedDocuments = JSON.parse(cachedValue) as SectorDriveDocument[];

      if (Array.isArray(cachedDocuments) && cachedDocuments.length > 0) {
        documentsRef.current = cachedDocuments;
        documentsLoadedRef.current = true;
        setDocuments(cachedDocuments);
        setDocumentsLoading(false);
      }
    } catch {
      window.localStorage.removeItem(documentsCacheKey);
    }
  }, [documentsCacheKey, sector.areaKey, sector.sectorKey]);

  const carregarComunicados = useCallback(async () => {
    try {
      if (!comunicadosLoadedRef.current) {
        setComunicadosLoading(true);
      }

      const res = await fetch(
        `/api/setor-comunicados/${sector.areaKey}/${sector.sectorKey}`,
        {
          cache: "no-store",
        }
      );

      const data = (await res.json()) as unknown;

      if (!res.ok) {
        setComunicados([]);
        return;
      }

      setComunicados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`Erro ao carregar comunicados de ${sector.sectorNome}:`, error);
      setComunicados([]);
    } finally {
      comunicadosLoadedRef.current = true;
      setComunicadosLoading(false);
    }
  }, [sector.areaKey, sector.sectorKey, sector.sectorNome]);

  const carregarDocumentos = useCallback(async () => {
    try {
      if (!documentsLoadedRef.current) {
        setDocumentsLoading(true);
      }

      const res = await fetch(
        `/api/setor-documentos/${sector.areaKey}/${sector.sectorKey}`,
        {
          cache: "no-store",
        }
      );

      const data = (await res.json()) as {
        documents?: SectorDriveDocument[];
        reason?: string | null;
        erro?: string;
      };

      if (!res.ok) {
        if (documentsRef.current.length === 0) {
          setDocuments([]);
          setDocumentsMessage(
            data.reason ??
              data.erro ??
              "Nao foi possivel consultar os PDFs deste setor no Google Drive."
          );
        }
        return;
      }

      const nextDocuments = Array.isArray(data.documents) ? data.documents : [];
      documentsRef.current = nextDocuments;
      setDocuments(nextDocuments);
      setDocumentsMessage(data.reason ?? null);

      if (nextDocuments.length > 0) {
        window.localStorage.setItem(documentsCacheKey, JSON.stringify(nextDocuments));
      } else {
        window.localStorage.removeItem(documentsCacheKey);
      }
    } catch (error) {
      console.error(`Erro ao carregar documentos de ${sector.sectorNome}:`, error);
      if (documentsRef.current.length === 0) {
        setDocuments([]);
        setDocumentsMessage("Nao foi possivel consultar os PDFs deste setor no Google Drive.");
      }
    } finally {
      documentsLoadedRef.current = true;
      setDocumentsLoading(false);
    }
  }, [documentsCacheKey, sector.areaKey, sector.sectorKey, sector.sectorNome]);

  useAutoRefresh(carregarComunicados, { intervalMs: SECTOR_REFRESH_INTERVAL_MS });
  useAutoRefresh(carregarDocumentos, { intervalMs: SECTOR_REFRESH_INTERVAL_MS });

  function formatarDataHora(data?: string | null) {
    if (!data) {
      return "Sem data";
    }

    const parsed = new Date(data);

    if (Number.isNaN(parsed.getTime())) {
      return "Sem data";
    }

    return parsed.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatarTamanho(size?: number | null) {
    if (!size || size <= 0) {
      return null;
    }

    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <main className="pagina">
      <Link href={backHref} className="voltar">
        Voltar
      </Link>

      <section className="hero" style={{ marginBottom: "28px" }}>
        <span className="tag">SETOR</span>
        <h1>{sector.sectorNome}</h1>
        <p>{sector.descricao}</p>
      </section>

      <section
        style={{
          background: "#102132",
          border: "1px solid #1d3449",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
          marginBottom: "28px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <span className="badge">PDFS DO SETOR</span>
          <h2 style={{ marginTop: "12px", marginBottom: "6px", color: "#f5f7fa" }}>
            DOCUMENTOS - {sector.sectorNome.toUpperCase()}
          </h2>
          <p style={{ margin: 0, color: "#d7e0ea", lineHeight: 1.6 }}>
            Esta lista mostra somente os PDFs cadastrados na pasta deste setor no Google Drive.
          </p>
        </div>

        {documentsMessage ? (
          <div
            style={{
              marginBottom: documents.length > 0 ? "16px" : "0",
              padding: "18px",
              borderRadius: "14px",
              border: "1px solid rgba(125, 211, 252, 0.18)",
              background: "#0b1a28",
              color: "#d7e0ea",
            }}
          >
            {documentsMessage}
          </div>
        ) : null}

        {documentsLoading ? (
          <div
            style={{
              padding: "28px",
              border: "1px dashed #29445b",
              borderRadius: "16px",
              color: "#d7e0ea",
            }}
          >
            Carregando PDFs do setor...
          </div>
        ) : documents.length === 0 ? (
          <div
            style={{
              padding: "28px",
              border: "1px dashed #29445b",
              borderRadius: "16px",
              color: "#d7e0ea",
            }}
          >
            Nenhum PDF encontrado para este setor ainda.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(118px, 132px))",
              gap: "18px 16px",
            }}
          >
            {documents.map((item) => (
              <a
                key={item.id}
                href={item.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  minHeight: "unset",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <PdfFolderIcon />
                <div
                  style={{
                    display: "grid",
                    gap: "4px",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#f5f7fa",
                      fontSize: "12px",
                      lineHeight: 1.35,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                    title={item.name}
                  >
                    {abreviarNomeDocumento(item.name)}
                  </h3>
                  <div
                    style={{
                      color: "#9fb3c8",
                      fontSize: "11px",
                      lineHeight: 1.4,
                    }}
                  >
                    <div>{formatarDataHora(item.modifiedTime)}</div>
                    {formatarTamanho(item.size) ? <div>{formatarTamanho(item.size)}</div> : null}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          background: "#102132",
          border: "1px solid #1d3449",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <span className="badge">MUDANCAS DO SETOR</span>
          <h2 style={{ marginTop: "12px", marginBottom: "6px", color: "#f5f7fa" }}>
            Comunicados e alteracoes recentes
          </h2>
        </div>

        {comunicadosLoading ? (
          <div
            style={{
              padding: "28px",
              border: "1px dashed #29445b",
              borderRadius: "16px",
              color: "#d7e0ea",
            }}
          >
            Carregando comunicados...
          </div>
        ) : comunicados.length === 0 ? (
          <div
            style={{
              padding: "28px",
              border: "1px dashed #29445b",
              borderRadius: "16px",
              color: "#d7e0ea",
            }}
          >
            Nenhum comunicado publicado ainda.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {comunicados.map((item) => (
              <article
                key={item.id}
                style={{
                  background: "#0b1a28",
                  border: item.fixado ? "1px solid #19c2a0" : "1px solid #1d3449",
                  borderRadius: "16px",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <span className="badge">{item.tag}</span>
                      {item.novo ? (
                        <span style={{ color: "#19c2a0", fontWeight: "bold" }}>Novo</span>
                      ) : null}
                      {item.fixado ? (
                        <span style={{ color: "#19c2a0", fontWeight: "bold" }}>Fixado</span>
                      ) : null}
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        color: "#f5f7fa",
                        fontSize: "24px",
                        lineHeight: 1.25,
                      }}
                    >
                      {item.titulo}
                    </h3>
                  </div>

                  <span
                    style={{
                      color: "#7dd3fc",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    {formatarData(item.data)}
                  </span>
                </div>

                <p style={{ margin: "0 0 12px", color: "#d7e0ea", lineHeight: 1.6 }}>
                  {item.resumo}
                </p>

                <div
                  style={{
                    color: "#b8c7d6",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    fontSize: "15px",
                  }}
                >
                  {item.conteudo}
                </div>

                {item.linkPdf ? (
                  <div style={{ marginTop: "16px" }}>
                    <a
                      href={item.linkPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="botao"
                      style={{ textDecoration: "none" }}
                    >
                      Abrir arquivo
                    </a>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
