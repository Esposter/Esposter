import { checkIsRangeFree } from "#src/services/sweeps/duplicateCode/checkIsRangeFree";
import { describe, expect, test } from "vitest";

describe(checkIsRangeFree, () => {
  const codeLines = new Set([2]);

  test("reads a range with no code line in it as free", () => {
    expect.hasAssertions();

    expect(checkIsRangeFree(1, 1, codeLines)).toBe(true);
  });

  test("reads a range holding a code line as not free", () => {
    expect.hasAssertions();

    expect(checkIsRangeFree(1, 2, codeLines)).toBe(false);
  });
});
