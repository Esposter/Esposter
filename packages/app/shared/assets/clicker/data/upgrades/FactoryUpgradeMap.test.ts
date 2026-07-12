import { FactoryUpgradeMap, FactoryUpgrades } from "#shared/assets/clicker/data/upgrades/FactoryUpgradeMap";
import { FactoryUpgradeId } from "#shared/models/clicker/data/upgrade/FactoryUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("factoryUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(FactoryUpgradeId));

    for (const [id, upgrade] of Object.entries(FactoryUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const factoryUpgrades = [...FactoryUpgrades];

    expect(factoryUpgrades).toStrictEqual(factoryUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
