import { NextRequest, NextResponse } from "next/server";
import { listComunicados } from "@/lib/comunicados-db";
import {
  getEmailSyncStatus,
  listMailboxEmails,
  syncMailboxEmailsIfStale,
} from "@/lib/email-sync";

type CentralSource = "todos" | "comunicados" | "emails";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearch(
  query: string,
  ...values: Array<string | null | undefined>
) {
  if (!query) {
    return true;
  }

  return values.some((value) => normalizeText(value ?? "").includes(query));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceParam = searchParams.get("source");
    const query = normalizeText(searchParams.get("q") ?? "");
    const attachmentsParam = searchParams.get("attachments");

    const source: CentralSource =
      sourceParam === "comunicados" || sourceParam === "emails"
        ? sourceParam
        : "todos";
    const onlyWithAttachments = attachmentsParam === "sim";

    const syncResult = await syncMailboxEmailsIfStale();
    const statusInfo = getEmailSyncStatus();

    const comunicados =
      source === "emails"
        ? []
        : listComunicados({ tipo: "geral" })
            .filter((item) =>
              matchesSearch(query, item.titulo, item.resumo, item.conteudo, item.tag)
            )
            .map((item) => ({
              id: `comunicado-${item.id}`,
              source: "comunicado" as const,
              sourceLabel: "Comunicado",
              title: item.titulo,
              summary: item.resumo,
              secondaryText: item.tag,
              date: item.data,
              isUnread: item.novo,
              isPinned: item.fixado,
              hasAttachments: Boolean(item.linkPdf),
              href: `/comunicados-gerais/${item.id}?origem=central`,
            }));

    const emails =
      source === "comunicados"
        ? []
        : listMailboxEmails({
            limit: 100,
            hasAttachments: onlyWithAttachments ? true : undefined,
          })
            .filter((item) =>
              matchesSearch(
                query,
                item.subject,
                item.fromEmail,
                item.fromName,
                item.snippet
              )
            )
            .map((item) => ({
              id: `email-${item.id}`,
              source: "email" as const,
              sourceLabel: "E-mail",
              title: item.subject,
              summary: item.snippet || "Abrir e-mail completo",
              secondaryText: item.fromName
                ? `${item.fromName} <${item.fromEmail}>`
                : item.fromEmail,
              date: item.receivedAt,
              isUnread: item.status !== "lido",
              isPinned: false,
              hasAttachments: item.hasAttachments,
              href: `/emails/${item.id}?origem=central`,
            }));

    const items = [...comunicados, ...emails].sort((left, right) => {
      if (left.isPinned !== right.isPinned) {
        return left.isPinned ? -1 : 1;
      }

      return new Date(right.date).getTime() - new Date(left.date).getTime();
    });

    return NextResponse.json({
      ...statusInfo,
      autoSync: syncResult,
      items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar a central.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
