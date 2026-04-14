import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForRefreshToken } from "@/lib/email-sync";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    const redirectUrl = new URL("/emails?gmail=error", req.url);
    redirectUrl.searchParams.set("motivo", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/emails?gmail=missing_code", req.url));
  }

  try {
    await exchangeCodeForRefreshToken(code);
    return NextResponse.redirect(new URL("/emails?gmail=connected", req.url));
  } catch (callbackError) {
    const redirectUrl = new URL("/emails?gmail=error", req.url);
    redirectUrl.searchParams.set(
      "motivo",
      callbackError instanceof Error ? callbackError.message : String(callbackError)
    );
    return NextResponse.redirect(redirectUrl);
  }
}
