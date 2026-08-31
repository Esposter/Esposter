import { normalizeString } from "#src/util/text/normalizeString";
import { describe, expect, test } from "vitest";

describe(normalizeString, () => {
  test("trims whitespace and handles nullish", () => {
    expect.hasAssertions();

    expect(normalizeString(" a ")).toBe("a");
    expect(normalizeString(" ")).toBe("");
    expect(normalizeString(null)).toBe("");
    expect(normalizeString(undefined)).toBe("");
  });
});
