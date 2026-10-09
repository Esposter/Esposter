import { computeWorldLevelCooldown } from "#src/services/adventureRank/computeWorldLevelCooldown";
import { WORLD_LEVEL_ADJUSTMENT_COOLDOWN } from "#src/services/adventureRank/constants";
import { describe, expect, test } from "vitest";

describe(computeWorldLevelCooldown, () => {
  const changedAt = Temporal.Instant.fromEpochMilliseconds(0);

  test("no cooldown is left before any change", () => {
    expect.hasAssertions();

    expect(computeWorldLevelCooldown(undefined, changedAt)).toBeUndefined();
  });

  test("the time left is rounded up to the minute, and none is left once the cooldown has run", () => {
    expect.hasAssertions();

    const left = computeWorldLevelCooldown(changedAt, changedAt.add({ seconds: 1 }));

    expect(left?.total({ unit: "minute" })).toBe(24 * 60);
    expect(computeWorldLevelCooldown(changedAt, changedAt.add(WORLD_LEVEL_ADJUSTMENT_COOLDOWN))).toBeUndefined();
  });
});
