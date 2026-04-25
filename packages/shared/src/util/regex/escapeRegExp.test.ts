import { escapeRegExp } from "@/util/regex/escapeRegExp";
import { describe, expect, test } from "vitest";

describe(escapeRegExp, () => {
  test("escapes", () => {
    expect.hasAssertions();

    expect(escapeRegExp("")).toBe("");
    expect(escapeRegExp(`.*+?^\${}()|[]\\`)).toBe(String.raw`\.\*\+\?\^\$\{\}\(\)\|\[\]\\`);
  });
});
