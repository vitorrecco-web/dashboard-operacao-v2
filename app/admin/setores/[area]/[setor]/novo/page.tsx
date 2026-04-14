import { notFound } from "next/navigation";
import AdminSectorFormPage from "@/components/admin-sector-form-page";
import { getSectorDefinition } from "@/lib/sector-config";

type Props = {
  params: {
    area: string;
    setor: string;
  };
};

export default function AdminSectorNewPage({ params }: Props) {
  const sector = getSectorDefinition(params.area, params.setor);

  if (!sector) {
    notFound();
  }

  return <AdminSectorFormPage sector={sector} />;
}
