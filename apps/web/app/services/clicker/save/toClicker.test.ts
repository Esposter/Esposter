import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { Clicker } from "#shared/models/clicker/data/Clicker";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { toClicker } from "@/services/clicker/save/toClicker";
import { toClickerSave } from "@/services/clicker/save/toClickerSave";
import { describe, expect, test } from "vitest";

describe(toClicker, () => {
  const upgradeId = CursorUpgradeId["Reinforced Index Finger"];
  const clicker = new Clicker({
    boughtBuildings: [{ ...BuildingMap[BuildingId.Cursor], amount: 1, id: BuildingId.Cursor, producedValue: 0 }],
    boughtUpgrades: [{ ...UpgradeMap[upgradeId], id: upgradeId }],
    pointCount: 1,
  });

  test("round trips the in-memory state through the save shape", () => {
    expect.hasAssertions();

    expect(toClicker(toClickerSave(clicker))).toStrictEqual(clicker);
  });

  test("falls back to a fresh game for unreadable saves", () => {
    expect.hasAssertions();

    const fallbackClicker = toClicker("");

    expect(fallbackClicker).toStrictEqual(
      new Clicker({
        createdAt: fallbackClicker.createdAt,
        id: fallbackClicker.id,
        updatedAt: fallbackClicker.updatedAt,
      }),
    );
  });
});
