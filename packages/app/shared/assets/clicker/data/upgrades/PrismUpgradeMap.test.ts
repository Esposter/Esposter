import { PrismUpgradeMap, PrismUpgrades } from "#shared/assets/clicker/data/upgrades/PrismUpgradeMap";
import { PrismUpgradeId } from "#shared/models/clicker/data/upgrade/PrismUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("prismUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(PrismUpgradeId));

    for (const [id, upgrade] of Object.entries(PrismUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const prismUpgrades = [...PrismUpgrades];

    expect(prismUpgrades).toStrictEqual(prismUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
