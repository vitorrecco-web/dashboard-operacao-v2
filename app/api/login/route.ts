import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createSessionToken, type UserRole } from "@/lib/auth";

function getRoleFromPassword(password: string): UserRole | null {
  if (password === process.env.ADMIN_PASSWORD) {
    return "admin";
  }

  if (password === process.env.SUPERVISOR_PASSWORD) {
    return "supervisor";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { erro: "Senha obrigatoria." },
        { status: 400 }
      );
    }

    const role = getRoleFromPassword(password);

    if (!role) {
      return NextResponse.json(
        { erro: "Senha invalida." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(role);
    const response = NextResponse.json({ sucesso: true, role });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Nao foi possivel realizar login.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
