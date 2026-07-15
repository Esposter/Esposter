import { CursorUpgrades } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { describe, expect, test } from "vitest";

describe("cursorUpgradeMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    expect(CursorUpgrades).toStrictEqual(CursorUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
