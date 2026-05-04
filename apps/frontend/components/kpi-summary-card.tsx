"use client";

import { useEffect, useState } from "react";

type KpiRecord = {
  label: string;
  value: string;
};

type KpiResponse = {
  configured: boolean;
  reason: string | null;
  items: KpiRecord[];
  total: number;
};

export default function KpiSummaryCard({
  areaKey,
  sectorKey,
  sectorName,
}: {
  areaKey: string | null;
  sectorKey: string | null;
  sectorName: string | null;
}) {
  const [data, setData] = useState<KpiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKpis() {
      if (!areaKey || !sectorKey) {
        setData({
          configured: false,
          reason: "Nenhum setor foi configurado para este painel.",
          items: [],
          total: 0,
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/kpis?area=${encodeURIComponent(areaKey)}&setor=${encodeURIComponent(sectorKey)}&limit=8`,
          {
            cache: "no-store",
          }
        );
        const payload = (await response.json()) as KpiResponse;
        setData(payload);
      } catch {
        setData({
          configured: true,
          reason: "Nao foi possivel consultar os KPIs da planilha agora.",
          items: [],
          total: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadKpis();
  }, [areaKey, sectorKey]);

  return (
    <article className="card-setor">
      <div className="card-topo">
        <span className="badge">KPIS</span>
      </div>

      <h2>Indicadores - {sectorName}</h2>
      <p>
        Consulte os indicadores operacionais lidos automaticamente da planilha de KPIs.
      </p>

      {loading ? (
        <div
          style={{
            color: "#d7e0ea",
            border: "1px dashed #29445b",
            borderRadius: "14px",
            padding: "16px",
          }}
        >
          Carregando indicadores...
        </div>
      ) : data?.reason ? (
        <div
          style={{
            color: "#d7e0ea",
            border: "1px dashed #29445b",
            borderRadius: "14px",
            padding: "16px",
            lineHeight: 1.5,
          }}
        >
          {data.reason}
        </div>
      ) : data?.items.length ? (
        <div style={{ display: "grid", gap: "10px", marginTop: "4px" }}>
          {data.items.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "flex-start",
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#0b1a28",
                border: "1px solid #1d3449",
              }}
            >
              <span
                style={{
                  color: "#d7e0ea",
                  fontSize: "14px",
                  lineHeight: 1.45,
                  flex: 1,
                }}
              >
                {item.label}
              </span>
              <strong
                style={{
                  color: "#7dd3fc",
                  fontSize: "15px",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </strong>
            </div>
          ))}

          {data.total > data.items.length ? (
            <span style={{ color: "#9fb3c8", fontSize: "13px" }}>
              Mostrando {data.items.length} de {data.total} indicadores da planilha.
            </span>
          ) : null}
        </div>
      ) : (
        <div
          style={{
            color: "#d7e0ea",
            border: "1px dashed #29445b",
            borderRadius: "14px",
            padding: "16px",
          }}
        >
          Nenhum indicador encontrado na planilha.
        </div>
      )}
    </article>
  );
}
