"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function GerenciarComunicadosGeraisPage() {
  const router = useRouter();

  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarComunicados() {
    try {
      setCarregando(true);
  
      const resposta = await fetch("/api/comunicados", {
        cache: "no-store",
      });
  
      const dados = await resposta.json();
      console.log("Resposta da API /api/comunicados:", dados);
  
      setComunicados(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar comunicados:", error);
      setComunicados([]);
    } finally {
      setCarregando(false);
    }
  }

  async function alterarFixacao(id: number, fixado: boolean) {
    try {
      await fetch("/api/comunicados", {
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
      console.error("Erro ao alterar fixação:", error);
    }
  }

  async function apagarComunicado(id: number) {
    const confirmar = window.confirm("Deseja realmente apagar este comunicado?");
    if (!confirmar) return;

    try {
      await fetch(`/api/comunicados?id=${id}`, {
        method: "DELETE",
      });

      await carregarComunicados();
    } catch (error) {
      console.error("Erro ao apagar comunicado:", error);
    }
  }

  useEffect(() => {
    carregarComunicados();
  }, []);

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
              ← Voltar
            </button>

            <span className="tag">ADMIN</span>
          </div>

          <Link href="/comunicados-gerais" className="botao-admin">
            Área operação
          </Link>
        </div>

        <h1>Gerenciar Comunicados</h1>
        <p>
          Fixe, desfixe ou apague comunicados já publicados. Essas alterações
          serão refletidas automaticamente no painel da operação.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {carregando ? (
          <article className="card-setor">
            <div className="card-topo">
              <span className="badge">STATUS</span>
            </div>

            <h2>Carregando comunicados</h2>
            <p>Aguarde enquanto buscamos os comunicados já publicados.</p>
          </article>
        ) : comunicados.length === 0 ? (
          <article className="card-setor">
            <div className="card-topo">
              <span className="badge">STATUS</span>
            </div>

            <h2>Nenhum comunicado encontrado</h2>
            <p>
              Ainda não existem comunicados cadastrados para gerenciamento.
            </p>
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
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="badge">{item.tag}</span>

                  {item.fixado && (
                    <span
                      className="badge"
                      style={{ background: "#14532d", color: "#86efac" }}
                    >
                      FIXADO
                    </span>
                  )}
                </div>

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#7dd3fc",
                  }}
                >
                  {item.data}
                </span>
              </div>

              <h2>{item.titulo}</h2>
              <p>{item.resumo}</p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => alterarFixacao(item.id, item.fixado)}
                  className="botao"
                  style={{
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {item.fixado ? "Desfixar" : "Fixar"}
                </button>

                <button
                  onClick={() => apagarComunicado(item.id)}
                  className="botao"
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
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