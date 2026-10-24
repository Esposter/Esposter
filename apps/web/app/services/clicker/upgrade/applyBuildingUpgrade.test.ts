import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { GrandmaUpgradeId } from "#shared/models/clicker/data/upgrade/GrandmaUpgradeId";
import { createBuildingWithStatistics } from "@/services/clicker/createBuildingWithStatistics.test";
import { applyBuildingUpgrade } from "@/services/clicker/upgrade/applyBuildingUpgrade";
import { createUpgrade } from "@/services/clicker/upgrade/createUpgrade.test";
import { describe, expect, test } from "vitest";

describe(applyBuildingUpgrade, () => {
  const baseValue = 1;
  const amount = 2;

  // Only the upgrade aimed at the building multiplies its value, and the owned units then count on top of that
  test("scales the building's value by its amount under only the upgrades that target it", () => {
    expect.hasAssertions();

    const building = createBuildingWithStatistics(BuildingId.Cursor, amount);
    const targetingUpgrade = createUpgrade(CursorUpgradeId.Ambidextrous, [
      { configuration: { type: EffectType.Multiplicative }, targets: [BuildingId.Cursor], value: 3 },
    ]);
    const otherUpgrade = createUpgrade(GrandmaUpgradeId["Forwards From Grandma"], [
      { configuration: { type: EffectType.Multiplicative }, targets: [BuildingId.Grandma], value: 3 },
    ]);

    expect(applyBuildingUpgrade(building, [targetingUpgrade, otherUpgrade], [building])).toBe(baseValue * 3 * amount);
  });
});
