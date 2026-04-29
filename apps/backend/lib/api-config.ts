export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "";

export function buildApiUrl(path: string) {
  if (!path.startsWith("/")) {
    throw new Error("A rota da API deve comecar com '/'.");
  }

  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}
