import { getDuplicateCodeFindingLine } from "#src/services/sweeps/duplicateCode/getDuplicateCodeFindingLine";
import { describe, expect, test } from "vitest";

describe(getDuplicateCodeFindingLine, () => {
  test("formats a finding as its line count, then the two paths with their start lines", () => {
    expect.hasAssertions();

    expect(getDuplicateCodeFindingLine({ lines: 1, paths: ["a:1", "b:1"] })).toBe("1 a:1 | b:1");
  });
});
