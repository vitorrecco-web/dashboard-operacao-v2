import Link from "next/link";

const setoresFresh = [
  {
    id: 1,
    nome: "Recebimento",
    rota: "/area/fresh/recebimento",
    descricao: "Entrada, conferencia e validacao de itens Fresh.",
  },
  {
    id: 2,
    nome: "Reposicao",
    rota: "/area/fresh/reposicao",
    descricao: "Reposicao e abastecimento da area Fresh.",
  },
  {
    id: 3,
    nome: "Fracionamento",
    rota: "/area/fresh/fracionamento",
    descricao: "Corte, separacao e preparacao de itens fracionados.",
  },
  {
    id: 4,
    nome: "Expedicao",
    rota: "/area/fresh/expedicao",
    descricao: "Saida e organizacao dos pedidos Fresh para entrega.",
  },
  {
    id: 5,
    nome: "Picking/Packing",
    rota: "/area/fresh/picking-packing",
    descricao: "Separacao e empacotamento dos pedidos da area Fresh.",
  },
];

export default function FreshPage() {
  return (
    <main className="pagina">
      <Link href="/" className="voltar">
        Voltar para o painel
      </Link>

      <section className="hero">
        <span className="tag">AREA</span>
        <h1>Fresh</h1>
        <p>Selecione abaixo o setor que voce deseja consultar.</p>
      </section>

      <section className="setores">
        {setoresFresh.map((setor) => (
          <article key={setor.id} className="card-setor">
            <div className="card-topo">
              <span className="badge">SETOR</span>
            </div>

            <h2>{setor.nome}</h2>
            <p>{setor.descricao}</p>

            <Link href={setor.rota} className="botao">
              Acessar setor
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
