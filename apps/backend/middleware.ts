import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { canAccessSector } from "@/lib/user-access";

function isPublicApiPath(pathname: string) {
  return (
    pathname === "/api/login" ||
    pathname === "/api/logout" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/emails/cron" ||
    pathname === "/api/emails/oauth/callback"
  );
}

function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api/");
}

function getAreaAndSectorFromApiPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "api" || segments[1] !== "setor-comunicados") {
    return { area: null, sector: null };
  }

  return {
    area: segments[2] ?? null,
    sector: segments[3] ?? null,
  };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedApi(pathname) || isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ erro: "Sessao invalida." }, { status: 401 });
  }

  if (
    pathname.startsWith("/api/alinhamentos") &&
    req.method !== "GET" &&
    session.role !== "admin"
  ) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  const apiPath = getAreaAndSectorFromApiPath(pathname);

  if (
    apiPath.area &&
    apiPath.sector &&
    !canAccessSector(session, apiPath.area, apiPath.sector)
  ) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  if (
    req.method !== "GET" &&
    (pathname.startsWith("/api/comunicados") ||
      pathname.startsWith("/api/emails") ||
      pathname.startsWith("/api/setor-comunicados")) &&
    session.role !== "admin"
  ) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
