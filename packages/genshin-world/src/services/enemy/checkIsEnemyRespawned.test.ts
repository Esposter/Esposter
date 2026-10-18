import { EnemyType } from "#src/models/enemy/EnemyType";
import { checkIsEnemyRespawned } from "#src/services/enemy/checkIsEnemyRespawned";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsEnemyRespawned, () => {
  // The epoch is eight in the morning in the server's zone, so the day's reset is four hours before it.
  // A member defeated at the epoch is back at the next day's reset.
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const DAILY_RESET = EPOCH.subtract({ hours: GAME_DAY_START_HOUR });
  const NEXT_DAILY_RESET = DAILY_RESET.toZonedDateTimeISO(GAME_TIME_ZONE).add({ days: 1 }).toInstant();
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
