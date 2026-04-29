import { redirect } from "next/navigation";

export default function LegacyAdminPickingGerenciarPage() {
  redirect("/admin/comunicados-gerais/gerenciar?dest=mercearia-picking");
}
