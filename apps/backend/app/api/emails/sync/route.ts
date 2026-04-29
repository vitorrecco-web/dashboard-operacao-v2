import { NextResponse } from "next/server";
import { getEmailSyncStatus, syncMailboxEmails } from "@/lib/email-sync";

export async function POST() {
  try {
    const status = getEmailSyncStatus();

    if (!status.configured) {
      return NextResponse.json(
        {
          erro: "Configuracao de Gmail incompleta.",
          detalhe: status.hasClientCredentials
            ? "As credenciais do app estao configuradas, mas falta conectar a conta para salvar o refresh token."
            : "Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET antes de conectar a conta do Gmail.",
        },
        { status: 400 }
      );
    }

    const result = await syncMailboxEmails();
    return NextResponse.json({ sucesso: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao sincronizar e-mails.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
