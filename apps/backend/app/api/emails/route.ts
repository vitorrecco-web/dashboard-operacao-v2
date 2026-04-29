import { NextRequest, NextResponse } from "next/server";
import {
  getEmailSyncStatus,
  listMailboxEmails,
  markMailboxEmailAsRead,
  markMailboxEmailAsUnread,
  syncMailboxEmailsIfStale,
} from "@/lib/email-sync";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || undefined;
    const statusParam = searchParams.get("status");
    const attachmentsParam = searchParams.get("attachments");

    const status =
      statusParam === "lido" || statusParam === "nao_lido" || statusParam === "todos"
        ? statusParam
        : "todos";
    const hasAttachments =
      attachmentsParam === "sim" ? true : attachmentsParam === "nao" ? false : undefined;

    const syncResult = await syncMailboxEmailsIfStale();
    const statusInfo = getEmailSyncStatus();

    return NextResponse.json({
      ...statusInfo,
      autoSync: syncResult,
      emails: listMailboxEmails({
        status,
        query,
        hasAttachments,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao buscar e-mails.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: number; status?: string };

    if (typeof body.id !== "number") {
      return NextResponse.json({ erro: "Id invalido." }, { status: 400 });
    }

    if (body.status !== "lido" && body.status !== "nao_lido") {
      return NextResponse.json({ erro: "Status invalido." }, { status: 400 });
    }

    const updated =
      body.status === "lido"
        ? markMailboxEmailAsRead(body.id)
        : markMailboxEmailAsUnread(body.id);

    if (!updated) {
      return NextResponse.json({ erro: "E-mail nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao atualizar status do e-mail.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
