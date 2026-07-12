import { AlchemyLabUpgradeMap, AlchemyLabUpgrades } from "#shared/assets/clicker/data/upgrades/AlchemyLabUpgradeMap";
import { AlchemyLabUpgradeId } from "#shared/models/clicker/data/upgrade/AlchemyLabUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("alchemyLabUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(AlchemyLabUpgradeId));

    for (const [id, upgrade] of Object.entries(AlchemyLabUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const alchemyLabUpgrades = [...AlchemyLabUpgrades];

    expect(alchemyLabUpgrades).toStrictEqual(alchemyLabUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
