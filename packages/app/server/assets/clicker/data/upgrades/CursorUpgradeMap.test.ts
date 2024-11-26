import { CursorUpgradeMap } from "@/server/assets/clicker/data/upgrades/CursorUpgradeMap";
import { describe, expect, test } from "vitest";

describe("cursorUpgradeMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    const cursorUpgrades = Object.values(CursorUpgradeMap);

    expect(cursorUpgrades).toStrictEqual(cursorUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
