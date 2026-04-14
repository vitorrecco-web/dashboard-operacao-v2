import Link from "next/link";
import EmailPanel from "./email-panel";
import { getSession } from "@/lib/server-session";

export default async function EmailsPage() {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <main className="pagina">
      <div style={{ marginBottom: "24px" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <button className="botao">Voltar para o painel</button>
        </Link>
      </div>

      <EmailPanel isAdmin={isAdmin} />
    </main>
  );
}
