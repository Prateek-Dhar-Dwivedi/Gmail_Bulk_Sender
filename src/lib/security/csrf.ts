import crypto from "node:crypto";

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "fallback-bulkmail-dev-secret-at-least-32-chars";
}

/**
 * Creates a signed OAuth state token containing a timestamp and nonce to prevent CSRF.
 */
export function generateOAuthState(): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();
  const payload = `${timestamp}:${nonce}`;
  const hmac = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  return `${payload}:${hmac}`;
}

/**
 * Validates the OAuth state token.
 * Rejects if expired (> 15 minutes) or if signature does not match.
 */
export function verifyOAuthState(state: string): boolean {
  if (!state) return false;
  const parts = state.split(":");
  if (parts.length !== 3) return false;

  const [timestampStr, nonce, receivedHmac] = parts;
  const timestamp = Number.parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;

  // Max age: 15 minutes (900,000 ms)
  const now = Date.now();
  if (now - timestamp > 15 * 60 * 1000 || timestamp > now + 60 * 1000) {
    return false;
  }

  const payload = `${timestampStr}:${nonce}`;
  const expectedHmac = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedHmac, "hex"),
      Buffer.from(expectedHmac, "hex")
    );
  } catch {
    return false;
  }
}
