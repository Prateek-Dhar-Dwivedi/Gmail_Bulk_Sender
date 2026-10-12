import type { RecipientParseResult } from "@/types";

// Standard RFC 5322 simplified regex for email validation
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateSingleEmail(email: string): { isValid: boolean; reason?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, reason: "Address is empty." };
  }
  if (trimmed.length > 254) {
    return { isValid: false, reason: "Address exceeds maximum length of 254 characters." };
  }
  if (!trimmed.includes("@")) {
    return { isValid: false, reason: "Missing '@' symbol." };
  }
  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, reason: "Multiple '@' symbols found." };
  }
  const [local, domain] = parts;
  if (!local) {
    return { isValid: false, reason: "Missing local mailbox part before '@'." };
  }
  if (!domain) {
    return { isValid: false, reason: "Missing domain part after '@'." };
  }
  if (!domain.includes(".")) {
    return { isValid: false, reason: "Domain must include a top-level domain (e.g. .com)." };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, reason: "Invalid email syntax or forbidden characters." };
  }

  return { isValid: true };
}

/**
 * Parses a raw multi-delimiter recipient input string.
 * Supports newlines, commas, and semicolons.
 * Strictly preserves the original order and the first occurrence of duplicate addresses.
 */
export function parseRecipients(rawInput: string): RecipientParseResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      valid: [],
      duplicates: [],
      invalid: [],
      counts: {
        total: 0,
        valid: 0,
        duplicates: 0,
        invalid: 0,
      },
    };
  }

  // Split by newlines, commas, or semicolons
  const tokens = rawInput
    .split(/[\r\n,;]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const valid: string[] = [];
  const duplicates: string[] = [];
  const invalid: { email: string; reason: string }[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const validation = validateSingleEmail(token);
    if (!validation.isValid) {
      invalid.push({ email: token, reason: validation.reason || "Invalid format" });
      continue;
    }

    const normalized = token.toLowerCase();
    if (seen.has(normalized)) {
      duplicates.push(token);
    } else {
      seen.add(normalized);
      valid.push(token);
    }
  }

  return {
    valid,
    duplicates,
    invalid,
    counts: {
      total: tokens.length,
      valid: valid.length,
      duplicates: duplicates.length,
      invalid: invalid.length,
    },
  };
}
