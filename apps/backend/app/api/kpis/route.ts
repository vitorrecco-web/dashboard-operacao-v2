import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getCachedSectorKpis, listSectorKpis } from "@/lib/google-kpis";
import { getSectorDefinition } from "@/lib/sector-config";
import { canAccessSector } from "@/lib/user-access";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET(req: NextRequest) {
  const area = req.nextUrl.searchParams.get("area") || "";
  const setor = req.nextUrl.searchParams.get("setor") || "";
  const limitValue = Number(req.nextUrl.searchParams.get("limit") || "8");
  const limit = Number.isNaN(limitValue) ? 8 : limitValue;

  if (!area || !setor) {
    return NextResponse.json({ erro: "Area e setor sao obrigatorios." }, { status: 400 });
  }

  const sector = getSectorDefinition(area, setor);

  if (!sector) {
    return NextResponse.json({ erro: "Setor nao encontrado." }, { status: 404 });
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ erro: "Sessao invalida." }, { status: 401 });
  }

  if (!canAccessSector(session, area, setor)) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  try {
    const result = await listSectorKpis(limit);

    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const cachedResult = getCachedSectorKpis(limit);

    if (cachedResult) {
      return NextResponse.json(cachedResult, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json(
      {
        configured: true,
        reason:
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os KPIs da planilha.",
        items: [],
        total: 0,
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
