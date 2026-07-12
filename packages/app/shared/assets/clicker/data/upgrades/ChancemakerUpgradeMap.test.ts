import { ChancemakerUpgradeMap, ChancemakerUpgrades } from "#shared/assets/clicker/data/upgrades/ChancemakerUpgradeMap";
import { ChancemakerUpgradeId } from "#shared/models/clicker/data/upgrade/ChancemakerUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("chancemakerUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(ChancemakerUpgradeId));

    for (const [id, upgrade] of Object.entries(ChancemakerUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const chancemakerUpgrades = [...ChancemakerUpgrades];

    expect(chancemakerUpgrades).toStrictEqual(chancemakerUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
