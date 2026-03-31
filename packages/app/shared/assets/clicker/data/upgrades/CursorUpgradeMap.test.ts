// @vitest-environment node
import { CursorUpgrades } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { describe, expect, test } from "vitest";

describe("cursorUpgradeMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    const cursorUpgrades = [...CursorUpgrades];

    expect(cursorUpgrades).toStrictEqual(cursorUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
