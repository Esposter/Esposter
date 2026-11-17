import { GrandmaUpgradeMap } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("grandmaUpgradeMap", () => {
  test("is sorted by price", () => {
    expect.hasAssertions();

    const prices = Object.values(GrandmaUpgradeMap).map(({ price }) => price);

    expect(prices).toStrictEqual(prices.toSorted((firstPrice, secondPrice) => firstPrice - secondPrice));
  });
});
