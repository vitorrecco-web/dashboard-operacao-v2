"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getAllComunicadoDestinations,
  getComunicadoDestinationByKey,
} from "@/lib/comunicado-destinations";

export default function AdminMeetingTopicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinations = useMemo(() => getAllComunicadoDestinations(), []);
  const searchDest = searchParams.get("dest") || "geral";

  const [destinoKey, setDestinoKey] = useState(searchDest);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const destination = useMemo(
    () =>
      getComunicadoDestinationByKey(destinoKey) ||
      getComunicadoDestinationByKey("geral"),
    [destinoKey]
  );

  useEffect(() => {
    setDestinoKey(searchDest);
  }, [searchDest]);

  useEffect(() => {
    let active = true;

    async function loadTopics() {
      try {
        setLoading(true);
        setFeedback("");
        setError("");

        const response = await fetch(`/api/alinhamentos?dest=${encodeURIComponent(destinoKey)}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          if (!active) return;
          setError(data?.erro || "Nao foi possivel carregar os alinhamentos.");
          setContent("");
          return;
        }

        if (!active) return;
        setContent(Array.isArray(data.topics) ? data.topics.join("\n") : "");
      } catch {
        if (!active) return;
        setError("Nao foi possivel carregar os alinhamentos.");
        setContent("");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTopics();

    return () => {
      active = false;
    };
  }, [destinoKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    setError("");

    const topics = content
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/alinhamentos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ destinationKey: destinoKey, topics }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.erro || "Nao foi possivel salvar os alinhamentos.");
        return;
      }

      setContent((data.topics ?? []).join("\n"));
      setFeedback("Alinhamentos atualizados com sucesso.");
      router.refresh();
    } catch {
      setError("Nao foi possivel salvar os alinhamentos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="pagina">
      <section className="hero">
        <div className="topo-painel">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => router.back()}
              className="botao-admin"
              style={{ border: "none", cursor: "pointer" }}
            >
              Voltar
            </button>
            <span className="tag">ADMIN</span>
          </div>

          <Link href="/" className="botao-admin">
            Ver painel
          </Link>
        </div>

        <h1>Alinhamentos da reuniao</h1>
        <p>
          Escolha o destino do alinhamento, como comunicados gerais ou um setor
          especifico. Cada linha salva um bullet point para aquele painel.
        </p>
      </section>

      <section className="card-setor">
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "22px" }}>
          <div>
            <label
              htmlFor="destino"
              style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
            >
              Destino do alinhamento
            </label>
            <select
              id="destino"
              value={destinoKey}
              onChange={(event) => {
                const nextDest = event.target.value;
                setDestinoKey(nextDest);
                router.replace(`/admin/alinhamentos?dest=${encodeURIComponent(nextDest)}`);
              }}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid rgba(125, 211, 252, 0.15)",
                background: "#071d33",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
              }}
            >
              {destinations.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p style={{ margin: "10px 0 0", color: "#b8c4d1", fontSize: "14px" }}>
              {destination?.descricao}
            </p>
          </div>

          <div>
            <label
              htmlFor="alinhamentos"
              style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
            >
              Pontos do alinhamento
            </label>
            <textarea
              id="alinhamentos"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={"Ex.:\nValidar produtividade do turno\nLevar pendencias operacionais\nConfirmar riscos e prioridades"}
              rows={10}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid rgba(125, 211, 252, 0.15)",
                background: "#071d33",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                resize: "vertical",
                opacity: loading ? 0.7 : 1,
              }}
            />
          </div>

          <p style={{ margin: 0, color: "#b8c4d1", lineHeight: 1.6 }}>
            {destination?.key === "geral"
              ? "Esses itens aparecerao para todos os supervisores."
              : "Esses itens serao somados aos alinhamentos gerais para os supervisores desse setor."}
          </p>

          {feedback ? (
            <p style={{ margin: 0, color: "#86efac", fontWeight: 700 }}>{feedback}</p>
          ) : null}

          {error ? (
            <p style={{ margin: 0, color: "#fca5a5", fontWeight: 700 }}>{error}</p>
          ) : null}

          <button
            type="submit"
            className="botao"
            disabled={saving || loading}
            style={{
              border: "none",
              cursor: saving || loading ? "not-allowed" : "pointer",
              opacity: saving || loading ? 0.7 : 1,
            }}
          >
            {saving ? "Salvando..." : "Salvar alinhamentos"}
          </button>
        </form>
      </section>
    </main>
  );
}
