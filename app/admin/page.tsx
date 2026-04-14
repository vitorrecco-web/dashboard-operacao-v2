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
            <Link href="/" className="botao-admin">
              Area operacao
            </Link>
            <LogoutButton />
          </div>
        </div>

        <h1>Painel Administrativo</h1>
        <p>
          Gerencie os comunicados que serao exibidos para os supervisores no
          painel da operacao.
        </p>
      </section>

      <section className="setores">
        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">COMUNICADOS</span>
          </div>

          <h2>Comunicados gerais</h2>
          <p>
            Acesse os comunicados gerais da operacao, visualize como estao
            aparecendo para os supervisores e publique novos avisos.
          </p>

          <Link href="/admin/comunicados-gerais" className="botao">
            Acessar
          </Link>
        </article>

        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">MERCEARIA</span>
          </div>

          <h2>Setores de Mercearia</h2>
          <p>Administre Picking, Packing, Recebimento, Reposicao e Expedicao.</p>

          <Link href="/admin/setores/mercearia" className="botao">
            Abrir area
          </Link>
        </article>

        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">FRESH</span>
          </div>

          <h2>Setores de Fresh</h2>
          <p>Administre Recebimento, Reposicao, Fracionamento, Expedicao e Picking/Packing.</p>

          <Link href="/admin/setores/fresh" className="botao">
            Abrir area
          </Link>
        </article>

        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">E-MAIL</span>
          </div>

          <h2>Caixa da supervisao</h2>
          <p>
            Consulte a caixa supervisao@shopper.com.br e execute a sincronizacao manual
            quando as credenciais do Gmail estiverem configuradas.
          </p>

          <Link href="/emails" className="botao">
            Abrir caixa
          </Link>
        </article>
      </section>
    </main>
  );
}
