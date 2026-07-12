import { BankUpgradeMap, BankUpgrades } from "#shared/assets/clicker/data/upgrades/BankUpgradeMap";
import { BankUpgradeId } from "#shared/models/clicker/data/upgrade/BankUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("bankUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(BankUpgradeId));

    for (const [id, upgrade] of Object.entries(BankUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const bankUpgrades = [...BankUpgrades];

    expect(bankUpgrades).toStrictEqual(bankUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
