import Link from "next/link";
import CentralPanel from "./central-panel";
import { getSession } from "@/lib/server-session";

export default async function CentralPage() {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <main className="pagina">
      <div style={{ marginBottom: "24px" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <button className="botao">Voltar para o painel</button>
        </Link>
      </div>

      <CentralPanel isAdmin={isAdmin} />
    </main>
  );
}
