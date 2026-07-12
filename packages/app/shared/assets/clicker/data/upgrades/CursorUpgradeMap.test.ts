import { CursorUpgradeMap, CursorUpgrades } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("cursorUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(CursorUpgradeId));

    for (const [id, upgrade] of Object.entries(CursorUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const cursorUpgrades = [...CursorUpgrades];

    expect(cursorUpgrades).toStrictEqual(cursorUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
