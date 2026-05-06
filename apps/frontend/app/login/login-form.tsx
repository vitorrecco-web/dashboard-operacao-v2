"use client";

import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Digite seu login para entrar.");
      return;
    }

    if (!password.trim()) {
      setError("Digite a senha para entrar.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.erro || "Nao foi possivel entrar.");
        return;
      }

      window.location.assign(
        data.redirectTo ?? (data.role === "admin" ? "/admin" : "/")
      );
    } catch {
      setError("Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-setor"
      style={{
        display: "grid",
        gap: "18px",
        width: "100%",
        maxWidth: "460px",
      }}
    >
      <div className="card-topo">
        <span className="badge">ACESSO</span>
      </div>

      <div>
        <h1 style={{ marginBottom: "8px" }}>Entrar no painel</h1>
        <p style={{ margin: 0 }}>
          Use o login e a senha do seu perfil para acessar sua area.
        </p>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        <label htmlFor="username" style={{ fontWeight: 700 }}>
          Login
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Ex.: picking001"
          autoComplete="username"
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

        <label htmlFor="password" style={{ fontWeight: 700 }}>
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Digite sua senha"
          autoComplete="current-password"
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

      {error ? (
        <p
          style={{
            margin: 0,
            color: "#fca5a5",
            fontWeight: 700,
          }}
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="botao"
        disabled={loading}
        style={{
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
