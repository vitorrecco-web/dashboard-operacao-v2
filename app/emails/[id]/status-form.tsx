"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmailStatusForm({
  id,
  currentStatus,
}: {
  id: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function toggleStatus() {
    try {
      setSaving(true);

      await fetch("/api/emails", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: currentStatus === "lido" ? "nao_lido" : "lido",
        }),
      });

      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={toggleStatus}
      className="botao"
      disabled={saving}
      style={{
        border: "none",
        cursor: saving ? "not-allowed" : "pointer",
        opacity: saving ? 0.7 : 1,
      }}
    >
      {saving
        ? "Atualizando..."
        : currentStatus === "lido"
          ? "Marcar como nao lido"
          : "Marcar como lido"}
    </button>
  );
}
