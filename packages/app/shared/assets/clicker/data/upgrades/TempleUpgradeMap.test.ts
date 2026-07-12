import { TempleUpgradeMap, TempleUpgrades } from "#shared/assets/clicker/data/upgrades/TempleUpgradeMap";
import { TempleUpgradeId } from "#shared/models/clicker/data/upgrade/TempleUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("templeUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(TempleUpgradeId));

    for (const [id, upgrade] of Object.entries(TempleUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const templeUpgrades = [...TempleUpgrades];

    expect(templeUpgrades).toStrictEqual(templeUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
