export const AUTH_COOKIE_NAME = "auth_session";

export type UserRole = "supervisor" | "admin";

type SessionPayload = {
  role: UserRole;
  exp: number;
};

const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(`${normalized}${padding}`);
}

async function importSigningKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET nao foi configurada.");
  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value: string) {
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  const bytes = new Uint8Array(signature);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return base64UrlEncode(binary);
}

export async function createSessionToken(role: UserRole) {
  const payload: SessionPayload = {
    role,
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, receivedSignature] = token.split(".");

  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload);

  if (expectedSignature !== receivedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload)
    ) as SessionPayload;

    if (!payload.role || payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
