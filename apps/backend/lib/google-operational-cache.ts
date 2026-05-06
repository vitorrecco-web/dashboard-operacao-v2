import { listSectorDriveDocuments } from "@/lib/google-drive-documents";
import { listSectorKpis } from "@/lib/google-kpis";
import { getAllSectorDefinitions } from "@/lib/sector-config";

type RefreshResult =
  | {
      ok: true;
      refreshed: number;
    }
  | {
      ok: false;
      error: string;
    };

async function runRefresh(name: string, refresh: () => Promise<unknown>): Promise<RefreshResult> {
  try {
    await refresh();

    return {
      ok: true,
      refreshed: 1,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : `${name}: ${String(error)}`,
    };
  }
}

export async function refreshOperationalGoogleCache() {
  const startedAt = new Date().toISOString();
  const kpis = await runRefresh("kpis", () => listSectorKpis(100));
  const documents = await Promise.all(
    getAllSectorDefinitions().map((sector) =>
      runRefresh(`documents:${sector.setorId}`, () => listSectorDriveDocuments(sector)).then(
        (result) => ({
          sectorId: sector.setorId,
          sectorName: sector.sectorNome,
          ...result,
        })
      )
    )
  );
  const documentFailures = documents.filter((item) => !item.ok);
  const successfulDocuments = documents.filter((item) => item.ok).length;

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    ok: kpis.ok && documentFailures.length === 0,
    kpis,
    documents: {
      total: documents.length,
      refreshed: successfulDocuments,
      failed: documentFailures.length,
      failures: documentFailures,
    },
  };
}
