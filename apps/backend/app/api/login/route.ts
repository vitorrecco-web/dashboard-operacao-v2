import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { authenticateUser } from "@/lib/user-access";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { erro: "Login obrigatorio." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { erro: "Senha obrigatoria." },
        { status: 400 }
      );
    }

    const user = authenticateUser(username, password);

    if (!user) {
      return NextResponse.json(
        { erro: "Login ou senha invalidos." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({
      sucesso: true,
      role: user.role,
      redirectTo: user.role === "admin" ? "/admin" : "/",
    });

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
