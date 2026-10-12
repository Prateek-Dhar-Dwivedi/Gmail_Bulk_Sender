import { describe, it, expect } from "vitest";
import { encryptToken, decryptToken } from "@/lib/security/crypto";
import { generateOAuthState, verifyOAuthState } from "@/lib/security/csrf";

describe("Security & Crypto Operations", () => {
  it("successfully encrypts and decrypts OAuth tokens via AES-256-GCM", () => {
    const originalToken = "ya29.a0AfH6SMD_random_secret_refresh_token_123456789";
    const encrypted = encryptToken(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted.split(":")).toHaveLength(3); // iv:tag:ciphertext

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it("detects tampering with ciphertext and throws an error", () => {
    const originalToken = "sample-secret-token";
    const encrypted = encryptToken(originalToken);
    const [iv, tag, cipher] = encrypted.split(":");

    // Flip bits in ciphertext
    const tamperedCipher = cipher.substring(0, cipher.length - 2) + "ff";
    const tamperedPayload = `${iv}:${tag}:${tamperedCipher}`;

    expect(() => decryptToken(tamperedPayload)).toThrow();
  });

  it("detects tampering with authentication tag and throws an error", () => {
    const originalToken = "sample-secret-token";
    const encrypted = encryptToken(originalToken);
    const [iv, tag, cipher] = encrypted.split(":");

    // Flip bits in auth tag
    const tamperedTag = tag.substring(0, tag.length - 2) + "00";
    const tamperedPayload = `${iv}:${tamperedTag}:${cipher}`;

    expect(() => decryptToken(tamperedPayload)).toThrow();
  });

  it("generates and verifies HMAC-signed OAuth state for CSRF defense", () => {
    const state = generateOAuthState();
    expect(verifyOAuthState(state)).toBe(true);

    // Tampered state should fail
    const tamperedState = state.substring(0, state.length - 4) + "abcd";
    expect(verifyOAuthState(tamperedState)).toBe(false);

    // Empty or corrupted state should fail
    expect(verifyOAuthState("")).toBe(false);
    expect(verifyOAuthState("invalid:state")).toBe(false);
  });
});
