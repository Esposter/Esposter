import { checkIsImportOnlyRange } from "#src/services/sweeps/duplicateCode/checkIsImportOnlyRange";
import { describe, expect, test } from "vitest";

describe(checkIsImportOnlyRange, () => {
  const nonImportLines = new Set([2]);

  test("reads a range with no code line in it as import-only", () => {
    expect.hasAssertions();

    expect(checkIsImportOnlyRange(1, 1, nonImportLines)).toBe(true);
  });

  test("reads a range holding a code line as not import-only", () => {
    expect.hasAssertions();

    expect(checkIsImportOnlyRange(1, 2, nonImportLines)).toBe(false);
  });
});
