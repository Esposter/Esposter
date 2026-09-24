import { GrandmaUpgrades } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("grandmaUpgradeMap", () => {
  test("is sorted by price", () => {
    expect.hasAssertions();

    const prices = GrandmaUpgrades.map(({ price }) => price);

    expect(prices).toStrictEqual(prices.toSorted((firstPrice, secondPrice) => firstPrice - secondPrice));
  });
});
