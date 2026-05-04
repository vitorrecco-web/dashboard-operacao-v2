"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SectorDefinition } from "@/lib/sector-config";

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

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
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

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(
          `/api/setor-comunicados/${sector.areaKey}/${sector.sectorKey}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();
        setComunicados(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(`Erro ao carregar comunicados de ${sector.sectorNome}:`, error);
        setComunicados([]);
      }
    }

    carregar();
  }, [sector.areaKey, sector.sectorKey, sector.sectorNome]);

  useEffect(() => {
    async function carregarDocumentos() {
      try {
        const res = await fetch(
          `/api/setor-documentos/${sector.areaKey}/${sector.sectorKey}`,
          {
            cache: "no-store",
          }
        );

        const data = (await res.json()) as {
          documents?: SectorDriveDocument[];
          reason?: string | null;
        };

        setDocuments(Array.isArray(data.documents) ? data.documents : []);
        setDocumentsMessage(data.reason ?? null);
      } catch (error) {
        console.error(`Erro ao carregar documentos de ${sector.sectorNome}:`, error);
        setDocuments([]);
        setDocumentsMessage("Nao foi possivel consultar os PDFs deste setor no Google Drive.");
      }
    }

    carregarDocumentos();
  }, [sector.areaKey, sector.sectorKey, sector.sectorNome]);

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
            Documentos da pasta {sector.areaNome} - {sector.sectorNome}
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

        {documents.length === 0 ? (
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
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {documents.map((item) => (
              <article
                key={item.id}
                style={{
                  background: "#0b1a28",
                  border: "1px solid #1d3449",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: "220px", flex: 1 }}>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: "#f5f7fa",
                      fontSize: "20px",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                      color: "#9fb3c8",
                      fontSize: "14px",
                    }}
                  >
                    <span>Atualizado em {formatarDataHora(item.modifiedTime)}</span>
                    {formatarTamanho(item.size) ? (
                      <span>{formatarTamanho(item.size)}</span>
                    ) : null}
                  </div>
                </div>

                <a
                  href={item.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="botao"
                  style={{ textDecoration: "none" }}
                >
                  Abrir PDF
                </a>
              </article>
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

        {comunicados.length === 0 ? (
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
