import { NextResponse } from "next/server";
import { resetGmailConnection } from "@/lib/email-sync";

export async function POST() {
  try {
    resetGmailConnection();

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Nao foi possivel limpar a conexao atual do Gmail.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
