"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PreviewOption = {
  key: string;
  label: string;
};

export default function AdminPreviewSelector({
  options,
  currentPreviewKey,
}: {
  options: PreviewOption[];
  currentPreviewKey?: string;
}) {
  const router = useRouter();
  const [selectedPreview, setSelectedPreview] = useState(currentPreviewKey ?? "");

  function handlePreview() {
    if (!selectedPreview) {
      router.push("/");
      return;
    }

    router.push(`/?preview=${encodeURIComponent(selectedPreview)}`);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: "22px",
        maxWidth: "720px",
      }}
    >
      <select
        value={selectedPreview}
        onChange={(event) => setSelectedPreview(event.target.value)}
        style={{
          flex: "1 1 320px",
          padding: "14px 16px",
          borderRadius: "14px",
          border: "1px solid rgba(125, 211, 252, 0.15)",
          background: "#071d33",
          color: "#fff",
          fontSize: "15px",
          outline: "none",
        }}
      >
        <option value="">Selecionar setor para visualizar</option>
        {options.map((item) => (
          <option key={item.key} value={item.key}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="botao"
        onClick={handlePreview}
        style={{ border: "none" }}
      >
        Visualizar
      </button>

      {currentPreviewKey ? (
        <button
          type="button"
          className="botao-admin"
          onClick={() => {
            setSelectedPreview("");
            router.push("/");
          }}
          style={{ border: "none", cursor: "pointer" }}
        >
          Limpar
        </button>
      ) : null}
    </div>
  );
}
