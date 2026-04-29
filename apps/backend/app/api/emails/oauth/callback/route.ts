import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForRefreshToken } from "@/lib/email-sync";

function getFrontendBaseUrl(req: NextRequest) {
  return (
    process.env.FRONTEND_URL?.replace(/\/+$/, "") ||
    new URL(req.url).origin
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const frontendBaseUrl = getFrontendBaseUrl(req);

  if (error) {
    const redirectUrl = new URL("/central?gmail=error", frontendBaseUrl);
    redirectUrl.searchParams.set("motivo", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/central?gmail=missing_code", frontendBaseUrl)
    );
  }

  try {
    await exchangeCodeForRefreshToken(code);
    return NextResponse.redirect(
      new URL("/central?gmail=connected", frontendBaseUrl)
    );
  } catch (callbackError) {
    const redirectUrl = new URL("/central?gmail=error", frontendBaseUrl);
    redirectUrl.searchParams.set(
      "motivo",
      callbackError instanceof Error ? callbackError.message : String(callbackError)
    );
    return NextResponse.redirect(redirectUrl);
  }
}
