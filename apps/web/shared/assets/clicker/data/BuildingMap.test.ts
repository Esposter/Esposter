import { Buildings } from "#shared/assets/clicker/data/BuildingMap";
import { CursorUpgrades } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { GrandmaUpgrades } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("clicker data", () => {
  test.each([
    ["buildingMap", Buildings.map(({ basePrice }) => basePrice)],
    ["cursorUpgradeMap", CursorUpgrades.map(({ price }) => price)],
    ["grandmaUpgradeMap", GrandmaUpgrades.map(({ price }) => price)],
  ])("%s is sorted by price", (_name, prices) => {
    expect.hasAssertions();

    expect(prices).toStrictEqual(prices.toSorted((firstPrice, secondPrice) => firstPrice - secondPrice));
  });
});
