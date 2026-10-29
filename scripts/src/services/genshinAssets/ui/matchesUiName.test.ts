import { matchesUiName } from "#src/services/genshinAssets/ui/matchesUiName";
import { describe, expect, test } from "vitest";

describe(matchesUiName, () => {
  const PATTERN = /^BtnQuit$/u;

  test("matches a name as the export holds it or with AnimeStudio's duplicate suffix taken off, and no other", () => {
    expect.hasAssertions();

    expect(matchesUiName("BtnQuit", PATTERN)).toBe(true);
    expect(matchesUiName("BtnQuit (2)", PATTERN)).toBe(true);
    expect(matchesUiName("BtnQuitTips", PATTERN)).toBe(false);
  });
});
