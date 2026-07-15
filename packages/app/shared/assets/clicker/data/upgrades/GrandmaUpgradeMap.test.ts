import { GrandmaUpgrades } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("grandmaUpgradeMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    expect(GrandmaUpgrades).toStrictEqual(GrandmaUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
