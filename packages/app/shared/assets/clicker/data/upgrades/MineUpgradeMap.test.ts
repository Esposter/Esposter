import { MineUpgradeMap, MineUpgrades } from "#shared/assets/clicker/data/upgrades/MineUpgradeMap";
import { MineUpgradeId } from "#shared/models/clicker/data/upgrade/MineUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("mineUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(MineUpgradeId));

    for (const [id, upgrade] of Object.entries(MineUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const mineUpgrades = [...MineUpgrades];

    expect(mineUpgrades).toStrictEqual(mineUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
