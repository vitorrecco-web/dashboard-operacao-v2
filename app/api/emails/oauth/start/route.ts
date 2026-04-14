import { NextResponse } from "next/server";
import { getOAuthAuthorizationUrl } from "@/lib/email-sync";

export async function GET() {
  try {
    const authorizationUrl = getOAuthAuthorizationUrl();
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Nao foi possivel iniciar a conexao com o Gmail.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
