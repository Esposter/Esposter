import { ShipmentUpgradeMap, ShipmentUpgrades } from "#shared/assets/clicker/data/upgrades/ShipmentUpgradeMap";
import { ShipmentUpgradeId } from "#shared/models/clicker/data/upgrade/ShipmentUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("shipmentUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(ShipmentUpgradeId));

    for (const [id, upgrade] of Object.entries(ShipmentUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const shipmentUpgrades = [...ShipmentUpgrades];

    expect(shipmentUpgrades).toStrictEqual(shipmentUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
