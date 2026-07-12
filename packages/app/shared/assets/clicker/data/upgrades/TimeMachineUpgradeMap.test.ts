import { TimeMachineUpgradeMap, TimeMachineUpgrades } from "#shared/assets/clicker/data/upgrades/TimeMachineUpgradeMap";
import { TimeMachineUpgradeId } from "#shared/models/clicker/data/upgrade/TimeMachineUpgradeId";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("timeMachineUpgradeMap", () => {
  test("entries are valid upgrades", () => {
    expect.hasAssertions();

    const upgradeSchema = createUpgradeSchema(z.enum(TimeMachineUpgradeId));

    for (const [id, upgrade] of Object.entries(TimeMachineUpgradeMap))
      expect(upgradeSchema.safeParse({ ...upgrade, id }).success).toBe(true);
  });

  test("sorted by price", () => {
    expect.hasAssertions();

    const timeMachineUpgrades = [...TimeMachineUpgrades];

    expect(timeMachineUpgrades).toStrictEqual(timeMachineUpgrades.toSorted((a, b) => a.price - b.price));
  });
});
