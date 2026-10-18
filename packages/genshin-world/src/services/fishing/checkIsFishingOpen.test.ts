import { checkIsFishingOpen } from "#src/services/fishing/checkIsFishingOpen";
import { describe, expect, test } from "vitest";

describe(checkIsFishingOpen, () => {
  test("fishing stays closed before the Serenitea Pot is owned", () => {
    expect.hasAssertions();

    expect(checkIsFishingOpen({ isSereniteaPotOwned: false, isSereniteaPotQuestFinished: true })).toBe(false);
    expect(checkIsFishingOpen({ isSereniteaPotOwned: false, isSereniteaPotQuestFinished: false })).toBe(false);
  });

  test("fishing opens at a point once the Serenitea Pot is owned", () => {
    expect.hasAssertions();

    expect(checkIsFishingOpen({ isSereniteaPotOwned: true, isSereniteaPotQuestFinished: true })).toBe(true);
    expect(checkIsFishingOpen({ isSereniteaPotOwned: true, isSereniteaPotQuestFinished: false })).toBe(false);
  });
});
