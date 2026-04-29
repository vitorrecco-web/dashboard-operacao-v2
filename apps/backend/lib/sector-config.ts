export type AreaKey = "mercearia" | "fresh";

export type SectorDefinition = {
  areaKey: AreaKey;
  sectorKey: string;
  setorId: string;
  areaNome: string;
  sectorNome: string;
  descricao: string;
  adminDescricao: string;
};

const sectorDefinitions: SectorDefinition[] = [
  {
    areaKey: "mercearia",
    sectorKey: "picking",
    setorId: "mercearia-picking",
    areaNome: "Mercearia",
    sectorNome: "Picking",
    descricao: "Separacao e organizacao dos pedidos de Mercearia.",
    adminDescricao:
      "Gerencie comunicados, mudancas de processo, itens fixados e links do setor de Picking.",
  },
  {
    areaKey: "mercearia",
    sectorKey: "packing",
    setorId: "mercearia-packing",
    areaNome: "Mercearia",
    sectorNome: "Packing",
    descricao: "Empacotamento e preparacao final dos pedidos.",
    adminDescricao:
      "Gerencie comunicados, orientacoes e materiais operacionais do setor de Packing.",
  },
  {
    areaKey: "mercearia",
    sectorKey: "recebimento",
    setorId: "mercearia-recebimento",
    areaNome: "Mercearia",
    sectorNome: "Recebimento",
    descricao: "Entrada, conferencia e validacao de mercadorias.",
    adminDescricao:
      "Gerencie comunicados, processos e documentos do setor de Recebimento.",
  },
  {
    areaKey: "mercearia",
    sectorKey: "reposicao",
    setorId: "mercearia-reposicao",
    areaNome: "Mercearia",
    sectorNome: "Reposicao",
    descricao: "Reposicao de itens e abastecimento da operacao.",
    adminDescricao:
      "Gerencie comunicados e orientacoes operacionais do setor de Reposicao.",
  },
  {
    areaKey: "mercearia",
    sectorKey: "expedicao",
    setorId: "mercearia-expedicao",
    areaNome: "Mercearia",
    sectorNome: "Expedicao",
    descricao: "Organizacao e saida dos pedidos para entrega.",
    adminDescricao:
      "Gerencie comunicados e fluxos operacionais do setor de Expedicao.",
  },
  {
    areaKey: "fresh",
    sectorKey: "recebimento",
    setorId: "fresh-recebimento",
    areaNome: "Fresh",
    sectorNome: "Recebimento",
    descricao: "Entrada, conferencia e validacao de itens Fresh.",
    adminDescricao:
      "Gerencie comunicados, processos e documentos do setor de Recebimento Fresh.",
  },
  {
    areaKey: "fresh",
    sectorKey: "reposicao",
    setorId: "fresh-reposicao",
    areaNome: "Fresh",
    sectorNome: "Reposicao",
    descricao: "Reposicao e abastecimento da area Fresh.",
    adminDescricao:
      "Gerencie comunicados e orientacoes operacionais do setor de Reposicao Fresh.",
  },
  {
    areaKey: "fresh",
    sectorKey: "fracionamento",
    setorId: "fresh-fracionamento",
    areaNome: "Fresh",
    sectorNome: "Fracionamento",
    descricao: "Corte, separacao e preparacao de itens fracionados.",
    adminDescricao:
      "Gerencie comunicados e rotinas operacionais do setor de Fracionamento.",
  },
  {
    areaKey: "fresh",
    sectorKey: "expedicao",
    setorId: "fresh-expedicao",
    areaNome: "Fresh",
    sectorNome: "Expedicao",
    descricao: "Saida e organizacao dos pedidos Fresh para entrega.",
    adminDescricao:
      "Gerencie comunicados e fluxos operacionais do setor de Expedicao Fresh.",
  },
  {
    areaKey: "fresh",
    sectorKey: "picking-packing",
    setorId: "fresh-picking-packing",
    areaNome: "Fresh",
    sectorNome: "Picking/Packing",
    descricao: "Separacao e empacotamento dos pedidos da area Fresh.",
    adminDescricao:
      "Gerencie comunicados e materiais operacionais do setor de Picking/Packing Fresh.",
  },
];

export function getSectorsByArea(areaKey: string) {
  return sectorDefinitions.filter((item) => item.areaKey === areaKey);
}

export function getSectorDefinition(areaKey: string, sectorKey: string) {
  return sectorDefinitions.find(
    (item) => item.areaKey === areaKey && item.sectorKey === sectorKey
  );
}

export function getAreaName(areaKey: string) {
  if (areaKey === "mercearia") return "Mercearia";
  if (areaKey === "fresh") return "Fresh";
  return null;
}
