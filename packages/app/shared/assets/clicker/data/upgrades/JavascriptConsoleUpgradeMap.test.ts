import {
  JavascriptConsoleUpgradeMap,
  JavascriptConsoleUpgrades,
} from "#shared/assets/clicker/data/upgrades/JavascriptConsoleUpgradeMap";
import { JavascriptConsoleUpgradeId } from "#shared/models/clicker/data/upgrade/JavascriptConsoleUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("javascriptConsoleUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(JavascriptConsoleUpgradeId));

    for (const [id, upgrade] of Object.entries(JavascriptConsoleUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const javascriptConsoleUpgrades = [...JavascriptConsoleUpgrades];

    expect(javascriptConsoleUpgrades).toStrictEqual(javascriptConsoleUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
