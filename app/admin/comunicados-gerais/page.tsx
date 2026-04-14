"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminComunicadosGeraisPage() {
  const router = useRouter();

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

        <h1>Comunicados Gerais</h1>
        <p>
          Gerencie os avisos gerais da operação, publique novos comunicados e
          administre os comunicados já existentes.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">COMUNICADOS</span>
          </div>

          <h2>Novo comunicado</h2>
          <p>
            Crie um novo aviso para distribuição no comunicado geral da
            operação.
          </p>

          <Link href="/admin/novo" className="botao">
            Criar comunicado
          </Link>
        </article>

        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">GERENCIAMENTO</span>
          </div>

          <h2>Gerenciar comunicados</h2>
          <p>
            Visualize, fixe, desfixe ou apague comunicados já publicados. As
            alterações feitas aqui serão refletidas automaticamente no painel da
            operação.
          </p>

          <Link
            href="/admin/comunicados-gerais/gerenciar"
            className="botao"
          >
            Gerenciar comunicados
          </Link>
        </article>
      </section>
    </main>
  );
}