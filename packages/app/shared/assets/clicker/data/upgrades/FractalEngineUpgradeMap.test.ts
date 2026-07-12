import {
  FractalEngineUpgradeMap,
  FractalEngineUpgrades,
} from "#shared/assets/clicker/data/upgrades/FractalEngineUpgradeMap";
import { FractalEngineUpgradeId } from "#shared/models/clicker/data/upgrade/FractalEngineUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("fractalEngineUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(FractalEngineUpgradeId));

    for (const [id, upgrade] of Object.entries(FractalEngineUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const fractalEngineUpgrades = [...FractalEngineUpgrades];

    expect(fractalEngineUpgrades).toStrictEqual(fractalEngineUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
