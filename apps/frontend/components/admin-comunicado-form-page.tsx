"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getAllComunicadoDestinations,
  getComunicadoDestinationByKey,
} from "@/lib/comunicado-destinations";

export default function AdminComunicadoFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinations = useMemo(() => getAllComunicadoDestinations(), []);
  const searchDest = searchParams.get("dest") || "geral";

  const [destinoKey, setDestinoKey] = useState(searchDest);
  const [titulo, setTitulo] = useState("");
  const [tag, setTag] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);

  const destination = useMemo(
    () =>
      getComunicadoDestinationByKey(destinoKey) ||
      getComunicadoDestinationByKey("geral"),
    [destinoKey]
  );

  useEffect(() => {
    setDestinoKey(searchDest);
  }, [searchDest]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!destination) {
      alert("Selecione um destino valido.");
      return;
    }

    if (!titulo || !tag || !resumo || !conteudo) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);

      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("tag", tag);
      formData.append("resumo", resumo);
      formData.append("conteudo", conteudo);
      formData.append("data", new Date().toISOString().split("T")[0]);

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const resposta = await fetch(destination.apiPath, {
        method: "POST",
        body: formData,
      });
      const data = await resposta.json();

      if (!resposta.ok) {
        alert(data?.detalhe || data?.erro || "Erro ao criar comunicado.");
        return;
      }

      alert("Comunicado criado com sucesso.");
      router.push(`/admin/comunicados-gerais/gerenciar?dest=${destination.key}`);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o comunicado."
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
              Voltar
            </button>

            <span className="tag">ADMIN</span>
          </div>

          <Link href="/central" className="botao-admin">
            Area operacao
          </Link>
        </div>

        <h1>Novo comunicado</h1>
        <p>Crie um comunicado e escolha em qual area ou setor ele deve aparecer.</p>
      </section>

      <section className="card-setor">
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "22px" }}>
          <div>
            <label
              htmlFor="destino"
              style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
            >
              Destino do comunicado
            </label>
            <select
              id="destino"
              value={destinoKey}
              onChange={(event) => setDestinoKey(event.target.value)}
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
              htmlFor="titulo"
              style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
            >
              Titulo do comunicado
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: Mudanca no fluxo operacional"
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
                style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
              >
                Tag / area
              </label>
              <input
                id="tag"
                type="text"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                placeholder="Ex: Operacao, Processo, Qualidade"
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
                style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
              >
                Resumo
              </label>
              <input
                id="resumo"
                type="text"
                value={resumo}
                onChange={(event) => setResumo(event.target.value)}
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
              style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
            >
              Corpo do comunicado
            </label>
            <textarea
              id="conteudo"
              value={conteudo}
              onChange={(event) => setConteudo(event.target.value)}
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

          <div>
            <label
              htmlFor="pdf"
              style={{ display: "block", marginBottom: "10px", fontWeight: 700, fontSize: "16px" }}
            >
              PDF do comunicado
            </label>
            <input
              id="pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
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
