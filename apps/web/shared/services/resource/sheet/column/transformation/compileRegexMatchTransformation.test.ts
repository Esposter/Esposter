import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { RegexMatchTransformation } from "#shared/models/resource/sheet/column/transformation/RegexMatchTransformation";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { compileRegexMatchTransformation } from "#shared/services/resource/sheet/column/transformation/compileRegexMatchTransformation";
import { describe, expect, test } from "vitest";

const readRegexMatch = (transformation: RegexMatchTransformation, value: ColumnValue) =>
  compileRegexMatchTransformation(transformation, () => undefined)({ readSource: () => () => value, rows: [] })(
    createRow({}),
  );

describe(compileRegexMatchTransformation, () => {
  const baseTransformation: RegexMatchTransformation = {
    groupIndex: 1,
    pattern: "@(.+)",
    sourceColumnId: "",
    type: ColumnTransformationType.RegexMatch,
  };

  test("extracts regex capture group", () => {
    expect.hasAssertions();
    expect(readRegexMatch(baseTransformation, "a@b")).toBe("b");
  });

  test("returns null when pattern does not match", () => {
    expect.hasAssertions();
    expect(readRegexMatch(baseTransformation, "a")).toBeNull();
  });

  test("returns null for non-string value", () => {
    expect.hasAssertions();
    expect(readRegexMatch({ ...baseTransformation, pattern: "(.+)" }, 0)).toBeNull();
  });

  test("returns null when group index is out of range", () => {
    expect.hasAssertions();
    expect(readRegexMatch({ ...baseTransformation, groupIndex: 2, pattern: "(a)" }, "a")).toBeNull();
  });
});
