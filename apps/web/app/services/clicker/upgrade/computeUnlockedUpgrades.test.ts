import type { UnlockCondition } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";

import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { Target } from "#shared/models/clicker/data/Target";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { createBuildingWithStatistics } from "#src/services/clicker/createBuildingWithStatistics.test";
import { createUpgrade } from "#src/services/clicker/upgrade/createUpgrade.test";
import { computeUnlockedUpgrades } from "#src/services/clicker/upgrade/computeUnlockedUpgrades";
import { describe, expect, test } from "vitest";

const createUpgradeWithConditions = (unlockConditions: UnlockCondition[]) => ({
  ...createUpgrade(CursorUpgradeId.Ambidextrous, []),
  unlockConditions,
});

describe(computeUnlockedUpgrades, () => {
  const amount = 10;
  const buildingCondition = { amount, id: BuildingId.Cursor, type: Target.Building } as const;
  const upgradeCondition = { id: CursorUpgradeId.Ambidextrous, type: Target.Upgrade } as const;

  test("unlocks an upgrade that has no conditions", () => {
    expect.hasAssertions();

    const upgrade = createUpgradeWithConditions([]);

    expect(computeUnlockedUpgrades([upgrade], [], [])).toStrictEqual([upgrade]);
  });

  test("unlocks a building condition once the building is owned in its amount", () => {
    expect.hasAssertions();

    const upgrade = createUpgradeWithConditions([buildingCondition]);

    expect(
      computeUnlockedUpgrades([upgrade], [createBuildingWithStatistics(BuildingId.Cursor, amount)], []),
    ).toStrictEqual([upgrade]);
    expect(
      computeUnlockedUpgrades([upgrade], [createBuildingWithStatistics(BuildingId.Cursor, amount - 1)], []),
    ).toStrictEqual([]);
  });

  test("keeps an upgrade with a building condition locked while that building is not owned", () => {
    expect.hasAssertions();

    const upgrade = createUpgradeWithConditions([buildingCondition]);

    expect(
      computeUnlockedUpgrades([upgrade], [createBuildingWithStatistics(BuildingId.Grandma, amount)], []),
    ).toStrictEqual([]);
  });

  test("unlocks an upgrade condition once the upgrade is bought", () => {
    expect.hasAssertions();

    const upgrade = createUpgradeWithConditions([upgradeCondition]);
    const boughtUpgrade = createUpgrade(CursorUpgradeId.Ambidextrous, []);

    expect(computeUnlockedUpgrades([upgrade], [], [boughtUpgrade])).toStrictEqual([upgrade]);
    expect(computeUnlockedUpgrades([upgrade], [], [])).toStrictEqual([]);
  });

  // Every condition has to hold, so one that is met does not unlock an upgrade whose other one is not
  test("keeps an upgrade locked unless every one of its conditions holds", () => {
    expect.hasAssertions();

    const upgrade = createUpgradeWithConditions([buildingCondition, upgradeCondition]);

    expect(
      computeUnlockedUpgrades([upgrade], [createBuildingWithStatistics(BuildingId.Cursor, amount)], []),
    ).toStrictEqual([]);
  });
});
