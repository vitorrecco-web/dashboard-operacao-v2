import { redirect } from "next/navigation";

export default function LegacyAdminPickingPage() {
  redirect("/admin/comunicados-gerais?dest=mercearia-picking");
}
