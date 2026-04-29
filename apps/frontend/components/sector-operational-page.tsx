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
