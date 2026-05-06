import { NextRequest, NextResponse } from "next/server";
import { refreshOperationalGoogleCache } from "@/lib/google-operational-cache";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

type CronValidation =
  | {
      ok: true;
    }
  | {
      ok: false;
      response: NextResponse;
    };

function getExpectedToken() {
  return process.env.GOOGLE_CACHE_CRON_TOKEN || process.env.EMAIL_CRON_TOKEN;
}

function getRequestToken(req: NextRequest) {
  const authorization = req.headers.get("authorization") ?? "";

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return req.nextUrl.searchParams.get("token") ?? "";
}

function validateCronRequest(req: NextRequest): CronValidation {
  const expectedToken = getExpectedToken();

  if (!expectedToken) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          erro:
            "Configure GOOGLE_CACHE_CRON_TOKEN ou EMAIL_CRON_TOKEN antes de ativar a atualizacao automatica.",
        },
        { status: 500, headers: NO_STORE_HEADERS }
      ),
    };
  }

  if (getRequestToken(req) !== expectedToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { erro: "Acesso negado." },
        { status: 401, headers: NO_STORE_HEADERS }
      ),
    };
  }

  return { ok: true };
}

export async function GET(req: NextRequest) {
  const validation = validateCronRequest(req);

  if (!validation.ok) {
    return validation.response;
  }

  try {
    const result = await refreshOperationalGoogleCache();

    return NextResponse.json(
      {
        cron: true,
        ...result,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      {
        cron: true,
        erro: "Erro ao atualizar o cache operacional do Google.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
