import { Buildings } from "#shared/assets/clicker/data/BuildingMap";
import { CursorUpgrades } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { GrandmaUpgrades } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("clicker data", () => {
  test.each([
    ["BuildingMap", Buildings.map(({ basePrice }) => basePrice)],
    ["CursorUpgradeMap", CursorUpgrades.map(({ price }) => price)],
    ["GrandmaUpgradeMap", GrandmaUpgrades.map(({ price }) => price)],
  ])("%s is sorted by price", (_name, prices) => {
    expect.hasAssertions();

    expect(prices).toStrictEqual(prices.toSorted((firstPrice, secondPrice) => firstPrice - secondPrice));
  });
});
