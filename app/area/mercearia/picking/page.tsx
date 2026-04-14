"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Comunicado = {
  id: number;
  titulo: string;
  tag: string;
  resumo: string;
  conteudo: string;
  data: string;
  novo: boolean;
  fixado: boolean;
  linkPdf: string;
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function PickingPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/comunicados-picking", {
          cache: "no-store",
        });

        const data = await res.json();
        setComunicados(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar comunicados do Picking:", error);
        setComunicados([]);
      }
    }

    carregar();
  }, []);

  return (
    <main className="pagina">
      <Link href="/area/mercearia" className="voltar">
        ← Voltar
      </Link>

      <section className="hero" style={{ marginBottom: "28px" }}>
        <span className="tag">SETOR</span>
        <h1>Picking</h1>
        <p>
          Consulte mudanças de processo e materiais operacionais do setor de
          Picking.
        </p>
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
          <span className="badge">MUDANÇAS DO SETOR</span>
          <h2 style={{ marginTop: "12px", marginBottom: "6px", color: "#f5f7fa" }}>
            Comunicados e alterações recentes
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

                      {item.novo && (
                        <span style={{ color: "#19c2a0", fontWeight: "bold" }}>
                          ● Novo
                        </span>
                      )}

                      {item.fixado && (
                        <span style={{ color: "#19c2a0", fontWeight: "bold" }}>
                          📌 Fixado
                        </span>
                      )}
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

                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#d7e0ea",
                    lineHeight: 1.6,
                  }}
                >
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

                {item.linkPdf && (
                  <div style={{ marginTop: "16px" }}>
                    <a
                      href={item.linkPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="botao"
                      style={{ textDecoration: "none" }}
                    >
                      Abrir PDF
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}