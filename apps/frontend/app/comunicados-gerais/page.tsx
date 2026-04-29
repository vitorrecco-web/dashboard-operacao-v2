"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const TODAS_AS_TAGS = "Todas as tags";

type Comunicado = {
  id: number;
  titulo: string;
  tag: string;
  resumo: string;
  conteudo: string;
  data: string;
  novo: boolean;
  linkPdf: string | null;
};

type Props = {
  searchParams?: {
    origem?: string;
  };
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function getComunicadosLidos(): number[] {
  if (typeof window === "undefined") return [];

  const dados = localStorage.getItem("comunicadosLidos");
  if (!dados) return [];

  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

export default function ComunicadosGeraisPage({ searchParams }: Props) {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [filtroLeitura, setFiltroLeitura] = useState<
    "todos" | "lidos" | "nao-lidos"
  >("todos");
  const [tagSelecionada, setTagSelecionada] = useState(TODAS_AS_TAGS);
  const [lidos, setLidos] = useState<number[]>([]);

  const veioDoAdmin = searchParams?.origem === "admin";

  useEffect(() => {
    async function carregarComunicados() {
      try {
        const res = await fetch("/api/comunicados", {
          cache: "no-store",
        });

        const data = await res.json();
        setComunicados(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar comunicados:", error);
      }
    }

    carregarComunicados();
    setLidos(getComunicadosLidos());
  }, []);

  const tagsDisponiveis = [
    TODAS_AS_TAGS,
    ...Array.from(new Set(comunicados.map((item) => item.tag))),
  ];

  const comunicadosFiltrados = useMemo(() => {
    return comunicados.filter((item) => {
      const isLido = lidos.includes(item.id);

      if (filtroLeitura === "lidos" && !isLido) return false;
      if (filtroLeitura === "nao-lidos" && isLido) return false;
      if (tagSelecionada !== TODAS_AS_TAGS && item.tag !== tagSelecionada) {
        return false;
      }

      return true;
    });
  }, [comunicados, filtroLeitura, tagSelecionada, lidos]);

  return (
    <main className="pagina">
      <div style={{ marginBottom: "24px" }}>
        <Link
          href={veioDoAdmin ? "/admin" : "/"}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <button className="botao">
            {veioDoAdmin ? "Voltar para o admin" : "Voltar para o painel"}
          </button>
        </Link>
      </div>

      <div className="hero" style={{ marginBottom: "28px" }}>
        <span className="tag">PAINEL INTERNO</span>
        <h1>Comunicados Gerais</h1>
        <p>
          Consulte os avisos mais recentes da operacao e acompanhe atualizacoes
          importantes.
        </p>
      </div>

      <section
        style={{
          background: "#102132",
          border: "1px solid #1d3449",
          borderRadius: "20px",
          padding: "22px",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
        }}
      >
        <div
          style={{
            marginBottom: "22px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="botao"
              onClick={() => setFiltroLeitura("todos")}
              style={{
                opacity: filtroLeitura === "todos" ? 1 : 0.7,
                outline:
                  filtroLeitura === "todos" ? "2px solid #7dd3fc" : "none",
              }}
            >
              Todos
            </button>

            <button
              className="botao"
              onClick={() => setFiltroLeitura("lidos")}
              style={{
                opacity: filtroLeitura === "lidos" ? 1 : 0.7,
                outline:
                  filtroLeitura === "lidos" ? "2px solid #7dd3fc" : "none",
              }}
            >
              Lidos
            </button>

            <button
              className="botao"
              onClick={() => setFiltroLeitura("nao-lidos")}
              style={{
                opacity: filtroLeitura === "nao-lidos" ? 1 : 0.7,
                outline:
                  filtroLeitura === "nao-lidos" ? "2px solid #7dd3fc" : "none",
              }}
            >
              Nao lidos
            </button>
          </div>

          <select
            value={tagSelecionada}
            onChange={(event) => setTagSelecionada(event.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#0b1a28",
              color: "#f5f7fa",
              border: "1px solid #1d3449",
              fontWeight: "bold",
              minWidth: "220px",
              cursor: "pointer",
            }}
          >
            {tagsDisponiveis.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {comunicadosFiltrados.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              border: "1px dashed #1d3449",
              borderRadius: "16px",
              color: "#d7e0ea",
            }}
          >
            <h2 style={{ marginBottom: "8px" }}>Nenhum comunicado encontrado</h2>
            <p>Nao ha comunicados disponiveis para esse filtro no momento.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {comunicadosFiltrados.map((item) => {
              const isLido = lidos.includes(item.id);

              return (
                <Link
                  key={item.id}
                  href={`/comunicados-gerais/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 130px",
                      gap: "18px",
                      alignItems: "center",
                      background: isLido ? "#0e1d2b" : "#11263a",
                      border: isLido ? "1px solid #1d3449" : "1px solid #19c2a0",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      transition: "0.2s ease",
                      boxShadow: isLido
                        ? "none"
                        : "0 0 0 1px rgba(25, 194, 160, 0.08)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            background: "#12385d",
                            color: "#7dd3fc",
                            fontSize: "12px",
                            fontWeight: "bold",
                            padding: "6px 10px",
                            borderRadius: "999px",
                          }}
                        >
                          {item.tag}
                        </span>

                        {!isLido ? (
                          <span
                            style={{
                              color: "#19c2a0",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >
                            Novo
                          </span>
                        ) : null}

                        {item.linkPdf ? (
                          <span
                            style={{
                              color: "#7dd3fc",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >
                            PDF
                          </span>
                        ) : null}
                      </div>

                      <h2
                        style={{
                          margin: "0 0 8px",
                          color: "#f5f7fa",
                          fontSize: "30px",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.titulo}
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#d7e0ea",
                          fontSize: "18px",
                          lineHeight: 1.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.resumo}
                      </p>

                      {item.linkPdf ? (
                        <span
                          style={{
                            display: "inline-flex",
                            marginTop: "12px",
                            color: "#7dd3fc",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          Abrir PDF anexo
                        </span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        color: "#7dd3fc",
                        fontSize: "14px",
                        fontWeight: "bold",
                        alignSelf: "start",
                        paddingTop: "6px",
                      }}
                    >
                      {formatarData(item.data)}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
