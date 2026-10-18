import { EnemyType } from "#src/models/enemy/EnemyType";
import { BOSS_RESPAWN_AFTER_CLAIM_DURATION } from "#src/services/bosses/constants";
import { computeEnemyRespawnTime } from "#src/services/enemy/computeEnemyRespawnTime";
import { COMMON_ENEMY_RESPAWN_DURATION } from "#src/services/enemy/constants";
import { describe, expect, test } from "vitest";

describe(computeEnemyRespawnTime, () => {
  // The epoch is eight in the morning in the server's zone, so the next 04:00 reset is twenty hours on
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const place = { x: 0, z: 0 };
  const nextDailyReset = epoch.add({ hours: 20 });

  test("a common camp's member comes back after its respawn duration", () => {
    expect.hasAssertions();

    expect(computeEnemyRespawnTime([EnemyType.Common], epoch)?.toString()).toBe(
      epoch.add(COMMON_ENEMY_RESPAWN_DURATION).toString(),
    );
  });

  test("a camp with an elite comes back at the next daily reset of the server's clock", () => {
    expect.hasAssertions();

    expect(computeEnemyRespawnTime([EnemyType.Common, EnemyType.Elite], epoch)?.toString()).toBe(
      nextDailyReset.toString(),
    );
    expect(computeEnemyRespawnTime([EnemyType.Elite], nextDailyReset)?.toString()).toBe(
      nextDailyReset.add({ hours: 24 }).toString(),
    );
  });

  test("a normal boss returns five seconds after its blossom is claimed", () => {
    expect.hasAssertions();

    expect(
      computeEnemyRespawnTime([EnemyType.Elite, EnemyType.Boss], epoch, { claimedAt: epoch, place })?.toString(),
    ).toBe(epoch.add(BOSS_RESPAWN_AFTER_CLAIM_DURATION).toString());
  });

  test("an unclaimed blossom keeps the boss defeated until the player teleports away", () => {
    expect.hasAssertions();

    const teleportedAt = epoch.add({ seconds: 1 });

    expect(computeEnemyRespawnTime([EnemyType.Elite, EnemyType.Boss], epoch, { place })).toBeUndefined();
    expect(
      computeEnemyRespawnTime([EnemyType.Elite, EnemyType.Boss], epoch, { place }, epoch.subtract({ seconds: 1 })),
    ).toBeUndefined();
    expect(computeEnemyRespawnTime([EnemyType.Elite, EnemyType.Boss], epoch, { place }, teleportedAt)?.toString()).toBe(
      teleportedAt.toString(),
    );
  });
});
