import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "@/lib/comunicados-db";

const comunicadoPdfDir = path.join(dataDir, "comunicado-pdfs");

function sanitizeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function ensurePdfDir() {
  await fs.mkdir(comunicadoPdfDir, { recursive: true });
}

export async function saveComunicadoPdf(file: File) {
  const fileName = file.name?.trim() || "comunicado.pdf";
  const isPdf =
    file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("Envie um arquivo PDF valido.");
  }

  await ensurePdfDir();

  const safeName = sanitizeFileName(fileName.replace(/\.pdf$/i, "")) || "comunicado";
  const storedName = `${Date.now()}-${randomUUID()}-${safeName}.pdf`;
  const filePath = path.join(comunicadoPdfDir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);

  return `/api/comunicados?pdf=${encodeURIComponent(storedName)}`;
}

export function resolveComunicadoPdfPath(filename: string) {
  return path.join(comunicadoPdfDir, path.basename(filename));
}
