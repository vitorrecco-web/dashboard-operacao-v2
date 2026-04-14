import "./globals.css";

export const metadata = {
  title: "Painel da Operação",
  description: "Painel interno da operação",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}