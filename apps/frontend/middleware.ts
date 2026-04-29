import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { canAccessArea, canAccessSector } from "@/lib/user-access";

function isPublicPath(pathname: string) {
  return pathname === "/login";
}

function isProtectedApi(pathname: string) {
  return (
    pathname.startsWith("/api/alinhamentos") ||
    pathname.startsWith("/api/comunicados") ||
    pathname.startsWith("/api/emails") ||
    pathname.startsWith("/api/setor-comunicados")
  );
}

function getRedirectPath(session: NonNullable<Awaited<ReturnType<typeof verifySessionToken>>>) {
  return session.role === "admin" ? "/admin" : "/";
}

function getAreaAndSectorFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "area") {
    return { area: null, sector: null };
  }

  return {
    area: segments[1] ?? null,
    sector: segments[2] ?? null,
  };
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

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (isPublicPath(pathname)) {
    if (!session) {
      return NextResponse.next();
    }

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = getRedirectPath(session);
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    pathname === "/api/login" ||
    pathname === "/api/logout" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = getRedirectPath(session);
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (session.role === "supervisor") {
    const areaPath = getAreaAndSectorFromPath(pathname);

    if (areaPath.area && !areaPath.sector && !canAccessArea(session, areaPath.area)) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }

    if (
      areaPath.area &&
      areaPath.sector &&
      !canAccessSector(session, areaPath.area, areaPath.sector)
    ) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }

    const apiPath = getAreaAndSectorFromApiPath(pathname);

    if (
      apiPath.area &&
      apiPath.sector &&
      !canAccessSector(session, apiPath.area, apiPath.sector)
    ) {
      return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
    }
  }

  if (
    isProtectedApi(pathname) &&
    req.method !== "GET" &&
    session.role !== "admin"
  ) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
