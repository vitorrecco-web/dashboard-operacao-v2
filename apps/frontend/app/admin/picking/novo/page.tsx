import { redirect } from "next/navigation";

export default function LegacyAdminPickingNovoPage() {
  redirect("/admin/novo?dest=mercearia-picking");
}
