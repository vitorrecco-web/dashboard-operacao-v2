import { notFound } from "next/navigation";
import AdminSectorManagePage from "@/components/admin-sector-manage-page";
import { getSectorDefinition } from "@/lib/sector-config";

type Props = {
  params: {
    area: string;
    setor: string;
  };
};

export default function AdminSectorManageRoutePage({ params }: Props) {
  const sector = getSectorDefinition(params.area, params.setor);

  if (!sector) {
    notFound();
  }

  return <AdminSectorManagePage sector={sector} />;
}
