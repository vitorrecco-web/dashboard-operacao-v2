import { notFound, redirect } from "next/navigation";
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

  redirect(`/admin/novo?dest=${sector.setorId}`);
}
