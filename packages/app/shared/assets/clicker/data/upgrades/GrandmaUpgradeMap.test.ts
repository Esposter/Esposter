// @vitest-environment node
import { GrandmaUpgrades } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { describe, expect, test } from "vitest";

describe("grandmaUpgradeMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    const grandmaUpgrades = [...GrandmaUpgrades];

    expect(grandmaUpgrades).toStrictEqual(grandmaUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
