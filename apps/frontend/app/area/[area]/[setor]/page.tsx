import { notFound } from "next/navigation";
import SectorOperationalPage from "@/components/sector-operational-page";
import { getSession } from "@/lib/server-session";
import { getSectorDefinition } from "@/lib/sector-config";

type Props = {
  params: {
    area: string;
    setor: string;
  };
  searchParams?: {
    preview?: string;
  };
};

export default async function SectorPage({ params, searchParams }: Props) {
  const session = await getSession();
  const sector = getSectorDefinition(params.area, params.setor);
  const previewKey = searchParams?.preview ?? "";

  if (!sector) {
    notFound();
  }

  return (
    <SectorOperationalPage
      sector={sector}
      backHref={
        session?.role === "admin"
          ? previewKey
            ? `/?preview=${encodeURIComponent(previewKey)}`
            : `/`
          : "/"
      }
    />
  );
}
