import { notFound } from "next/navigation";
import AdminAreaPage from "@/components/admin-area-page";
import { getAreaName, getSectorsByArea } from "@/lib/sector-config";

type Props = {
  params: {
    area: string;
  };
};

export default function AdminAreaRoutePage({ params }: Props) {
  const areaNome = getAreaName(params.area);
  const sectors = getSectorsByArea(params.area);

  if (!areaNome || sectors.length === 0) {
    notFound();
  }

  return <AdminAreaPage areaNome={areaNome} sectors={sectors} />;
}
