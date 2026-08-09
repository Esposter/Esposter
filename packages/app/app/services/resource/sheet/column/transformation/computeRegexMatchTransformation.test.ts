import type { RegexMatchTransformation } from "#shared/models/resource/sheet/column/transformation/RegexMatchTransformation";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { computeRegexMatchTransformation } from "@/services/resource/sheet/column/transformation/computeRegexMatchTransformation";
import { describe, expect, test } from "vitest";

describe(computeRegexMatchTransformation, () => {
  const baseTransformation: RegexMatchTransformation = {
    groupIndex: 1,
    pattern: "@(.+)",
    sourceColumnId: "",
    type: ColumnTransformationType.RegexMatch,
  };

  test("extracts regex capture group", () => {
    expect.hasAssertions();
    expect(computeRegexMatchTransformation("user@example.com", baseTransformation)).toBe("example.com");
  });

  test("returns null when pattern does not match", () => {
    expect.hasAssertions();
    expect(computeRegexMatchTransformation("nodomain", baseTransformation)).toBeNull();
  });

  test("returns null for non-string value", () => {
    expect.hasAssertions();
    expect(computeRegexMatchTransformation(0, { ...baseTransformation, pattern: "(.+)" })).toBeNull();
  });

  test("returns null when group index is out of range", () => {
    expect.hasAssertions();
    expect(
      computeRegexMatchTransformation("abc", { ...baseTransformation, groupIndex: 2, pattern: "(abc)" }),
    ).toBeNull();
  });
});
