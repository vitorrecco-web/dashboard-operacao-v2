import Link from "next/link";
import AdminPreviewSelector from "@/components/admin-preview-selector";
import KpiSummaryCard from "@/components/kpi-summary-card";
import MeetingTopicsList from "@/components/meeting-topics-list";
import LogoutButton from "@/components/logout-button";
import { getComunicadoDestinationByKey, getAllComunicadoDestinations } from "@/lib/comunicado-destinations";
import { getSession } from "@/lib/server-session";
import { getSectorDefinition } from "@/lib/sector-config";

const adminShortcuts = [
  {
    id: 1,
    nome: "Central da Supervisao",
    rota: "/central",
    descricao:
      "Veja em um unico fluxo os comunicados gerais e os e-mails sincronizados da supervisao.",
    badge: "CENTRAL",
    textoBotao: "Acessar",
  },
];

type DashboardPreview = {
  displayName: string;
  sectorName: string | null;
  areaName: string | null;
  homePath: string;
  destinationKey: string;
  badgeLabel: string;
  previewKey?: string | null;
};

function SupervisorDashboard({ preview }: { preview: DashboardPreview }) {
  return (
    <section className="dashboard-supervisor">
      <KpiSummaryCard
        areaKey={preview.homePath ? preview.destinationKey.split("-")[0] ?? null : null}
        sectorKey={preview.homePath ? preview.destinationKey.split("-").slice(1).join("-") || null : null}
        sectorName={preview.sectorName}
        badgeLabel={preview.badgeLabel}
        variant="hero"
      />

      <article className="card-destaque">
        <div className="card-topo">
          <span className="badge">ALINHAMENTOS</span>
          <span className="perfil-chip">{preview.badgeLabel}</span>
        </div>

        <h2>Alinhamentos para reuniao</h2>
        <p>
          Use este espaco como guia rapido do que precisa ser levado para o
          encontro com a operacao.
        </p>

        <MeetingTopicsList destinationKey={preview.destinationKey} />
        <KpiSummaryCard
          areaKey={preview.homePath ? preview.destinationKey.split("-")[0] ?? null : null}
          sectorKey={preview.homePath ? preview.destinationKey.split("-").slice(1).join("-") || null : null}
          sectorName={preview.sectorName}
          variant="inline"
        />
      </article>

      <div className="cards-secundarios">
        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">GERAL</span>
          </div>

          <h2>Central da Supervisao</h2>
          <p>
            Consulte os comunicados gerais e os e-mails que precisam de
            acompanhamento da supervisao.
          </p>

          <Link href="/central" className="botao">
            Abrir central
          </Link>
        </article>

        <article className="card-setor">
          <div className="card-topo">
            <span className="badge">MINHA AREA</span>
          </div>

          <h2>{preview.sectorName}</h2>
          <p>
            Acesse apenas os comunicados e orientacoes do setor de{" "}
            {preview.sectorName}, dentro da area {preview.areaName}.
          </p>

          <Link
            href={
              preview.previewKey
                ? `${preview.homePath}?preview=${encodeURIComponent(preview.previewKey)}`
                : preview.homePath
            }
            className="botao"
          >
            Abrir {preview.sectorName}
          </Link>
        </article>
      </div>
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { preview?: string };
}) {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  if (!session) {
    return null;
  }

  const previewOptions = getAllComunicadoDestinations().filter(
    (item) => item.areaKey && item.sectorKey
  );
  const requestedPreviewKey = searchParams?.preview;
  const previewDestination =
    isAdmin && requestedPreviewKey
      ? getComunicadoDestinationByKey(requestedPreviewKey)
      : null;
  const previewSector =
    previewDestination?.areaKey && previewDestination?.sectorKey
      ? getSectorDefinition(previewDestination.areaKey, previewDestination.sectorKey)
      : null;

  const supervisorPreview: DashboardPreview =
    isAdmin && previewSector
      ? {
          displayName: `Previa ${previewSector.sectorNome}`,
          sectorName: previewSector.sectorNome,
          areaName: previewSector.areaNome,
          homePath: `/area/${previewSector.areaKey}/${previewSector.sectorKey}`,
          destinationKey: previewSector.setorId,
          badgeLabel: `${previewSector.areaNome} - ${previewSector.sectorNome}`,
          previewKey: previewSector.setorId,
        }
      : {
          displayName: session.displayName,
          sectorName: session.sectorName,
          areaName: session.areaName,
          homePath: session.homePath,
          destinationKey:
            session.allowedArea && session.allowedSector
              ? `${session.allowedArea}-${session.allowedSector}`
              : "geral",
          badgeLabel: session.displayName,
          previewKey: null,
        };

  return (
    <main className="pagina">
      <section className="hero">
        <div className="topo-painel">
          <span className="tag">PAINEL INTERNO</span>

          <div className="topo-acoes">
            {isAdmin ? (
              <Link href="/admin" className="botao-admin">
                Area admin
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>

        <h1>
          {isAdmin && previewSector
            ? `Previa do painel de ${previewSector.sectorNome}`
            : isAdmin
              ? "Painel da Operacao"
              : `Painel de ${session.sectorName ?? "Supervisao"}`}
        </h1>
        <p>
          {isAdmin && previewSector
            ? `Esta visualizacao replica a home que o supervisor de ${previewSector.sectorNome} enxerga, incluindo alinhamentos e acessos da area.`
            : isAdmin
              ? "Consulte comunicados, procedimentos e informacoes importantes por area da operacao."
              : `Veja os alinhamentos da reuniao, os comunicados gerais da supervisao e os avisos do setor de ${session.sectorName}.`}
        </p>

        {isAdmin ? (
          <AdminPreviewSelector
            options={previewOptions.map((item) => ({
              key: item.key,
              label: item.label,
            }))}
            currentPreviewKey={previewSector?.setorId ?? ""}
          />
        ) : null}
      </section>

      {isAdmin ? (
        <>
          {previewSector ? (
            <SupervisorDashboard preview={supervisorPreview} />
          ) : (
            <section className="setores">
              {adminShortcuts.map((item) => (
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
          )}
        </>
      ) : (
        <SupervisorDashboard preview={supervisorPreview} />
      )}
    </main>
  );
}
