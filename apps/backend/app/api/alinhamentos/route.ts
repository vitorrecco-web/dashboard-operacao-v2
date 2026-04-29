import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getComunicadoDestinationByKey } from "@/lib/comunicado-destinations";
import {
  getMeetingTopicsByDestination,
  getMeetingTopicsForDestination,
  saveMeetingTopicsByDestination,
} from "@/lib/meeting-topics";
import { canAccessSector } from "@/lib/user-access";

async function getAdminSession(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session || session.role !== "admin") {
    return null;
  }

  return session;
}

async function getSession(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  const destinationKey = req.nextUrl.searchParams.get("dest") ?? "geral";
  const destination = getComunicadoDestinationByKey(destinationKey);

  if (session.role !== "admin" && destination?.areaKey && destination?.sectorKey) {
    if (!canAccessSector(session, destination.areaKey, destination.sectorKey)) {
      return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
    }
  }

  return NextResponse.json({
    topics:
      destinationKey === "geral"
        ? getMeetingTopicsByDestination("geral")
        : getMeetingTopicsForDestination(destination),
    destinationKey,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession(req);

    if (!session) {
      return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
    }

    const body = (await req.json()) as { topics?: unknown; destinationKey?: unknown };
    const destinationKey =
      typeof body.destinationKey === "string" && body.destinationKey.trim()
        ? body.destinationKey.trim()
        : "geral";
    const rawTopics = Array.isArray(body.topics) ? body.topics : [];
    const topics = rawTopics.filter((item): item is string => typeof item === "string");

    const savedTopics = saveMeetingTopicsByDestination(destinationKey, topics);

    return NextResponse.json({
      sucesso: true,
      destinationKey,
      topics: savedTopics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Nao foi possivel salvar os alinhamentos.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
