import Link from "next/link";
import LogoutButton from "@/components/logout-button";

export default function AdminPage() {
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
          <span className="tag">ADMIN</span>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/central" className="botao-admin">
              Area operacao
            </Link>
            <LogoutButton />
          </div>
        </div>

        <h1>Painel Administrativo</h1>
        <p>
          Gerencie os comunicados que serao exibidos para os supervisores em um
          unico fluxo centralizado.
        </p>
      </section>

      <section style={{ display: "grid", gap: "20px", maxWidth: "720px" }}>
        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">COMUNICADOS</span>
          </div>

          <h2>Centro de comunicados</h2>
          <p>
            Crie e gerencie comunicados gerais e de todos os setores a partir de
            um unico ponto.
          </p>

          <Link href="/admin/comunicados-gerais" className="botao">
            Acessar
          </Link>
        </article>

        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">HOME SUPERVISOR</span>
          </div>

          <h2>Alinhamentos da reuniao</h2>
          <p>
            Edite os bullet points exibidos no quadrante principal da tela
            inicial dos supervisores.
          </p>

          <Link href="/admin/alinhamentos" className="botao">
            Editar alinhamentos
          </Link>
        </article>
      </section>
    </main>
  );
}
