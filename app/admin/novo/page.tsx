"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoComunicadoPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [tag, setTag] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!titulo || !tag || !resumo || !conteudo) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch("/api/comunicados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          tag,
          resumo,
          conteudo,
          data: new Date().toISOString().split("T")[0],
          tipo: "geral",
          setor: null,
        }),
      });

      const data = await resposta.json();
      console.log("Resposta da API:", data);

      if (!resposta.ok) {
        alert(data?.detalhe || data?.erro || "Erro ao criar comunicado.");
        return;
      }

      alert("Comunicado criado com sucesso.");
      router.push("/admin/comunicados-gerais/gerenciar");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o comunicado."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina">
      <section className="hero">
        <div
          className="topo-painel"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.back()}
              className="botao-admin"
              style={{ border: "none", cursor: "pointer" }}
            >
              ← Voltar
            </button>

            <span className="tag">ADMIN</span>
          </div>

          <Link href="/comunicados-gerais" className="botao-admin">
            Área operação
          </Link>
        </div>

        <h1>Novo comunicado</h1>
        <p>
          Crie um comunicado para ser exibido no painel geral da operação.
        </p>
      </section>

      <section className="card-setor">
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "22px",
          }}
        >
          <div>
            <label
              htmlFor="titulo"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              Título do comunicado
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Mudança no fluxo de conferência"
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
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <label
                htmlFor="tag"
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                Tag / área
              </label>
              <input
                id="tag"
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ex: Operação, RH, DP"
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
              />
            </div>

            <div>
              <label
                htmlFor="resumo"
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                Resumo
              </label>
              <input
                id="resumo"
                type="text"
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                placeholder="Resumo curto que aparece no card"
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
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="conteudo"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              Corpo do comunicado
            </label>
            <textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva aqui a mensagem completa do comunicado..."
              rows={10}
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
              }}
            />
          </div>

          <button
            type="submit"
            className="botao"
            disabled={carregando}
            style={{
              border: "none",
              cursor: carregando ? "not-allowed" : "pointer",
              opacity: carregando ? 0.7 : 1,
            }}
          >
            {carregando ? "Salvando..." : "Publicar comunicado"}
          </button>
        </form>
      </section>
    </main>
  );
}