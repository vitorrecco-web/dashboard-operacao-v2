import { getSectorDefinition, getSectorsByArea } from "@/lib/sector-config";

export type ComunicadoDestination = {
  key: string;
  label: string;
  descricao: string;
  areaKey: string | null;
  sectorKey: string | null;
  setorId: string | null;
  apiPath: string;
};

const generalDestination: ComunicadoDestination = {
  key: "geral",
  label: "Comunicados gerais",
  descricao: "Avisos visiveis para toda a operacao.",
  areaKey: null,
  sectorKey: null,
  setorId: null,
  apiPath: "/api/comunicados",
};

export function getAllComunicadoDestinations(): ComunicadoDestination[] {
  const sectors = [...getSectorsByArea("mercearia"), ...getSectorsByArea("fresh")];

  return [
    generalDestination,
    ...sectors.map((sector) => ({
      key: sector.setorId,
      label: `${sector.areaNome} - ${sector.sectorNome}`,
      descricao: sector.adminDescricao,
      areaKey: sector.areaKey,
      sectorKey: sector.sectorKey,
      setorId: sector.setorId,
      apiPath: `/api/setor-comunicados/${sector.areaKey}/${sector.sectorKey}`,
    })),
  ];
}

export function getComunicadoDestinationByKey(key?: string | null) {
  if (!key || key === "geral") {
    return generalDestination;
  }

  const [areaKey, ...sectorParts] = key.split("-");
  const sectorKey = sectorParts.join("-");

  if (!areaKey || !sectorKey) {
    return null;
  }

  const sector = getSectorDefinition(areaKey, sectorKey);

  if (!sector) {
    return null;
  }

  return {
    key: sector.setorId,
    label: `${sector.areaNome} - ${sector.sectorNome}`,
    descricao: sector.adminDescricao,
    areaKey: sector.areaKey,
    sectorKey: sector.sectorKey,
    setorId: sector.setorId,
    apiPath: `/api/setor-comunicados/${sector.areaKey}/${sector.sectorKey}`,
  } satisfies ComunicadoDestination;
}
