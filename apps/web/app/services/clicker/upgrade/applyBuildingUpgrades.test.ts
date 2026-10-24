import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { createBuildingWithStatistics } from "@/services/clicker/createBuildingWithStatistics.test";
import { applyBuildingUpgrades } from "@/services/clicker/upgrade/applyBuildingUpgrades";
import { createUpgrade } from "@/services/clicker/upgrade/createUpgrade.test";
import { describe, expect, test } from "vitest";

describe(applyBuildingUpgrades, () => {
  // Each owned building adds its own upgraded power to the base, so the upgraded building's and the plain one's both count
  test("adds each owned building's upgraded power onto the base", () => {
    expect.hasAssertions();

    const upgrade = createUpgrade(CursorUpgradeId.Ambidextrous, [
      { configuration: { type: EffectType.Multiplicative }, targets: [BuildingId.Cursor], value: 3 },
    ]);
    const cursor = createBuildingWithStatistics(BuildingId.Cursor, 2);
    const grandma = createBuildingWithStatistics(BuildingId.Grandma, 1);

    // The cursors are tripled by the upgrade and doubled by their amount, the grandma is only her base once
    expect(applyBuildingUpgrades(10, [upgrade], [cursor, grandma])).toBe(10 + 1 * 3 * 2 + 1);
  });
});
