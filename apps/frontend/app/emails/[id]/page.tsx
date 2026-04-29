import Link from "next/link";
import { notFound } from "next/navigation";
import EmailStatusForm from "./status-form";
import {
  getMailboxEmailById,
  listMailboxEmailAttachments,
  markMailboxEmailAsRead,
} from "@/lib/email-sync";

type Props = {
  params: {
    id: string;
  };
  searchParams?: {
    origem?: string;
  };
};

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMimeType(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return "PDF";
    case "image/png":
      return "PNG";
    case "image/jpeg":
    case "image/jpg":
      return "JPG";
    case "text/plain":
      return "TXT";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "DOCX";
    case "application/msword":
      return "DOC";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "XLSX";
    case "application/vnd.ms-excel":
      return "XLS";
    default:
      return mimeType;
  }
}

export default function EmailDetailPage({ params, searchParams }: Props) {
  const id = Number(params.id);
  const backHref = searchParams?.origem === "central" ? "/central" : "/emails";
  const backLabel =
    searchParams?.origem === "central"
      ? "Voltar para a central"
      : "Voltar para a caixa";

  if (Number.isNaN(id)) {
    notFound();
  }

  const existingEmail = getMailboxEmailById(id);

  if (!existingEmail) {
    notFound();
  }

  if (existingEmail.status !== "lido") {
    markMailboxEmailAsRead(id);
  }

  const email = getMailboxEmailById(id);

  if (!email) {
    notFound();
  }

  const attachments = listMailboxEmailAttachments(email.id);

  return (
    <main className="pagina">
      <div style={{ marginBottom: "24px" }}>
        <Link href={backHref} style={{ textDecoration: "none", color: "inherit" }}>
          <button className="botao">{backLabel}</button>
        </Link>
      </div>

      <article className="card-setor" style={{ display: "grid", gap: "20px" }}>
        <div
          className="card-topo"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <span className="badge">{email.status === "lido" ? "LIDO" : "NAO LIDO"}</span>
            {email.hasAttachments ? <span className="badge">ANEXOS</span> : null}
            <EmailStatusForm id={email.id} currentStatus={email.status} />
          </div>

          <span style={{ color: "#7dd3fc", fontWeight: 700 }}>
            {new Date(email.receivedAt).toLocaleString("pt-BR")}
          </span>
        </div>

        <div>
          <h1 style={{ marginBottom: "12px" }}>{email.subject}</h1>
          <p style={{ margin: "0 0 8px" }}>
            <strong>De:</strong>{" "}
            {email.fromName ? `${email.fromName} <${email.fromEmail}>` : email.fromEmail}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Caixa:</strong> {email.mailbox}
          </p>
        </div>

        <section
          style={{
            background: "#0b1a28",
            border: "1px solid #1d3449",
            borderRadius: "16px",
            padding: "20px",
            color: "#d7e0ea",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {email.bodyText || email.snippet || "Sem conteudo disponivel."}
        </section>

        {attachments.length > 0 ? (
          <section className="card-setor" style={{ display: "grid", gap: "14px" }}>
            <div className="card-topo">
              <span className="badge">ANEXOS</span>
            </div>

            <h2 style={{ margin: 0 }}>Arquivos anexados</h2>

            <div style={{ display: "grid", gap: "10px" }}>
              {attachments.map((attachment) => (
                <article
                  key={attachment.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    padding: "14px 16px",
                    border: "1px solid #1d3449",
                    borderRadius: "14px",
                    background: "#0b1a28",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontWeight: 700,
                        color: "#f5f7fa",
                        wordBreak: "break-word",
                      }}
                    >
                      {attachment.filename}
                    </p>
                    <p style={{ margin: 0, color: "#7dd3fc", fontSize: "14px" }}>
                      {formatMimeType(attachment.mimeType)} | {formatFileSize(attachment.size)}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a
                      href={`/api/emails/attachments/${attachment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="botao"
                      style={{ textDecoration: "none" }}
                    >
                      Abrir
                    </a>
                    <a
                      href={`/api/emails/attachments/${attachment.id}?download=1`}
                      className="botao"
                      style={{ textDecoration: "none" }}
                    >
                      Baixar
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
