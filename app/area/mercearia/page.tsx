import Link from "next/link";

const setoresMercearia = [
  {
    id: 1,
    nome: "Picking",
    rota: "/area/mercearia/picking",
    descricao: "Separacao e organizacao dos pedidos de Mercearia.",
  },
  {
    id: 2,
    nome: "Packing",
    rota: "/area/mercearia/packing",
    descricao: "Empacotamento e preparacao final dos pedidos.",
  },
  {
    id: 3,
    nome: "Recebimento",
    rota: "/area/mercearia/recebimento",
    descricao: "Entrada, conferencia e validacao de mercadorias.",
  },
  {
    id: 4,
    nome: "Reposicao",
    rota: "/area/mercearia/reposicao",
    descricao: "Reposicao de itens e abastecimento da operacao.",
  },
  {
    id: 5,
    nome: "Expedicao",
    rota: "/area/mercearia/expedicao",
    descricao: "Organizacao e saida dos pedidos para entrega.",
  },
];

export default function MerceariaPage() {
  return (
    <main className="pagina">
      <Link href="/" className="voltar">
        Voltar para o painel
      </Link>

      <section className="hero">
        <span className="tag">AREA</span>
        <h1>Mercearia</h1>
        <p>Selecione abaixo o setor que voce deseja consultar.</p>
      </section>

      <section className="setores">
        {setoresMercearia.map((setor) => (
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
