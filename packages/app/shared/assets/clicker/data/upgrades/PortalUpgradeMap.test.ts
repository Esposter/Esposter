import { PortalUpgradeMap, PortalUpgrades } from "#shared/assets/clicker/data/upgrades/PortalUpgradeMap";
import { PortalUpgradeId } from "#shared/models/clicker/data/upgrade/PortalUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("portalUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(PortalUpgradeId));

    for (const [id, upgrade] of Object.entries(PortalUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const portalUpgrades = [...PortalUpgrades];

    expect(portalUpgrades).toStrictEqual(portalUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
