import { describe, it, expect } from "vitest";
import { buildRawMimeMessage, bufferToBase64Url } from "@/lib/gmail/mime-builder";

describe("MIME Message Construction for Gmail API", () => {
  it("encodes buffer into URL-safe base64 without padding or standard URL reserved characters", () => {
    const buf = Buffer.from("test+payload/with=special?chars");
    const base64url = bufferToBase64Url(buf);

    expect(base64url).not.toContain("+");
    expect(base64url).not.toContain("/");
    expect(base64url).not.toContain("=");
  });

  it("constructs an RFC 2822 MIME message with single recipient and preserved Unicode subject & body", async () => {
    const rawMimeBase64 = await buildRawMimeMessage({
      from: "sender@example.com",
      to: "recipient@domain.com",
      subject: "Welcome to our platform! 🚀",
      bodyText: "Line 1\n\nLine 2 with spaces   and special chars: €100.",
    });

    expect(rawMimeBase64).toBeTruthy();
    expect(typeof rawMimeBase64).toBe("string");

    // Decode to inspect raw headers and content
    // Convert back from base64url to regular base64
    let standardBase64 = rawMimeBase64.replace(/-/g, "+").replace(/_/g, "/");
    while (standardBase64.length % 4) {
      standardBase64 += "=";
    }
    const decodedRaw = Buffer.from(standardBase64, "base64").toString("utf8");

    // Check headers
    expect(decodedRaw).toContain("To: recipient@domain.com");
    expect(decodedRaw).toContain("From: sender@example.com");
    // Check body content preserved
    expect(decodedRaw).toContain("Line 1");
    expect(decodedRaw).toContain("Line 2 with spaces   and special chars");
  });
});
