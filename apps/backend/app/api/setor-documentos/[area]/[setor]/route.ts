import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import {
  getCachedSectorDriveDocuments,
  listSectorDriveDocuments,
} from "@/lib/google-drive-documents";
import { getSectorDefinition } from "@/lib/sector-config";
import { canAccessSector } from "@/lib/user-access";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

type Props = {
  params: {
    area: string;
    setor: string;
  };
};

function resolveSector(params: Props["params"]) {
  return getSectorDefinition(params.area, params.setor);
}

async function getAuthorizedSession(
  req: NextRequest,
  area: string,
  setor: string
) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return null;
  }

  if (!canAccessSector(session, area, setor)) {
    return false;
  }

  return session;
}

export async function GET(req: NextRequest, { params }: Props) {
  const sector = resolveSector(params);

  if (!sector) {
    return NextResponse.json({ erro: "Setor nao encontrado." }, { status: 404 });
  }

  const session = await getAuthorizedSession(req, params.area, params.setor);

  if (session === false) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  if (!session) {
    return NextResponse.json({ erro: "Sessao invalida." }, { status: 401 });
  }

  try {
    const result = await listSectorDriveDocuments(sector);

    return NextResponse.json(
      {
        documents: result.documents.map((item) => ({
          ...item,
          openUrl: `/api/setor-documentos/${params.area}/${params.setor}/arquivo?fileId=${encodeURIComponent(item.id)}`,
        })),
        configured: result.configured,
        reason: result.reason,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    const cachedResult = getCachedSectorDriveDocuments(sector);

    if (cachedResult) {
      return NextResponse.json(
        {
          documents: cachedResult.documents.map((item) => ({
            ...item,
            openUrl: `/api/setor-documentos/${params.area}/${params.setor}/arquivo?fileId=${encodeURIComponent(item.id)}`,
          })),
          configured: cachedResult.configured,
          reason: cachedResult.reason,
          cached: cachedResult.cached,
          updatedAt: cachedResult.updatedAt,
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        documents: [],
        configured: true,
        reason:
          error instanceof Error
            ? error.message
            : "Nao foi possivel consultar os documentos do setor no Google Drive.",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
