export const AUTH_COOKIE_NAME = "mailsprint_auth";

function getSecret(): string {
  return process.env.SESSION_SECRET || "fallback-bulkmail-dev-secret-at-least-32-chars";
}

export function getAppPassword(): string {
  return process.env.APP_PASSWORD || "mailsprint2026!";
}

const encoder = new TextEncoder();

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Creates a signed session token for authenticated users using Web Crypto.
 * Format: auth:<timestamp>:<hmac>
 */
export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `auth:${timestamp}`;
  const key = await getHmacKey(getSecret());
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}:${bufferToHex(sig)}`;
}

/**
 * Validates the session token using Web Crypto constant-time verification.
 * Valid for 30 days.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [prefix, timestampStr, receivedHex] = parts;
  if (prefix !== "auth") return false;

  const timestamp = Number.parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;

  // Max age: 30 days
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  if (now - timestamp > maxAge || timestamp > now + 60 * 1000) {
    return false;
  }

  try {
    const payload = `${prefix}:${timestampStr}`;
    const key = await getHmacKey(getSecret());
    const receivedBuf = hexToBuffer(receivedHex);
    return await crypto.subtle.verify("HMAC", key, receivedBuf, encoder.encode(payload));
  } catch {
    return false;
  }
}
