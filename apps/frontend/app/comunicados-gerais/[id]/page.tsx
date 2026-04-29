"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getComunicadoDestinationByKey } from "@/lib/comunicado-destinations";

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

type Props = {
  params: {
    id: string;
  };
  searchParams?: {
    origem?: string;
    dest?: string;
  };
};

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

export default function DetalheComunicadoPage({
  params,
  searchParams,
}: Props) {
  const [comunicado, setComunicado] = useState<Comunicado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const destinoKey = searchParams?.dest || "geral";
  const destination = getComunicadoDestinationByKey(destinoKey);
  const origem = searchParams?.origem;
  const backHref =
    origem === "central"
      ? "/central"
      : origem === "admin"
      ? `/admin/comunicados-gerais/gerenciar?dest=${destinoKey}`
      : "/comunicados-gerais";
  const backLabel =
    origem === "central"
      ? "Voltar para a central"
      : origem === "admin"
      ? "Voltar para gerenciamento"
      : "Voltar para comunicados";

  useEffect(() => {
    async function carregar() {
      if (!destination) {
        setComunicado(null);
        setCarregando(false);
        return;
      }

      try {
        const res = await fetch(destination.apiPath, {
          cache: "no-store",
        });

        const comunicados = await res.json();
        const id = Number(params.id);
        const encontrado =
          comunicados.find((item: Comunicado) => item.id === id) || null;

        setComunicado(encontrado);

        if (encontrado && origem !== "admin") {
          const dados = localStorage.getItem("comunicadosLidos");
          const lidos = dados ? JSON.parse(dados) : [];

          if (!lidos.includes(encontrado.id)) {
            const novosLidos = [...lidos, encontrado.id];
            localStorage.setItem("comunicadosLidos", JSON.stringify(novosLidos));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar comunicado:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [destination, origem, params.id]);

  if (carregando) {
    return (
      <main className="pagina">
        <p>Carregando comunicado...</p>
      </main>
    );
  }

  if (!comunicado) {
    return (
      <main className="pagina">
        <div className="hero">
          <span className="tag">COMUNICADO</span>
          <h1>Comunicado nao encontrado</h1>
          <p>O aviso que voce tentou acessar nao existe ou foi removido.</p>
        </div>

        <Link href={backHref} style={{ textDecoration: "none", color: "inherit" }}>
          <button className="botao">{backLabel}</button>
        </Link>
      </main>
    );
  }

  return (
    <main className="pagina">
      <div style={{ marginBottom: "24px" }}>
        <Link href={backHref} style={{ textDecoration: "none", color: "inherit" }}>
          <button className="botao">{backLabel}</button>
        </Link>
      </div>

      <section
        style={{
          background: "#102132",
          border: "1px solid #1d3449",
          borderRadius: "18px",
          padding: "32px",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <span className="badge">{comunicado.tag}</span>
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "42px",
            color: "#f5f7fa",
          }}
        >
          {comunicado.titulo}
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "#7dd3fc",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {formatarData(comunicado.data)}
        </p>

        <div
          style={{
            color: "#d7e0ea",
            fontSize: "18px",
            lineHeight: 1.8,
            whiteSpace: "pre-line",
          }}
        >
          {comunicado.conteudo}
        </div>

        {comunicado.linkPdf ? (
          <div style={{ marginTop: "24px" }}>
            <a
              href={comunicado.linkPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="botao"
              style={{ textDecoration: "none" }}
            >
              Abrir PDF anexo
            </a>
          </div>
        ) : null}
      </section>
    </main>
  );
}
