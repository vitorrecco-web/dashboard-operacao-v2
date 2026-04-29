import Link from "next/link";

export default function AdminComunicadosGeraisPage() {
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
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <span className="tag">ADMIN</span>
            <Link href="/admin" className="botao-admin">
              Voltar para o admin
            </Link>
          </div>

          <Link href="/central" className="botao-admin">
            Area operacao
          </Link>
        </div>

        <h1>Centro de comunicados</h1>
        <p>
          Escolha se voce deseja criar um novo comunicado ou gerenciar os
          comunicados ja publicados. Em ambas as telas voce pode selecionar a
          secao desejada, como comunicados gerais, Picking, Packing e os demais
          setores.
        </p>
      </section>

      <section style={{ display: "grid", gap: "20px" }}>
        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">COMUNICADOS</span>
          </div>

          <h2>Novo comunicado</h2>
          <p>
            Abra o formulario unico e escolha em qual secao o comunicado deve ser
            criado.
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
            Visualize os comunicados publicados e filtre por secao para fixar,
            desfixar ou apagar.
          </p>

          <Link href="/admin/comunicados-gerais/gerenciar" className="botao">
            Gerenciar comunicados
          </Link>
        </article>
      </section>
    </main>
  );
}
