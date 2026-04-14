import { NextResponse } from "next/server";
import { getEmailSyncStatus, syncMailboxEmails } from "@/lib/email-sync";

export async function POST() {
  try {
    const status = getEmailSyncStatus();

    if (!status.configured) {
      return NextResponse.json(
        {
          erro: "Configuracao de Gmail incompleta.",
          detalhe:
            "Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN para sincronizar a caixa supervisao@shopper.com.br.",
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
