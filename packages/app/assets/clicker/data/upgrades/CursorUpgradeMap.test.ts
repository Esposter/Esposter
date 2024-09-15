import { CursorUpgradeMap } from "@/assets/clicker/data/upgrades/CursorUpgradeMap";
import { describe, expect, test } from "vitest";

describe("CursorUpgradeMap", () => {
  test("sorted by price", () => {
    const cursorUpgrades = Object.values(CursorUpgradeMap);
    expect(cursorUpgrades).toStrictEqual(cursorUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
