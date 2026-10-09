import { checkSameFileNames } from "#src/services/genshinAssets/namecards/checkSameFileNames";
import { describe, expect, test } from "vitest";

describe(checkSameFileNames, () => {
  const FURINA = "UI_NameCardIcon_Furina";
  const RAZER = "UI_NameCardIcon_Razer";

  test.each([
    [true, "the same names in another order", [FURINA, RAZER], [RAZER, FURINA]],
    [true, "no names and no files", [], []],
    [false, "a file the index does not name", [FURINA], [FURINA, RAZER]],
    [false, "a name the folder lacks", [FURINA, RAZER], [FURINA]],
    [false, "as many files as names, but other ones", [FURINA], [RAZER]],
  ])("should return %s for %s", (expected, _description, expectedNames, fileNames) => {
    expect.hasAssertions();

    expect(checkSameFileNames(expectedNames, fileNames)).toBe(expected);
  });
});
