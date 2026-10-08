import type { RestorativePower } from "#src/models/statue/RestorativePower";

import { RESTORATIVE_POWER_PER_STATUE, RESTORATIVE_POWER_REFILL_SECONDS } from "#src/services/statue/constants";
import { regenerateRestorativePower } from "#src/services/statue/regenerateRestorativePower";
import { describe, expect, test } from "vitest";

describe(regenerateRestorativePower, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const UNLOCKED_STATUE_COUNT = 1;
  const REFILL_AMOUNT = RESTORATIVE_POWER_PER_STATUE / 100;

  test("a refill of the maximum's share comes each interval, and the moment moves on by the refills that came", () => {
    expect.hasAssertions();

    const power: RestorativePower = { amount: 0, changedAt: epoch };
    const now = epoch.add({ seconds: RESTORATIVE_POWER_REFILL_SECONDS * 2 + 1 });

    expect(regenerateRestorativePower(power, UNLOCKED_STATUE_COUNT, now)).toStrictEqual({
      amount: REFILL_AMOUNT * 2,
      changedAt: epoch.add({ seconds: RESTORATIVE_POWER_REFILL_SECONDS * 2 }),
    });
  });

  test("the pool stops at its maximum, and the moment is now so the next refill starts from it", () => {
    expect.hasAssertions();

    const now = epoch.add({ seconds: 100 });
    const power: RestorativePower = { amount: RESTORATIVE_POWER_PER_STATUE - REFILL_AMOUNT, changedAt: epoch };

    expect(regenerateRestorativePower(power, UNLOCKED_STATUE_COUNT, now)).toStrictEqual({
      amount: RESTORATIVE_POWER_PER_STATUE,
      changedAt: now,
    });
  });

  test("a full pool regenerates nothing", () => {
    expect.hasAssertions();

    const now = epoch.add({ seconds: 100 });
    const power: RestorativePower = { amount: RESTORATIVE_POWER_PER_STATUE, changedAt: epoch };

    expect(regenerateRestorativePower(power, UNLOCKED_STATUE_COUNT, now)).toStrictEqual({
      amount: RESTORATIVE_POWER_PER_STATUE,
      changedAt: now,
    });
  });
});
