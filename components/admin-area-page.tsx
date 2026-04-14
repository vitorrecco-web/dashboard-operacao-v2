"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SectorDefinition } from "@/lib/sector-config";

export default function AdminAreaPage({
  areaNome,
  sectors,
}: {
  areaNome: string;
  sectors: SectorDefinition[];
}) {
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
              Voltar
            </button>
            <span className="tag">ADMIN</span>
          </div>

          <Link href="/" className="botao-admin">
            Area operacao
          </Link>
        </div>

        <h1>{areaNome}</h1>
        <p>Escolha o setor que voce deseja administrar.</p>
      </section>

      <section className="setores">
        {sectors.map((sector) => (
          <article key={sector.setorId} className="card-setor">
            <div className="card-topo">
              <span className="badge">SETOR</span>
            </div>

            <h2>{sector.sectorNome}</h2>
            <p>{sector.adminDescricao}</p>

            <Link
              href={`/admin/setores/${sector.areaKey}/${sector.sectorKey}`}
              className="botao"
            >
              Administrar setor
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
