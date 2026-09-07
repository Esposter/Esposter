import type { ToData } from "@esposter/shared";

import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { ClickerSave, clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { describe, expect, test } from "vitest";

describe("clickerSaveSchema", () => {
  // Zod outputs plain objects and toStrictEqual is prototype-sensitive, so compare against a plain clone
  const baseClickerSave: ToData<ClickerSave> = structuredClone(new ClickerSave());
  const boughtBuilding = { amount: 1, id: BuildingId.Cursor, producedValue: 0 };
  const upgradeId = CursorUpgradeId["Reinforced Index Finger"];
  const unknownId = "-1";

  test("parses the id-based save shape", () => {
    expect.hasAssertions();

    const clickerSave = { ...baseClickerSave, boughtBuildings: [boughtBuilding], boughtUpgrades: [upgradeId] };

    expect(clickerSaveSchema.parse(clickerSave)).toStrictEqual(clickerSave);
  });

  test("rejects unknown content ids so stale saves reset instead of loading partially", () => {
    expect.hasAssertions();

    const clickerSave = {
      ...baseClickerSave,
      boughtBuildings: [{ ...boughtBuilding, id: unknownId }],
      boughtUpgrades: [unknownId],
    };

    expect(clickerSaveSchema.safeParse(clickerSave).success).toBe(false);
  });
});
