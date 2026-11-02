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

const timeRegexMatch = (transformation: RegexMatchTransformation, value: ColumnValue) => {
  const startedAt = performance.now();
  const match = readRegexMatch(transformation, value);
  return { elapsed: performance.now() - startedAt, match };
};

describe(compileRegexMatchTransformation, () => {
  const baseTransformation: RegexMatchTransformation = {
    groupIndex: 1,
    pattern: "@(.+)",
    sourceColumnId: "",
    type: ColumnTransformationType.RegexMatch,
  };
  // Well above RE2's read of a 22-character cell, well below a backtracking engine's
  const STALL_BUDGET_MS = 250;

  test.each([
    ["a capture group reads its text", "@(.+)", 1, "a@b", "b"],
    ["no match reads null", "@(.+)", 1, "a", null],
    ["group 0 is the whole match", "@(.+)", 0, "a@b", "@b"],
    ["a numbered group past the first", "((a)b)", 2, "ab", "a"],
    ["a group past the pattern's groups reads null", "(a)", 2, "a", null],
    ["an unmatched optional group reads null", "(a)?b", 1, "b", null],
    ["an empty match reads the empty string", "a*", 0, "b", ""],
    ["an empty capture reads the empty string", "(a*)b", 1, "b", ""],
    ["a named group is numbered", "(?<domain>[^@]+)$", 1, "a@example.com", "example.com"],
    ["an astral code point is one character", "(.)", 1, "😀x", "😀"],
    ["alternation takes its first branch that matches", "(a|ab)", 1, "ab", "a"],
    ["a lazy quantifier stops at its first match", "(a+?)", 1, "aaa", "a"],
    ["$ does not match before a trailing newline", "a$", 0, "a\n", null],
    ["matching is case-sensitive", "(B)", 1, "b", null],
    ["a lookbehind without a capture is kept", "(?<=@)(.+)", 1, "a@b", "b"],
  ])("%s", (_title, pattern, groupIndex, value, expected) => {
    expect.hasAssertions();
    expect(readRegexMatch({ ...baseTransformation, groupIndex, pattern }, value)).toBe(expected);
  });

  test.each([
    ["a pattern that does not compile", "(", "a"],
    ["a backreference", "(a)\\1", "aa"],
    ["a lookahead", "a(?=b)", "ab"],
    ["a lookbehind holding a capture", "(?<=(a))b", "ab"],
    ["a JavaScript \\u escape", "\\u0041", "A"],
  ])("reads null for %s, which the engine refuses", (_title, pattern, value) => {
    expect.hasAssertions();
    expect(readRegexMatch({ ...baseTransformation, groupIndex: 0, pattern }, value)).toBeNull();
  });

  test("returns null for non-string value", () => {
    expect.hasAssertions();
    expect(readRegexMatch({ ...baseTransformation, pattern: "(.+)" }, 0)).toBeNull();
  });

  test("a nested quantifier does not stall a cell read", () => {
    expect.hasAssertions();
    const stalled = timeRegexMatch({ ...baseTransformation, pattern: "^(a+)+$" }, `${"a".repeat(22)}!`);
    expect(stalled.match).toBeNull();
    expect(stalled.elapsed).toBeLessThan(STALL_BUDGET_MS);
    expect(readRegexMatch({ ...baseTransformation, pattern: "^(a+)+$" }, `${"a".repeat(100_000)}!`)).toBeNull();
  });
});
