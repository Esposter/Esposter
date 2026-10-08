import { getPathHash } from "#src/services/genshinAssets/shared/getPathHash";
import { describe, expect, test } from "vitest";

describe(getPathHash, () => {
  test("names a path the way the installed asset index does", () => {
    expect.hasAssertions();

    expect(getPathHash("Data/_ExcelBinOutput/QuestExcelConfigData")).toBe("3b87ae83");
  });
});
