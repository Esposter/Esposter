import { EnemyType } from "#src/models/enemy/EnemyType";
import { computeEnemyRespawnTime } from "#src/services/enemy/computeEnemyRespawnTime";
import { COMMON_ENEMY_RESPAWN_DURATION, DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { describe, expect, test } from "vitest";

describe(computeEnemyRespawnTime, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const dailyReset = epoch.toPlainDate().toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });

  test("a common camp's member comes back after its respawn duration", () => {
    expect.hasAssertions();

    expect(computeEnemyRespawnTime([EnemyType.Common], epoch).toString()).toBe(
      epoch.add(COMMON_ENEMY_RESPAWN_DURATION).toString(),
    );
  });

  test("a camp with an elite comes back at the next daily reset", () => {
    expect.hasAssertions();

    expect(computeEnemyRespawnTime([EnemyType.Common, EnemyType.Elite], epoch).toString()).toBe(dailyReset.toString());
    expect(computeEnemyRespawnTime([EnemyType.Elite], dailyReset).toString()).toBe(
      dailyReset.add({ days: 1 }).toString(),
    );
  });

  test("a camp with a boss comes back as soon as it is defeated", () => {
    expect.hasAssertions();

    expect(computeEnemyRespawnTime([EnemyType.Elite, EnemyType.Boss], epoch).toString()).toBe(epoch.toString());
  });
});
