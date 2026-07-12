import { IdleverseUpgradeMap, IdleverseUpgrades } from "#shared/assets/clicker/data/upgrades/IdleverseUpgradeMap";
import { IdleverseUpgradeId } from "#shared/models/clicker/data/upgrade/IdleverseUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("idleverseUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(IdleverseUpgradeId));

    for (const [id, upgrade] of Object.entries(IdleverseUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const idleverseUpgrades = [...IdleverseUpgrades];

    expect(idleverseUpgrades).toStrictEqual(idleverseUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
