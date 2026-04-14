import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { getSession } from "@/lib/server-session";

const opcoesIniciais = [
  {
    id: 1,
    nome: "Comunicados Gerais",
    rota: "/comunicados-gerais",
    descricao:
      "Avisos, orientacoes e comunicados validos para todos os setores da operacao.",
    badge: "ACESSO",
    textoBotao: "Acessar",
  },
  {
    id: 2,
    nome: "Mercearia",
    rota: "/area/mercearia",
    descricao:
      "Acesse os setores da operacao de Mercearia, como Picking, Packing e Recebimento.",
    badge: "ACESSO",
    textoBotao: "Acessar",
  },
  {
    id: 3,
    nome: "Fresh",
    rota: "/area/fresh",
    descricao:
      "Acesse os setores da operacao Fresh, como Fracionamento, Reposicao e Expedicao.",
    badge: "ACESSO",
    textoBotao: "Acessar",
  },
  {
    id: 4,
    nome: "E-mails da Supervisao",
    rota: "/emails",
    descricao:
      "Consulte no painel as mensagens recebidas na caixa supervisao@shopper.com.br.",
    badge: "SUPERVISAO",
    textoBotao: "Abrir caixa",
  },
];

export default async function Home() {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

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
          <span className="tag">PAINEL INTERNO</span>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {isAdmin ? (
              <Link href="/admin" className="botao-admin">
                Area admin
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>

        <h1>Painel da Operacao</h1>
        <p>
          Consulte comunicados, procedimentos e informacoes importantes por area
          da operacao.
        </p>
      </section>

      <section className="setores">
        {opcoesIniciais.map((item) => (
          <article key={item.id} className="card-setor">
            <div className="card-topo">
              <span className="badge">{item.badge}</span>
            </div>

            <h2>{item.nome}</h2>
            <p>{item.descricao}</p>

            <Link href={item.rota} className="botao">
              {item.textoBotao}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
