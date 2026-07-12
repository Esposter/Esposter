import {
  AntimatterCondenserUpgradeMap,
  AntimatterCondenserUpgrades,
} from "#shared/assets/clicker/data/upgrades/AntimatterCondenserUpgradeMap";
import { AntimatterCondenserUpgradeId } from "#shared/models/clicker/data/upgrade/AntimatterCondenserUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("antimatterCondenserUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(AntimatterCondenserUpgradeId));

    for (const [id, upgrade] of Object.entries(AntimatterCondenserUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const antimatterCondenserUpgrades = [...AntimatterCondenserUpgrades];

    expect(antimatterCondenserUpgrades).toStrictEqual(
      antimatterCondenserUpgrades.toSorted((a, b) => a.price - b.price),
    );
  });
});
