import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import { computeGatheringRespawn } from "#src/services/gathering/computeGatheringRespawn";
import { describe, expect, test } from "vitest";

describe(computeGatheringRespawn, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);

  test("a specialty comes back after its duration, whatever the hour it was picked", () => {
    expect.hasAssertions();
    expect(computeGatheringRespawn(epoch, GatheringRespawn.Specialty)).toStrictEqual(epoch.add({ hours: 46 }));
  });

  test("a daily point comes back at the game's midnight after the pick, in the game's time zone", () => {
    expect.hasAssertions();
    // Midnight in UTC+8 falls at 16:00 UTC, so a pick at 10:00 UTC on the first day comes back at 16:00 UTC that day
    expect(computeGatheringRespawn(epoch.add({ hours: 10 }), GatheringRespawn.Daily)).toStrictEqual(
      epoch.add({ hours: 16 }),
    );
  });
});
