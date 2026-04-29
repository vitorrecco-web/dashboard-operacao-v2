"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
};

export default function AdminSectorManagePage({
  sector,
}: {
  sector: SectorDefinition;
}) {
  const router = useRouter();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarComunicados = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(
        `/api/setor-comunicados/${sector.areaKey}/${sector.sectorKey}`
      );
      const dados = await resposta.json();
      setComunicados(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error(`Erro ao carregar comunicados de ${sector.sectorNome}:`, error);
    } finally {
      setCarregando(false);
    }
  }, [sector.areaKey, sector.sectorKey, sector.sectorNome]);

  async function alterarFixacao(id: number, fixado: boolean) {
    try {
      await fetch(`/api/setor-comunicados/${sector.areaKey}/${sector.sectorKey}`, {
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
    const confirmar = window.confirm("Deseja realmente apagar este comunicado?");
    if (!confirmar) return;

    try {
      await fetch(`/api/setor-comunicados/${sector.areaKey}/${sector.sectorKey}?id=${id}`, {
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

          <Link href={`/area/${sector.areaKey}/${sector.sectorKey}`} className="botao-admin">
            Area operacao
          </Link>
        </div>

        <h1>Gerenciar {sector.sectorNome}</h1>
        <p>Fixe, desfixe ou apague comunicados ja publicados do setor {sector.sectorNome}.</p>
      </section>

      <section style={{ display: "grid", gap: "20px" }}>
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
            <p>Ainda nao existem comunicados cadastrados para gerenciamento.</p>
          </article>
        ) : (
          comunicados.map((item) => (
            <article key={item.id} className="card-setor">
              <div
                className="card-topo"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <span className="badge">{item.tag}</span>
                  {item.fixado ? (
                    <span className="badge" style={{ background: "#14532d", color: "#86efac" }}>
                      FIXADO
                    </span>
                  ) : null}
                </div>

                <span style={{ fontSize: "14px", fontWeight: 600, color: "#7dd3fc" }}>
                  {item.data}
                </span>
              </div>

              <h2>{item.titulo}</h2>
              <p>{item.resumo}</p>

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
