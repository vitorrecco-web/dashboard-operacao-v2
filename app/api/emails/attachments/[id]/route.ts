import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { getMailboxEmailAttachmentById } from "@/lib/email-sync";

type Props = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Props) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return NextResponse.json({ erro: "Id invalido." }, { status: 400 });
  }

  const attachment = getMailboxEmailAttachmentById(id);

  if (!attachment) {
    return NextResponse.json({ erro: "Anexo nao encontrado." }, { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(attachment.storagePath);
    const disposition = _req.nextUrl.searchParams.get("download") === "1"
      ? "attachment"
      : "inline";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `${disposition}; filename="${attachment.filename}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Nao foi possivel abrir o anexo.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
