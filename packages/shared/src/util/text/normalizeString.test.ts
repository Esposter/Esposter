import { createNormalizedStringSchema, normalizeString } from "@/util/text/normalizeString";
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

describe(createNormalizedStringSchema, () => {
  test("trims whitespace before validating", () => {
    expect.hasAssertions();

    expect(createNormalizedStringSchema(5).parse(" a ")).toBe("a");
    expect(createNormalizedStringSchema(5).parse(" ")).toBe("");
  });
});
