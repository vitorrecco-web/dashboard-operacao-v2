"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAutoRefresh } from "@/components/use-auto-refresh";

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

const KPI_REFRESH_INTERVAL_MS = 30000;

function getKpiCacheKey(areaKey: string | null, sectorKey: string | null) {
  return areaKey && sectorKey ? `sector-kpis:${areaKey}:${sectorKey}` : null;
}

export default function KpiSummaryCard({
  areaKey,
  sectorKey,
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
  const hasLoadedRef = useRef(false);
  const cacheKey = getKpiCacheKey(areaKey, sectorKey);

  useEffect(() => {
    hasLoadedRef.current = false;
    setData(null);
    setLoading(true);

    if (!cacheKey) {
      return;
    }

    try {
      const cachedValue = window.localStorage.getItem(cacheKey);

      if (!cachedValue) {
        return;
      }

      const cachedData = JSON.parse(cachedValue) as KpiResponse;

      if (Array.isArray(cachedData.items) && cachedData.items.length > 0) {
        setData(cachedData);
        hasLoadedRef.current = true;
        setLoading(false);
      }
    } catch {
      window.localStorage.removeItem(cacheKey);
    }
  }, [cacheKey]);

  const loadKpis = useCallback(async () => {
    if (!areaKey || !sectorKey) {
      setData({
        configured: false,
        reason: "Nenhum setor foi configurado para este painel.",
        items: [],
        total: 0,
      });
      hasLoadedRef.current = true;
      setLoading(false);
      return;
    }

    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      const response = await fetch(
        `/api/kpis?area=${encodeURIComponent(areaKey)}&setor=${encodeURIComponent(sectorKey)}&limit=8`,
        {
          cache: "no-store",
        }
      );
      const payload = (await response.json()) as Partial<KpiResponse> & {
        erro?: string;
      };
      const items = Array.isArray(payload.items) ? payload.items : [];

      if (!response.ok) {
        setData((currentData) => {
          if (currentData?.items.length) {
            return currentData;
          }

          return {
            configured: payload.configured ?? true,
            reason:
              payload.reason ??
              payload.erro ??
              "Nao foi possivel consultar os KPIs da planilha agora.",
            items: [],
            total: 0,
          };
        });
        return;
      }

      const nextData = {
        configured: payload.configured ?? true,
        reason: payload.reason ?? null,
        items,
        total: typeof payload.total === "number" ? payload.total : items.length,
      };

      setData(nextData);

      if (cacheKey && items.length > 0) {
        window.localStorage.setItem(cacheKey, JSON.stringify(nextData));
      } else if (cacheKey) {
        window.localStorage.removeItem(cacheKey);
      }
    } catch {
      setData((currentData) => {
        if (currentData?.items.length) {
          return currentData;
        }

        return {
          configured: true,
          reason: "Nao foi possivel consultar os KPIs da planilha agora.",
          items: [],
          total: 0,
        };
      });
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
    }
  }, [areaKey, cacheKey, sectorKey]);

  useAutoRefresh(loadKpis, { intervalMs: KPI_REFRESH_INTERVAL_MS });

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
            Indicadores operacao
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

        <h2>Indicadores operacao</h2>
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
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            {data.items.map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: "18px",
                  border: "1px solid rgba(125, 211, 252, 0.16)",
                  background: "rgba(8, 20, 32, 0.42)",
                  padding: "16px 18px",
                  minHeight: "118px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    color: "#d7e0ea",
                    fontSize: "14px",
                    lineHeight: 1.45,
                  }}
                >
                  {item.label}
                </span>
                <strong
                  style={{
                    color: "#eef7ff",
                    fontSize: "28px",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {item.value}
                </strong>
              </div>
            ))}
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

      <h2>Indicadores operacao</h2>
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
