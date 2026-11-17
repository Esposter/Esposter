import { CursorUpgradeMap } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { describe, expect, test } from "vitest";

describe("cursorUpgradeMap", () => {
  test("is sorted by price", () => {
    expect.hasAssertions();

    const prices = Object.values(CursorUpgradeMap).map(({ price }) => price);

    expect(prices).toStrictEqual(prices.toSorted((firstPrice, secondPrice) => firstPrice - secondPrice));
  });
});
