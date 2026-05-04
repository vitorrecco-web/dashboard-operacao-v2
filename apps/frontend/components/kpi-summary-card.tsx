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
  variant = "card",
  badgeLabel,
}: {
  areaKey: string | null;
  sectorKey: string | null;
  sectorName: string | null;
  variant?: "card" | "inline" | "hero";
  badgeLabel?: string | null;
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

  if (variant === "inline") {
    return (
      <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span className="badge">KPIS</span>
          <strong style={{ color: "#eef7ff", fontSize: "14px" }}>
            Indicadores - {sectorName}
          </strong>
        </div>

        {loading ? (
          <div
            style={{
              color: "#d7e0ea",
              border: "1px dashed rgba(125, 211, 252, 0.28)",
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
              border: "1px dashed rgba(125, 211, 252, 0.28)",
              borderRadius: "14px",
              padding: "16px",
              lineHeight: 1.5,
            }}
          >
            {data.reason}
          </div>
        ) : data?.items.length ? (
          <div
            style={{
              overflowX: "auto",
              borderRadius: "16px",
              border: "1px solid rgba(125, 211, 252, 0.16)",
              background: "rgba(8, 20, 32, 0.42)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "420px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: "#7dd3fc",
                      fontSize: "12px",
                      letterSpacing: "0.4px",
                      borderBottom: "1px solid rgba(125, 211, 252, 0.14)",
                    }}
                  >
                    Indicador
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "14px 16px",
                      color: "#7dd3fc",
                      fontSize: "12px",
                      letterSpacing: "0.4px",
                      borderBottom: "1px solid rgba(125, 211, 252, 0.14)",
                    }}
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.label}>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "#eef7ff",
                        fontSize: "14px",
                        lineHeight: 1.45,
                        borderBottom: "1px solid rgba(125, 211, 252, 0.08)",
                      }}
                    >
                      {item.label}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "#eef7ff",
                        fontSize: "15px",
                        fontWeight: 700,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid rgba(125, 211, 252, 0.08)",
                      }}
                    >
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              color: "#d7e0ea",
              border: "1px dashed rgba(125, 211, 252, 0.28)",
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            Nenhum indicador encontrado na planilha.
          </div>
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <article className="card-destaque">
        <div className="card-topo">
          <span className="badge">KPIS</span>
          {badgeLabel ? <span className="perfil-chip">{badgeLabel}</span> : null}
        </div>

        <h2>Indicadores - {sectorName}</h2>
        <p>
          Consulte os indicadores operacionais lidos automaticamente da planilha de KPIs.
        </p>

        {loading ? (
          <div
            style={{
              marginTop: "24px",
              color: "#d7e0ea",
              border: "1px dashed rgba(125, 211, 252, 0.28)",
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            Carregando indicadores...
          </div>
        ) : data?.reason ? (
          <div
            style={{
              marginTop: "24px",
              color: "#d7e0ea",
              border: "1px dashed rgba(125, 211, 252, 0.28)",
              borderRadius: "16px",
              padding: "18px",
              lineHeight: 1.5,
            }}
          >
            {data.reason}
          </div>
        ) : data?.items.length ? (
          <div
            style={{
              marginTop: "24px",
              overflowX: "auto",
              borderRadius: "18px",
              border: "1px solid rgba(125, 211, 252, 0.16)",
              background: "rgba(8, 20, 32, 0.42)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "520px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 18px",
                      color: "#7dd3fc",
                      fontSize: "12px",
                      letterSpacing: "0.4px",
                      borderBottom: "1px solid rgba(125, 211, 252, 0.14)",
                    }}
                  >
                    Indicador
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "14px 18px",
                      color: "#7dd3fc",
                      fontSize: "12px",
                      letterSpacing: "0.4px",
                      borderBottom: "1px solid rgba(125, 211, 252, 0.14)",
                    }}
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.label}>
                    <td
                      style={{
                        padding: "16px 18px",
                        color: "#eef7ff",
                        fontSize: "15px",
                        lineHeight: 1.45,
                        borderBottom: "1px solid rgba(125, 211, 252, 0.08)",
                      }}
                    >
                      {item.label}
                    </td>
                    <td
                      style={{
                        padding: "16px 18px",
                        color: "#eef7ff",
                        fontSize: "16px",
                        fontWeight: 700,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid rgba(125, 211, 252, 0.08)",
                      }}
                    >
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              marginTop: "24px",
              color: "#d7e0ea",
              border: "1px dashed rgba(125, 211, 252, 0.28)",
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            Nenhum indicador encontrado na planilha.
          </div>
        )}
      </article>
    );
  }

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
