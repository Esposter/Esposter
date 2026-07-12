import { FarmUpgradeMap, FarmUpgrades } from "#shared/assets/clicker/data/upgrades/FarmUpgradeMap";
import { FarmUpgradeId } from "#shared/models/clicker/data/upgrade/FarmUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("farmUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(FarmUpgradeId));

    for (const [id, upgrade] of Object.entries(FarmUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const farmUpgrades = [...FarmUpgrades];

    expect(farmUpgrades).toStrictEqual(farmUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
