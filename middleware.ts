import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function isPublicPath(pathname: string) {
  return pathname === "/login";
}

function isProtectedApi(pathname: string) {
  return (
    pathname.startsWith("/api/comunicados") ||
    pathname.startsWith("/api/emails") ||
    pathname.startsWith("/api/setor-comunicados")
  );
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
    redirectUrl.pathname = session.role === "admin" ? "/admin" : "/";
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
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
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
