export default function BackendHomePage() {
  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "32px",
        color: "#0f172a",
      }}
    >
      <h1>Backend do Painel da Operacao</h1>
      <p>Este app hospeda apenas as rotas da API que serao publicadas no Render.</p>
      <p>Use `/api/*` para consumir os recursos do backend.</p>
    </main>
  );
}
