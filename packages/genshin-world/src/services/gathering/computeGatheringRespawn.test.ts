import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import { computeGatheringRespawn } from "#src/services/gathering/computeGatheringRespawn";
import { describe, expect, test } from "vitest";

describe(computeGatheringRespawn, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);

  test("a specialty comes back after its duration, whatever the hour it was picked", () => {
    expect.hasAssertions();
    expect(computeGatheringRespawn(epoch, GatheringRespawn.Specialty)).toStrictEqual(epoch.add({ hours: 46 }));
  });

  test("a daily point comes back at the game's midnight after the pick, 00:00 in the game's time zone", () => {
    expect.hasAssertions();
    // The epoch is 08:00 on 1 January in UTC+8, so a pick at 18:00 that day comes back at midnight, 16 hours after it
    expect(computeGatheringRespawn(epoch.add({ hours: 10 }), GatheringRespawn.Daily)).toStrictEqual(
      epoch.add({ hours: 16 }),
    );
  });

  test("a daily point picked before midnight comes back at it, and one picked at it at the next", () => {
    expect.hasAssertions();
    // A pick at 23:00 on 1 January falls before that midnight, which the point comes back at
    expect(computeGatheringRespawn(epoch.add({ hours: 15 }), GatheringRespawn.Daily)).toStrictEqual(
      epoch.add({ hours: 16 }),
    );
    // A pick exactly at midnight is after it, so the point comes back at the midnight of the day after
    expect(computeGatheringRespawn(epoch.add({ hours: 16 }), GatheringRespawn.Daily)).toStrictEqual(
      epoch.add({ hours: 40 }),
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
