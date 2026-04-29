import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { getSession } from "@/lib/server-session";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.role === "admin") {
    redirect("/admin");
  }

  if (session?.role === "supervisor") {
    redirect("/");
  }

  return (
    <main className="pagina" style={{ minHeight: "100vh", placeItems: "center" }}>
      <LoginForm />
    </main>
  );
}
