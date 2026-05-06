"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAutoRefresh } from "@/components/use-auto-refresh";

const TOPICS_REFRESH_INTERVAL_MS = 30000;

export default function MeetingTopicsList({
  destinationKey,
}: {
  destinationKey: string;
}) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    hasLoadedRef.current = false;
    setTopics([]);
    setError("");
    setLoading(true);
  }, [destinationKey]);

  const loadTopics = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      setError("");
      const response = await fetch(
        `/api/alinhamentos?dest=${encodeURIComponent(destinationKey)}`,
        {
          cache: "no-store",
        }
      );
      const data = (await response.json()) as {
        topics?: unknown;
        erro?: string;
      };

      if (!response.ok) {
        setTopics([]);
        setError(data.erro || "Nao foi possivel carregar os alinhamentos.");
        return;
      }

      setTopics(
        Array.isArray(data.topics)
          ? data.topics.filter((topic): topic is string => typeof topic === "string")
          : []
      );
    } catch {
      setTopics([]);
      setError("Nao foi possivel carregar os alinhamentos.");
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
    }
  }, [destinationKey]);

  useAutoRefresh(loadTopics, { intervalMs: TOPICS_REFRESH_INTERVAL_MS });

  if (loading) {
    return <p style={{ marginTop: "24px", color: "#d5e4f0" }}>Carregando alinhamentos...</p>;
  }

  if (topics.length === 0) {
    return (
      <p style={{ marginTop: "24px", color: "#d5e4f0" }}>
        {error || "Nenhum alinhamento cadastrado para este painel ainda."}
      </p>
    );
  }

  return (
    <ul className="lista-alinhamentos">
      {topics.map((topic) => (
        <li key={topic}>{topic}</li>
      ))}
    </ul>
  );
}
