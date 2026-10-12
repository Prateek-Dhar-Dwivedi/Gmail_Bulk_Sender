import { describe, it, expect } from "vitest";
import { sanitizeCsvCell, buildSafeCsv } from "@/lib/security/csv";

describe("CSV Formula Injection Protection (CWE-1236)", () => {
  it("escapes cells starting with formula trigger characters with a leading single quote", () => {
    expect(sanitizeCsvCell("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitizeCsvCell("+12345")).toBe("'+12345");
    expect(sanitizeCsvCell("-cmd|' /C calc'!A0")).toBe("'-cmd|' /C calc'!A0");
    expect(sanitizeCsvCell("@HYPERLINK('http://malicious.com')")).toBe("'@HYPERLINK('http://malicious.com')");
  });

  it("leaves normal safe alphanumeric text and emails unescaped", () => {
    expect(sanitizeCsvCell("john.doe@example.com")).toBe("john.doe@example.com");
    expect(sanitizeCsvCell("Campaign 2026")).toBe("Campaign 2026");
    expect(sanitizeCsvCell(100)).toBe("100");
  });

  it("escapes quotes and wraps in double quotes when cell contains commas or line breaks", () => {
    expect(sanitizeCsvCell('Hello, "World"')).toBe('"Hello, ""World"""');
    expect(sanitizeCsvCell("Multi\nLine")).toBe('"Multi\nLine"');
  });

  it("builds a safe full CSV document with headers and sanitized rows", () => {
    const headers = ["Order", "Email", "Status", "Note"];
    const rows = [
      [1, "safe@example.com", "sent", "Normal note"],
      [2, "danger@example.com", "failed", "=1+1"],
      [3, "comma@test.com", "sent", "Note with, comma"],
    ];

    const csv = buildSafeCsv(headers, rows);
    expect(csv).toContain("safe@example.com");
    expect(csv).toContain("'=1+1");
    expect(csv).toContain('"Note with, comma"');
  });
});
