import { notFound } from "next/navigation";
import AdminSectorPage from "@/components/admin-sector-page";
import { getSectorDefinition } from "@/lib/sector-config";

type Props = {
  params: {
    area: string;
    setor: string;
  };
};

export default function AdminSectorRoutePage({ params }: Props) {
  const sector = getSectorDefinition(params.area, params.setor);

  if (!sector) {
    notFound();
  }

  return <AdminSectorPage sector={sector} />;
}
