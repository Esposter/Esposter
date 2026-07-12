import { CortexBakerUpgradeMap, CortexBakerUpgrades } from "#shared/assets/clicker/data/upgrades/CortexBakerUpgradeMap";
import { CortexBakerUpgradeId } from "#shared/models/clicker/data/upgrade/CortexBakerUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("cortexBakerUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(CortexBakerUpgradeId));

    for (const [id, upgrade] of Object.entries(CortexBakerUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const cortexBakerUpgrades = [...CortexBakerUpgrades];

    expect(cortexBakerUpgrades).toStrictEqual(cortexBakerUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
