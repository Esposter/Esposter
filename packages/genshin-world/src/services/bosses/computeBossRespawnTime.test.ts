import { computeBossRespawnTime } from "#src/services/bosses/computeBossRespawnTime";
import { BOSS_RESPAWN_AFTER_CLAIM_DURATION } from "#src/services/bosses/constants";
import { describe, expect, test } from "vitest";

describe(computeBossRespawnTime, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");

  test("a claimed boss comes back its respawn duration after the claim", () => {
    expect.hasAssertions();

    expect(computeBossRespawnTime(epoch)?.toString()).toBe(epoch.add(BOSS_RESPAWN_AFTER_CLAIM_DURATION).toString());
  });

  test("an unclaimed boss has no respawn time, staying defeated until the player teleports away", () => {
    expect.hasAssertions();

    expect(computeBossRespawnTime(undefined)).toBeUndefined();
  });
});
