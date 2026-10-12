import { describe, it, expect } from "vitest";
import { parseRecipients, validateSingleEmail } from "@/lib/validation/email-parser";

describe("Email Parser and Validator", () => {
  it("validates individual email addresses accurately", () => {
    expect(validateSingleEmail("alice@example.com").isValid).toBe(true);
    expect(validateSingleEmail("bob.smith+test@domain.co.uk").isValid).toBe(true);

    // Invalid cases
    expect(validateSingleEmail("").isValid).toBe(false);
    expect(validateSingleEmail("not-an-email").isValid).toBe(false);
    expect(validateSingleEmail("missingdomain@").isValid).toBe(false);
    expect(validateSingleEmail("@missinglocal.com").isValid).toBe(false);
    expect(validateSingleEmail("double@@domain.com").isValid).toBe(false);
    expect(validateSingleEmail("no-tld@domain").isValid).toBe(false);
  });

  it("parses multiple delimiters: newlines, commas, and semicolons", () => {
    const raw = `
      user1@example.com
      user2@example.com, user3@example.com; user4@example.com
    `;
    const result = parseRecipients(raw);

    expect(result.valid).toEqual([
      "user1@example.com",
      "user2@example.com",
      "user3@example.com",
      "user4@example.com",
    ]);
    expect(result.counts.valid).toBe(4);
    expect(result.counts.total).toBe(4);
    expect(result.counts.duplicates).toBe(0);
    expect(result.counts.invalid).toBe(0);
  });

  it("trims surrounding whitespace correctly", () => {
    const raw = "   clean@example.com  ,   \n\t spaces@test.org   ";
    const result = parseRecipients(raw);

    expect(result.valid).toEqual(["clean@example.com", "spaces@test.org"]);
  });

  it("deduplicates identical addresses while strictly preserving original order and first occurrence", () => {
    const raw = `
      first@test.com
      second@test.com
      FIRST@TEST.COM
      third@test.com
      second@test.com
    `;
    const result = parseRecipients(raw);

    expect(result.valid).toEqual([
      "first@test.com",
      "second@test.com",
      "third@test.com",
    ]);
    expect(result.duplicates).toEqual([
      "FIRST@TEST.COM",
      "second@test.com",
    ]);
    expect(result.counts.valid).toBe(3);
    expect(result.counts.duplicates).toBe(2);
  });

  it("identifies malformed addresses and populates invalid list with reasons", () => {
    const raw = `
      valid@example.com
      invalid-one
      another@valid.org
      broken@@domain.com
    `;
    const result = parseRecipients(raw);

    expect(result.valid).toEqual(["valid@example.com", "another@valid.org"]);
    expect(result.invalid.length).toBe(2);
    expect(result.invalid[0].email).toBe("invalid-one");
    expect(result.invalid[1].email).toBe("broken@@domain.com");
    expect(result.counts.valid).toBe(2);
    expect(result.counts.invalid).toBe(2);
    expect(result.counts.total).toBe(4);
  });

  it("handles empty or whitespace-only inputs gracefully", () => {
    const result = parseRecipients("   \n\n\t  ");
    expect(result.valid).toEqual([]);
    expect(result.counts.total).toBe(0);
  });
});
