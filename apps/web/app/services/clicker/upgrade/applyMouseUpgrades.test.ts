import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { applyMouseUpgrades } from "@/services/clicker/upgrade/applyMouseUpgrades";
import { createUpgrade } from "@/services/clicker/upgrade/createUpgrade.test";
import { describe, expect, test } from "vitest";

describe(applyMouseUpgrades, () => {
  // An upgrade aimed at buildings leaves the click alone, and one aimed at the mouse adds its power to it
  test("adds the power of the bought upgrades that target the mouse, and no others", () => {
    expect.hasAssertions();

    const mouseUpgrade = createUpgrade(CursorUpgradeId.Ambidextrous, [
      { configuration: { type: EffectType.Additive }, targets: [Target.Mouse], value: 2 },
    ]);
    const buildingUpgrade = createUpgrade(CursorUpgradeId["Billion Fingers"], [
      { configuration: { type: EffectType.Multiplicative }, targets: [BuildingId.Cursor], value: 5 },
    ]);

    expect(applyMouseUpgrades(1, [mouseUpgrade, buildingUpgrade], [])).toBe(3);
  });

  // An upgrade that enhances another's effect changes the value that other upgrade adds, before it is applied
  test("lets an upgrade enhance the mouse effect of another before it applies", () => {
    expect.hasAssertions();

    const mouseUpgrade = createUpgrade(CursorUpgradeId.Ambidextrous, [
      { configuration: { type: EffectType.Additive }, targets: [Target.Mouse], value: 1 },
    ]);
    const enhancingUpgrade = createUpgrade(CursorUpgradeId["Billion Fingers"], [
      {
        configuration: { itemType: Target.Upgrade, type: EffectType.Multiplicative },
        targets: [CursorUpgradeId.Ambidextrous],
        value: 2,
      },
    ]);

    expect(applyMouseUpgrades(0, [mouseUpgrade, enhancingUpgrade], [])).toBe(2);
  });
});
