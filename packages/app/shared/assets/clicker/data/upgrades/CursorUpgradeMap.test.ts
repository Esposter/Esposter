import { describe, expect, test } from "vitest";
import { CursorUpgradeMap } from "~~/shared/assets/clicker/data/upgrades/CursorUpgradeMap";

describe("cursorUpgradeMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    const cursorUpgrades = Object.values(CursorUpgradeMap);

    expect(cursorUpgrades).toStrictEqual(cursorUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
