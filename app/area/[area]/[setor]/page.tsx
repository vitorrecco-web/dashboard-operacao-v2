import { notFound } from "next/navigation";
import SectorOperationalPage from "@/components/sector-operational-page";
import { getSectorDefinition } from "@/lib/sector-config";

type Props = {
  params: {
    area: string;
    setor: string;
  };
};

export default function SectorPage({ params }: Props) {
  const sector = getSectorDefinition(params.area, params.setor);

  if (!sector) {
    notFound();
  }

  return <SectorOperationalPage sector={sector} />;
}
