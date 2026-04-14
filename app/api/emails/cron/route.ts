import { NextRequest, NextResponse } from "next/server";
import { getEmailSyncStatus, syncMailboxEmailsIfStale } from "@/lib/email-sync";

function isAuthorized(req: NextRequest) {
  const expectedToken = process.env.EMAIL_CRON_TOKEN;

  if (!expectedToken) {
    throw new Error("EMAIL_CRON_TOKEN nao configurado.");
  }

  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const queryToken = new URL(req.url).searchParams.get("token");

  return bearerToken === expectedToken || queryToken === expectedToken;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
    }

    const status = getEmailSyncStatus();

    if (!status.configured) {
      return NextResponse.json(
        {
          erro: "Configuracao de Gmail incompleta.",
          detalhe:
            "Defina as credenciais do Gmail antes de ativar o cron de sincronizacao.",
        },
        { status: 400 }
      );
    }

    const result = await syncMailboxEmailsIfStale();

    return NextResponse.json({
      sucesso: true,
      cron: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao executar sincronizacao agendada.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
