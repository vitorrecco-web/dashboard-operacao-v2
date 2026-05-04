import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { downloadSectorDriveDocument } from "@/lib/google-drive-documents";
import { getSectorDefinition } from "@/lib/sector-config";
import { canAccessSector } from "@/lib/user-access";

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

function sanitizeDownloadName(fileName: string) {
  return fileName.replace(/"/g, "");
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

  const fileId = req.nextUrl.searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ erro: "Arquivo nao informado." }, { status: 400 });
  }

  try {
    const file = await downloadSectorDriveDocument(sector, fileId);

    return new NextResponse(file.buffer, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${sanitizeDownloadName(file.fileName)}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Nao foi possivel abrir o documento do Google Drive.",
      },
      { status: 500 }
    );
  }
}
