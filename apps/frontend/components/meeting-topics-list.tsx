"use client";

import { useEffect, useState } from "react";

export default function MeetingTopicsList({
  destinationKey,
}: {
  destinationKey: string;
}) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTopics() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `/api/alinhamentos?dest=${encodeURIComponent(destinationKey)}`,
          {
            cache: "no-store",
          }
        );
        const data = await response.json();

        if (!active) {
          return;
        }

        if (!response.ok) {
          setTopics([]);
          setError(data?.erro || "Nao foi possivel carregar os alinhamentos.");
          return;
        }

        setTopics(Array.isArray(data?.topics) ? data.topics : []);
      } catch {
        if (!active) {
          return;
        }

        setTopics([]);
        setError("Nao foi possivel carregar os alinhamentos.");
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
  }, [destinationKey]);

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
