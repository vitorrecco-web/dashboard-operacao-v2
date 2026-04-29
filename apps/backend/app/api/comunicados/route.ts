import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import {
  createComunicado,
  deleteComunicado,
  listComunicados,
  updateFixado,
} from "@/lib/comunicados-db";
import { resolveComunicadoPdfPath, saveComunicadoPdf } from "@/lib/comunicado-pdf";

function validarCampos(body: Record<string, unknown>) {
  const camposObrigatorios = ["titulo", "tag", "resumo", "conteudo", "data"];

  for (const campo of camposObrigatorios) {
    if (typeof body[campo] !== "string" || !String(body[campo]).trim()) {
      return `Campo obrigatorio invalido: ${campo}.`;
    }
  }

  return null;
}

async function parseComunicadoBody(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const pdfFile = formData.get("pdf");

    return {
      titulo: formData.get("titulo"),
      tag: formData.get("tag"),
      resumo: formData.get("resumo"),
      conteudo: formData.get("conteudo"),
      data: formData.get("data"),
      tipo: formData.get("tipo"),
      setor: formData.get("setor"),
      linkPdf:
        pdfFile instanceof File && pdfFile.size > 0
          ? await saveComunicadoPdf(pdfFile)
          : null,
    } satisfies Record<string, unknown>;
  }

  return (await req.json()) as Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const pdfName = req.nextUrl.searchParams.get("pdf");

  try {
    if (pdfName) {
      const fileBuffer = await fs.readFile(resolveComunicadoPdfPath(pdfName));

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${pdfName}"`,
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    return NextResponse.json(listComunicados({ tipo: "geral" }));
  } catch (error) {
    if (pdfName) {
      return NextResponse.json({ erro: "PDF nao encontrado." }, { status: 404 });
    }

    return NextResponse.json(
      {
        erro: "Erro ao buscar comunicados.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseComunicadoBody(req);
    const erroValidacao = validarCampos(body);

    if (erroValidacao) {
      return NextResponse.json({ erro: erroValidacao }, { status: 400 });
    }

    const novoComunicado = createComunicado({
      titulo: String(body.titulo).trim(),
      tag: String(body.tag).trim(),
      resumo: String(body.resumo).trim(),
      conteudo: String(body.conteudo).trim(),
      data: String(body.data).trim(),
      novo: true,
      fixado: false,
      tipo: typeof body.tipo === "string" ? body.tipo : "geral",
      setor: typeof body.setor === "string" ? body.setor : null,
      linkPdf: typeof body.linkPdf === "string" ? body.linkPdf : null,
    });

    return NextResponse.json(novoComunicado, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao criar comunicado.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: number; acao?: string };
    const { id, acao } = body;

    if (typeof id !== "number") {
      return NextResponse.json({ erro: "Id invalido." }, { status: 400 });
    }

    if (acao !== "fixar" && acao !== "desfixar") {
      return NextResponse.json({ erro: "Acao invalida." }, { status: 400 });
    }

    const updated = updateFixado(id, acao === "fixar");

    if (!updated) {
      return NextResponse.json(
        { erro: "Comunicado nao encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao atualizar comunicado.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (Number.isNaN(id)) {
      return NextResponse.json({ erro: "Id invalido." }, { status: 400 });
    }

    const deleted = deleteComunicado(id);

    if (!deleted) {
      return NextResponse.json(
        { erro: "Comunicado nao encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao apagar comunicado.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
