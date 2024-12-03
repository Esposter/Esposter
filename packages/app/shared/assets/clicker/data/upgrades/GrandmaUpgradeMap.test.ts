import { describe, expect, test } from "vitest";
import { GrandmaUpgradeMap } from "~~/shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";

describe("grandmaUpgradeMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    const grandmaUpgrades = Object.values(GrandmaUpgradeMap);

    expect(grandmaUpgrades).toStrictEqual(grandmaUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
