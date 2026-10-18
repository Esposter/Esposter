import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import { computeGatheringRespawn } from "#src/services/gathering/computeGatheringRespawn";
import { describe, expect, test } from "vitest";

describe(computeGatheringRespawn, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);

  test("a specialty comes back after its duration, whatever the hour it was picked", () => {
    expect.hasAssertions();
    expect(computeGatheringRespawn(epoch, GatheringRespawn.Specialty)).toStrictEqual(epoch.add({ hours: 46 }));
  });

  test("a daily point comes back at the first daily reset after the pick, 04:00 in the game's time zone", () => {
    expect.hasAssertions();
    // The epoch is 08:00 on 1 January in UTC+8, so the reset at or before a pick at 18:00 that day is 04:00 that day, and the
    // Next one is 04:00 on 2 January, 20 hours after the epoch
    expect(computeGatheringRespawn(epoch.add({ hours: 10 }), GatheringRespawn.Daily)).toStrictEqual(
      epoch.add({ hours: 20 }),
    );
  });

  test("a daily point picked before the day's reset comes back at that reset, and one picked at it at the next", () => {
    expect.hasAssertions();
    // 02:00 on 1 January in UTC+8 falls before that day's 04:00 reset, which the point comes back at
    expect(computeGatheringRespawn(epoch.subtract({ hours: 6 }), GatheringRespawn.Daily)).toStrictEqual(
      epoch.subtract({ hours: 4 }),
    );
    // A pick exactly at the reset is after it, so the point comes back at the reset of the day after
    expect(computeGatheringRespawn(epoch.subtract({ hours: 4 }), GatheringRespawn.Daily)).toStrictEqual(
      epoch.add({ hours: 20 }),
    );
  });

  test("an ore comes back two days or three days after it breaks, whatever the hour", () => {
    expect.hasAssertions();
    expect(computeGatheringRespawn(epoch.add({ hours: 10 }), GatheringRespawn.TwoDays)).toStrictEqual(
      epoch.add({ hours: 58 }),
    );
    expect(computeGatheringRespawn(epoch.add({ hours: 10 }), GatheringRespawn.ThreeDays)).toStrictEqual(
      epoch.add({ hours: 82 }),
    );
  });
});
