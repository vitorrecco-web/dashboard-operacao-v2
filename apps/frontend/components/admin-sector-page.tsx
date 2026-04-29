"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SectorDefinition } from "@/lib/sector-config";

export default function AdminSectorPage({ sector }: { sector: SectorDefinition }) {
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

          <Link href={`/area/${sector.areaKey}/${sector.sectorKey}`} className="botao-admin">
            Area operacao
          </Link>
        </div>

        <h1>{sector.sectorNome}</h1>
        <p>{sector.adminDescricao}</p>
      </section>

      <section style={{ display: "grid", gap: "20px" }}>
        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">COMUNICADOS</span>
          </div>

          <h2>Novo comunicado</h2>
          <p>Crie um novo aviso para distribuicao no painel do setor.</p>

          <Link
            href={`/admin/setores/${sector.areaKey}/${sector.sectorKey}/novo`}
            className="botao"
          >
            Criar comunicado
          </Link>
        </article>

        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">GERENCIAMENTO</span>
          </div>

          <h2>Gerenciar comunicados</h2>
          <p>
            Visualize, fixe, desfixe ou apague comunicados ja publicados. As
            alteracoes feitas aqui serao refletidas automaticamente no painel do setor.
          </p>

          <Link
            href={`/admin/setores/${sector.areaKey}/${sector.sectorKey}/gerenciar`}
            className="botao"
          >
            Gerenciar comunicados
          </Link>
        </article>
      </section>
    </main>
  );
}
