import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { ClickerSave, clickerSaveMigrationSchema } from "#shared/models/clicker/data/ClickerSave";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { describe, expect, test } from "vitest";

describe("clickerSaveMigrationSchema", () => {
  // Zod outputs plain objects and toStrictEqual is prototype-sensitive, so compare against a plain clone
  const baseClickerSave = structuredClone(new ClickerSave());
  const boughtBuilding = { amount: 1, id: BuildingId.Cursor, producedValue: 0 };
  const upgradeId = CursorUpgradeId["Reinforced Index Finger"];
  const unknownId = "-1";

  test("parses the current id-based shape", () => {
    expect.hasAssertions();

    const clickerSave = { ...baseClickerSave, boughtBuildings: [boughtBuilding], boughtUpgrades: [upgradeId] };

    expect(clickerSaveMigrationSchema.parse(clickerSave)).toStrictEqual(clickerSave);
  });

  test("migrates the legacy full-object shape to ids", () => {
    expect.hasAssertions();

    const legacyClickerSave = {
      ...baseClickerSave,
      boughtBuildings: [{ ...BuildingMap[BuildingId.Cursor], ...boughtBuilding }],
      boughtUpgrades: [{ ...UpgradeMap[upgradeId], id: upgradeId }],
    };

    expect(clickerSaveMigrationSchema.parse(legacyClickerSave)).toStrictEqual({
      ...baseClickerSave,
      boughtBuildings: [boughtBuilding],
      boughtUpgrades: [upgradeId],
    });
  });

  test("drops unknown ids so removed content self-heals", () => {
    expect.hasAssertions();

    const clickerSave = {
      ...baseClickerSave,
      boughtBuildings: [{ ...boughtBuilding, id: unknownId }],
      boughtUpgrades: [unknownId],
    };

    expect(clickerSaveMigrationSchema.parse(clickerSave)).toStrictEqual(baseClickerSave);
  });
});
