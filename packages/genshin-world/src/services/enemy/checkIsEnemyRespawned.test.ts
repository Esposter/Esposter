import { EnemyType } from "#src/models/enemy/EnemyType";
import { checkIsEnemyRespawned } from "#src/services/enemy/checkIsEnemyRespawned";
import { computeNextDailyReset } from "#src/services/time/computeNextDailyReset";
import { describe, expect, test } from "vitest";

describe(checkIsEnemyRespawned, () => {
  // The epoch is eight in the morning in the server's zone, so the day's reset is four hours before it.
  // A member defeated at the epoch is back at the next day's reset.
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const NEXT_DAILY_RESET = computeNextDailyReset(EPOCH);
  const CAMP_ENEMY_TYPES = [EnemyType.Common, EnemyType.Elite];

  test("an elite camp's member stays down until the server's reset arrives", () => {
    expect.hasAssertions();

    expect(checkIsEnemyRespawned(CAMP_ENEMY_TYPES, EPOCH, NEXT_DAILY_RESET.subtract({ milliseconds: 1 }))).toBe(false);
  });

  test("an elite camp's member is back when the server's reset arrives", () => {
    expect.hasAssertions();

    expect(checkIsEnemyRespawned(CAMP_ENEMY_TYPES, EPOCH, NEXT_DAILY_RESET)).toBe(true);
  });
});
