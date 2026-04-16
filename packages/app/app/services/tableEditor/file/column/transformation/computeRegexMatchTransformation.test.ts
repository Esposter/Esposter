import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { computeRegexMatchTransformation } from "@/services/tableEditor/file/column/transformation/computeRegexMatchTransformation";
import { describe, expect, test } from "vitest";

describe(computeRegexMatchTransformation, () => {
  test("extracts regex capture group", () => {
    expect.hasAssertions();
    expect(
      computeRegexMatchTransformation("user@example.com", {
        groupIndex: 1,
        pattern: "@(.+)",
        sourceColumnId: "",
        type: ColumnTransformationType.RegexMatch,
      }),
    ).toBe("example.com");
  });

  test("returns null when pattern does not match", () => {
    expect.hasAssertions();
    expect(
      computeRegexMatchTransformation("nodomain", {
        groupIndex: 1,
        pattern: "@(.+)",
        sourceColumnId: "",
        type: ColumnTransformationType.RegexMatch,
      }),
    ).toBeNull();
  });

  test("returns null for non-string value", () => {
    expect.hasAssertions();
    expect(
      computeRegexMatchTransformation(0, {
        groupIndex: 1,
        pattern: "(.+)",
        sourceColumnId: "",
        type: ColumnTransformationType.RegexMatch,
      }),
    ).toBeNull();
  });

  test("returns null when group index is out of range", () => {
    expect.hasAssertions();
    expect(
      computeRegexMatchTransformation("abc", {
        groupIndex: 2,
        pattern: "(abc)",
        sourceColumnId: "",
        type: ColumnTransformationType.RegexMatch,
      }),
    ).toBeNull();
  });
});
