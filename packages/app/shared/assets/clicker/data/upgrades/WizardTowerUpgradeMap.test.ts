import { WizardTowerUpgradeMap, WizardTowerUpgrades } from "#shared/assets/clicker/data/upgrades/WizardTowerUpgradeMap";
import { WizardTowerUpgradeId } from "#shared/models/clicker/data/upgrade/WizardTowerUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("wizardTowerUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(WizardTowerUpgradeId));

    for (const [id, upgrade] of Object.entries(WizardTowerUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const wizardTowerUpgrades = [...WizardTowerUpgrades];

    expect(wizardTowerUpgrades).toStrictEqual(wizardTowerUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
