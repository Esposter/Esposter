import { GrandmaUpgradeMap, GrandmaUpgrades } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { GrandmaUpgradeId } from "#shared/models/clicker/data/upgrade/GrandmaUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("grandmaUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(GrandmaUpgradeId));

    for (const [id, upgrade] of Object.entries(GrandmaUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const grandmaUpgrades = [...GrandmaUpgrades];

    expect(grandmaUpgrades).toStrictEqual(grandmaUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
