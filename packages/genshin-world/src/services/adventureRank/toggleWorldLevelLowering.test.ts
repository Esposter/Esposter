import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";

import { WORLD_LEVEL_ADJUSTMENT_COOLDOWN } from "#src/services/adventureRank/constants";
import { toggleWorldLevelLowering } from "#src/services/adventureRank/toggleWorldLevelLowering";
import { describe, expect, test } from "vitest";

describe(toggleWorldLevelLowering, () => {
  const now = Temporal.Instant.fromEpochMilliseconds(0);
  const unlocked: WorldLevelAdjustment = { isLowered: false };

  test("a World Level below 3 is not lowered", () => {
    expect.hasAssertions();

    expect(toggleWorldLevelLowering(unlocked, 2, now)).toStrictEqual(unlocked);
  });

  test("world Level 3 is lowered by one, and restored once the cooldown runs", () => {
    expect.hasAssertions();

    const lowered = toggleWorldLevelLowering(unlocked, 3, now);

    expect(lowered).toStrictEqual({ changedAt: now, isLowered: true });
    expect(toggleWorldLevelLowering(lowered, 3, now.add({ minutes: 1 }))).toStrictEqual(lowered);
    expect(toggleWorldLevelLowering(lowered, 3, now.add(WORLD_LEVEL_ADJUSTMENT_COOLDOWN))).toStrictEqual({
      changedAt: now.add(WORLD_LEVEL_ADJUSTMENT_COOLDOWN),
      isLowered: false,
    });
  });
});
