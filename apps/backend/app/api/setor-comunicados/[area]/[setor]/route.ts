import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import {
  createComunicado,
  deleteComunicado,
  listComunicados,
  updateFixado,
} from "@/lib/comunicados-db";
import { saveComunicadoPdf } from "@/lib/comunicado-pdf";
import { getSectorDefinition } from "@/lib/sector-config";
import { canAccessSector } from "@/lib/user-access";

type Props = {
  params: {
    area: string;
    setor: string;
  };
};

function validarCampos(body: Record<string, unknown>) {
  const camposObrigatorios = ["titulo", "tag", "resumo", "conteudo", "data"];

  for (const campo of camposObrigatorios) {
    if (typeof body[campo] !== "string" || !String(body[campo]).trim()) {
      return `Campo obrigatorio invalido: ${campo}.`;
    }
  }

  return null;
}

function resolveSector(params: Props["params"]) {
  return getSectorDefinition(params.area, params.setor);
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
      linkPdf:
        pdfFile instanceof File && pdfFile.size > 0
          ? await saveComunicadoPdf(pdfFile)
          : null,
    } satisfies Record<string, unknown>;
  }

  return (await req.json()) as Record<string, unknown>;
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

export async function GET(_req: NextRequest, { params }: Props) {
  const sector = resolveSector(params);
  if (!sector) return NextResponse.json({ erro: "Setor nao encontrado." }, { status: 404 });

  const session = await getAuthorizedSession(_req, params.area, params.setor);

  if (session === false) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  if (!session) {
    return NextResponse.json({ erro: "Sessao invalida." }, { status: 401 });
  }

  return NextResponse.json(listComunicados({ tipo: "setor", setor: sector.setorId }));
}

export async function POST(req: NextRequest, { params }: Props) {
  const sector = resolveSector(params);
  if (!sector) return NextResponse.json({ erro: "Setor nao encontrado." }, { status: 404 });

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
    tipo: "setor",
    setor: sector.setorId,
    linkPdf: typeof body.linkPdf === "string" ? body.linkPdf : null,
  });

  return NextResponse.json(novoComunicado, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const sector = resolveSector(params);
  if (!sector) return NextResponse.json({ erro: "Setor nao encontrado." }, { status: 404 });

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
    return NextResponse.json({ erro: "Comunicado nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ sucesso: true });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const sector = resolveSector(params);
  if (!sector) return NextResponse.json({ erro: "Setor nao encontrado." }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (Number.isNaN(id)) {
    return NextResponse.json({ erro: "Id invalido." }, { status: 400 });
  }

  const deleted = deleteComunicado(id);

  if (!deleted) {
    return NextResponse.json({ erro: "Comunicado nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ sucesso: true });
}
