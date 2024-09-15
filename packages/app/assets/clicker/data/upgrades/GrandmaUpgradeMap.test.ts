import { GrandmaUpgradeMap } from "@/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("GrandmaUpgradeMap", () => {
  test("sorted by price", () => {
    const grandmaUpgrades = Object.values(GrandmaUpgradeMap);
    expect(grandmaUpgrades).toStrictEqual(grandmaUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
