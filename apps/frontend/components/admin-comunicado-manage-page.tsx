"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllComunicadoDestinations,
  getComunicadoDestinationByKey,
} from "@/lib/comunicado-destinations";

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

export default function AdminComunicadoManagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinations = useMemo(() => getAllComunicadoDestinations(), []);
  const searchDest = searchParams.get("dest") || "geral";

  const [destinoKey, setDestinoKey] = useState(searchDest);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [carregando, setCarregando] = useState(true);

  const destination = useMemo(
    () =>
      getComunicadoDestinationByKey(destinoKey) ||
      getComunicadoDestinationByKey("geral"),
    [destinoKey]
  );

  useEffect(() => {
    setDestinoKey(searchDest);
  }, [searchDest]);

  const carregarComunicados = useCallback(async () => {
    if (!destination) {
      setComunicados([]);
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      const resposta = await fetch(destination.apiPath, { cache: "no-store" });
      const dados = await resposta.json();
      setComunicados(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar comunicados:", error);
      setComunicados([]);
    } finally {
      setCarregando(false);
    }
  }, [destination]);

  async function alterarFixacao(id: number, fixado: boolean) {
    if (!destination) return;

    try {
      await fetch(destination.apiPath, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          acao: fixado ? "desfixar" : "fixar",
        }),
      });

      await carregarComunicados();
    } catch (error) {
      console.error("Erro ao alterar fixacao:", error);
    }
  }

  async function apagarComunicado(id: number) {
    if (!destination) return;

    const confirmar = window.confirm("Deseja realmente apagar este comunicado?");
    if (!confirmar) return;

    try {
      await fetch(`${destination.apiPath}?id=${id}`, {
        method: "DELETE",
      });

      await carregarComunicados();
    } catch (error) {
      console.error("Erro ao apagar comunicado:", error);
    }
  }

  useEffect(() => {
    carregarComunicados();
  }, [carregarComunicados]);

  function handleDestinoChange(nextKey: string) {
    if (nextKey === destinoKey) {
      return;
    }

    setDestinoKey(nextKey);
    router.replace(`/admin/comunicados-gerais/gerenciar?dest=${nextKey}`);
  }

  return (
    <main className="pagina">
      <section className="hero">
        <div
          className="topo-painel"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.back()}
              className="botao-admin"
              style={{ border: "none", cursor: "pointer" }}
            >
              Voltar
            </button>

            <span className="tag">ADMIN</span>
          </div>

          <Link href="/central" className="botao-admin">
            Area operacao
          </Link>
        </div>

        <h1>Gerenciar comunicados</h1>
        <p>
          Escolha o destino para fixar, desfixar ou apagar comunicados publicados.
        </p>
      </section>

      <section style={{ display: "grid", gap: "20px" }}>
        <article className="card-setor" style={{ minHeight: "unset" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            <label
              htmlFor="destino"
              style={{ fontWeight: 700, fontSize: "16px", color: "#f5f7fa" }}
            >
              Destino
            </label>
            <select
              id="destino"
              value={destinoKey}
              onChange={(event) => handleDestinoChange(event.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid rgba(125, 211, 252, 0.15)",
                background: "#071d33",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
              }}
            >
              {destinations.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p style={{ margin: 0, color: "#b8c4d1" }}>{destination?.descricao}</p>
          </div>
        </article>

        {carregando ? (
          <article className="card-setor">
            <div className="card-topo">
              <span className="badge">STATUS</span>
            </div>
            <h2>Carregando comunicados</h2>
            <p>Aguarde enquanto buscamos os comunicados ja publicados.</p>
          </article>
        ) : comunicados.length === 0 ? (
          <article className="card-setor">
            <div className="card-topo">
              <span className="badge">STATUS</span>
            </div>
            <h2>Nenhum comunicado encontrado</h2>
            <p>Ainda nao existem comunicados cadastrados nesse destino.</p>
          </article>
        ) : (
          comunicados.map((item) => (
            <article key={item.id} className="card-setor">
              <Link
                href={`/comunicados-gerais/${item.id}?origem=admin&dest=${destinoKey}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  className="card-topo"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="badge">{item.tag}</span>
                    {item.fixado ? (
                      <span
                        className="badge"
                        style={{ background: "#14532d", color: "#86efac" }}
                      >
                        FIXADO
                      </span>
                    ) : null}
                    {item.linkPdf ? <span className="badge">PDF</span> : null}
                  </div>

                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#7dd3fc" }}>
                    {item.data}
                  </span>
                </div>

                <h2>{item.titulo}</h2>
                <p>{item.resumo}</p>

                <span
                  style={{
                    display: "inline-flex",
                    marginTop: "8px",
                    color: "#7dd3fc",
                    fontWeight: 700,
                  }}
                >
                  Ver conteudo completo
                </span>
              </Link>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
                <button
                  onClick={() => alterarFixacao(item.id, item.fixado)}
                  className="botao"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  {item.fixado ? "Desfixar" : "Fixar"}
                </button>

                <button
                  onClick={() => apagarComunicado(item.id)}
                  className="botao"
                  style={{ background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Apagar
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
